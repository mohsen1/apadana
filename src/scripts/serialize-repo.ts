/**
 * This script reads all text-based files in a Git repository or a specified directory,
 * splits them into chunks based on size, and writes those chunks to disk in a structured format.
 * It also calculates a checksum to keep track of repository state.
 * Files are prioritized based on their importance to the codebase.
 */

import { execSync } from 'child_process';
import crypto from 'crypto';
import fs from 'fs/promises';
import ignore, { Ignore } from 'ignore';
import _ from 'lodash';
import openaiTokenCounter, { ModelType as OldModelTypes } from 'openai-gpt-token-counter';
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import logger from '@/utils/logger';

type ModelType =
  | 'chatgpt-4o-latest'
  | 'gpt-4'
  | 'gpt-4-32k'
  | 'gpt-3.5-turbo'
  | 'gpt-3.5-turbo-16k'
  | 'o1'
  | 'o1-mini';

/**
 * Set of known file extensions that are typically binary.
 * Files with these extensions won't be read for textual content.
 */
// prettier-ignore
const BINARY_FILE_EXTENSIONS = new Set([
  '.jpg',       '.pdf',      '.mid',      '.blend',    '.p12',      '.rco',      '.tgz',
  '.jpeg',      '.mp4',      '.midi',     '.crt',      '.p7b',      '.ovl',      '.bz2',
  '.png',       '.webm',     '.aac',      '.key',      '.gbr',      '.mo',       '.xz',
  '.gif',       '.mov',      '.flac',     '.pem',      '.pcb',      '.nib',      '.dat',
  '.ico',       '.mp3',      '.bmp',      '.der',      '.icns',     '.xap',      '.lib',
  '.webp',      '.wav',      '.psd',      '.png2',     '.xdf',      '.psf',      '.jar',
  '.ttf',       '.exe',      '.ai',       '.jp2',      '.zip',      '.pak',      '.vhd',
  '.woff',      '.dll',      '.eps',      '.swc',      '.rar',      '.img3',     '.gho',
  '.woff2',     '.bin',      '.raw',      '.mso',      '.7z',       '.img4',     '.efi',
  '.eot',       '.iso',      '.tif',      '.class',    '.gz',       '.msi',      '.ocx',
  '.sys',       '.img',      '.tiff',     '.apk',      '.tar',      '.cab',      '.scr',
  '.so',        '.dmg',      '.3ds',      '.com',      '.elf',
  '.o',         '.max',      '.obj',      '.drv',      '.rom',
  '.a',         '.vhdx',     '.fbx',      '.bpl',      '.cpl',
]);

/**
 * Represents a single file entry with its path and content.
 */
interface FileEntry {
  /** Relative file path */
  path: string;
  /** File content as a string */
  content: string;
}

/**
 * Narrows any unknown type error to a standard Error object.
 * @param error The unknown type to be asserted
 * @throws {Error} Throws if the provided error is not an instance of Error
 */
function assertError(error: unknown): asserts error is Error {
  if (!(error instanceof Error)) throw new Error('Unknown error type');
}

/**
 * Reads the .gitignore file to configure file exclusion for the repository.
 * @returns An Ignore instance configured with the .gitignore rules
 */
async function readGitignore(): Promise<Ignore> {
  const ig = ignore();
  try {
    const gitignore = await fs.readFile('.gitignore', 'utf-8');
    ig.add(gitignore);
  } catch (error) {
    assertError(error);
    logger.warn('No .gitignore found, proceeding without it:', error.message);
  }
  return ig;
}

/**
 * Checks if a file is a text file based on its extension or content.
 * @param filePath The path to the file to check
 * @returns True if the file is a text file, false otherwise
 */
async function isTextFile(filePath: string): Promise<boolean> {
  const ext = path.extname(filePath).toLowerCase();
  if (BINARY_FILE_EXTENSIONS.has(ext)) return false;

  try {
    // Read first 4KB to detect binary content
    const fd = await fs.open(filePath, 'r');
    const buffer = Buffer.alloc(4096);
    const { bytesRead } = await fd.read(buffer, 0, 4096, 0);
    await fd.close();

    // Check for null bytes which typically indicate binary content
    for (let i = 0; i < bytesRead; i++) {
      if (buffer[i] === 0) return false;
    }
    return true;
  } catch (error) {
    assertError(error);
    logger.error('Error checking file type:', error.message);
    return false;
  }
}

/**
 * Recursively walks through a directory and yields file paths.
 * @param dir The directory to walk through
 * @param ig The Ignore instance to apply for file exclusion
 * @param basePath The base path to limit the search
 * @param base The current base path for relative paths
 * @returns An async generator of file paths
 */
async function* walkDirectory(
  dir: string,
  ig: Ignore,
  basePath?: string,
  base = '',
): AsyncGenerator<string> {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const relativePath = path.join(base, entry.name);
    const fullPath = path.join(dir, entry.name);

    // Skip if path is outside basePath
    if (basePath && !fullPath.startsWith(basePath)) continue;
    if (ig.ignores(relativePath)) continue;

    if (entry.isDirectory()) {
      yield* walkDirectory(fullPath, ig, basePath, relativePath);
    } else if (entry.isFile() && (await isTextFile(fullPath))) {
      yield fullPath;
    }
  }
}

/**
 * Calculates a checksum for the current repository state.
 * @param chunkSize The maximum chunk size in megabytes
 * @returns A string checksum of the repository state
 */
async function getRepoChecksum(chunkSize: number): Promise<string> {
  try {
    // Get list of tracked files excluding ignored ones
    const trackedFiles = execSync('git ls-files -c --exclude-standard')
      .toString()
      .trim()
      .split('\n')
      .sort();

    // Create a hash combining git state of tracked files
    const hash = crypto.createHash('sha256');

    for (const file of trackedFiles) {
      try {
        const fileHash = execSync(`git hash-object "${file}"`).toString().trim();
        hash.update(`${file}:${fileHash}\n`);
      } catch (error) {
        assertError(error);
        // Skip files that can't be hashed
        continue;
      }
    }

    // Add chunk size to hash if not Infinity
    if (chunkSize !== Infinity) {
      hash.update(chunkSize.toString());
    }

    return hash.digest('hex').slice(0, 8);
  } catch (error) {
    assertError(error);
    logger.warn('Not a git repository, using timestamp as fallback:', error.message);
    return Date.now().toString(36);
  }
}

/**
 * Counts tokens or characters in a text string
 */
function countSize(text: string, options: { countTokens: boolean; model: ModelType }): number {
  if (options.countTokens) {
    return openaiTokenCounter.text(text, options.model as OldModelTypes);
  }
  return Buffer.byteLength(text, 'utf-8');
}

/**
 * Formats a byte size into a human-readable string
 */
function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Formats a size value based on type (bytes or tokens)
 */
function formatSize(size: number, isTokens: boolean): string {
  if (isTokens) {
    return size.toLocaleString() + ' tokens';
  }
  return formatBytes(size);
}

/**
 * Writes a chunk of files to a text file or streams to stdout.
 */
async function writeChunk(
  files: FileEntry[],
  index: number,
  outputDir: string,
  options: { model: ModelType; stream: boolean; countTokens: boolean },
): Promise<number> {
  const chunk = files.map((file) => `>>>> ${file.path}\n${file.content}`).join('\n\n');
  const size = countSize(chunk, { countTokens: options.countTokens, model: options.model });

  if (options.stream) {
    process.stdout.write(chunk);
  } else {
    const outputPath = path.join(outputDir, `chunk-${index}.txt`);
    await fs.writeFile(outputPath, chunk, 'utf-8');
    logger.info(
      `Written chunk ${index} with ${files.length} files (${formatSize(size, options.countTokens)})`,
    );
  }

  return size;
}

/**
 * Options controlling repository serialization behavior.
 */
interface SerializeOptions {
  /** Maximum tokens per chunk. Use Infinity for a single-chunk output */
  maxTokens: number;
  /** Base path to serialize. Defaults to the current working directory if omitted */
  basePath?: string;
  /** OpenAI model to use for token counting. Defaults to gpt-4o-latest */
  model?: ModelType;
  /** Whether to stream output to stdout instead of writing to files */
  stream?: boolean;
  /** Whether to count tokens. If false, maxTokens will be treated as character count */
  countTokens?: boolean;
}

/**
 * Priority scoring for different file types and paths
 */
const PRIORITY_SCORES = {
  // Database schema (highest priority)
  SCHEMA: {
    score: 100,
    patterns: [/^prisma\/schema\.prisma$/],
  },
  // Core configuration files (very high priority)
  CONFIG_FILES: {
    score: 95,
    patterns: [
      /^package\.json$/,
      /^pnpm-lock\.yaml$/,
      /^tsconfig\.json$/,
      /^config\/next\.config\.ts$/,
      /^config\/tailwind\.config\.ts$/,
      /^config\/eslint\.config\.mjs$/,
      /^config\/vitest\.config\.ts$/,
      /^\.env\.example$/,
      /^\.gitignore$/,
      /^README\.md$/,
      /^vercel\.json$/,
      /^components\.json$/,
    ],
  },
  // Core business logic (very high priority)
  CORE_LOGIC: {
    score: 90,
    patterns: [
      /^src\/lib\//,
      /^src\/utils\//,
      /^src\/contexts\//,
      /^src\/hooks\//,
      /^src\/constant\//,
      /^src\/shared\//,
    ],
  },
  // Core app and API routes
  APP_ROUTES: {
    score: 85,
    patterns: [
      /^src\/app\/api\//,
      /^src\/app\/layout\.tsx$/,
      /^src\/app\/page\.tsx$/,
      /^src\/app\/error\.tsx$/,
      /^src\/app\/not-found\.tsx$/,
    ],
  },
  // Feature routes and components
  FEATURES: {
    score: 80,
    patterns: [/^src\/app\/.*\.tsx$/, /^src\/components\/(?!ui|emails|.*\.stories\.[jt]sx?$)/],
  },
  // UI Components and Design System
  UI: {
    score: 75,
    patterns: [
      /^src\/components\/ui\//,
      /^src\/app\/.*\/.*\.tsx$/,
      /^src\/design-system\/(?!.*\.stories\.[jt]sx?$)/,
      /^src\/styles\//,
    ],
  },
  // Database migrations and seeds
  DATABASE: {
    score: 70,
    patterns: [/^prisma\/migrations\//, /^prisma\/seed\.ts$/, /^src\/prisma\//],
  },
  // Tests and E2E
  TESTS: {
    score: 65,
    patterns: [
      /^src\/e2e\//,
      /^src\/__tests__\//,
      /^src\/.*\.test\.[jt]sx?$/,
      /^src\/.*\.spec\.[jt]sx?$/,
      /^src\/__mocks__\//,
    ],
  },
  // Build and deployment
  BUILD: {
    score: 60,
    patterns: [/^\.github\//, /^src\/docker\//, /^src\/scripts\//, /^config\//],
  },
  // Stories and Email templates (lower priority)
  STORIES_AND_EMAILS: {
    score: 55,
    patterns: [/^src\/.*\.stories\.[jt]sx?$/, /^src\/components\/emails\//],
  },
  // Public assets (lowest priority)
  ASSETS: {
    score: 50,
    patterns: [/^public\//],
  },
  // Default score for unmatched files
  DEFAULT: {
    score: 40,
    patterns: [/.*/],
  },
};

/**
 * Files to completely ignore during serialization
 */
const IGNORE_PATTERNS = [
  // Generated files
  /^\.next\//,
  /^node_modules\//,
  /\.gitignore/,
  /pnpm-lock\.yaml/,
  /^\.vercel\//,
  /^\.turbo\//,
  /^coverage\//,
  /serialize-repo/,
  /^storybook-static\//,
  /^storybook-e2e-html-report\//,
  /^storybook-e2e-test-results\//,
  /^test-results\//,
  // Binary and large files
  /\.(jpg|jpeg|png|gif|ico|woff|woff2|ttf|eot)$/,
  /\.(mp4|webm|ogg|mp3|wav|flac|aac)$/,
  /\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$/,
  /\.(zip|tar|gz|tgz|rar|7z)$/,
  // Temporary and cache files
  /\.DS_Store$/,
  /Thumbs\.db$/,
  /\.env\.local$/,
  /\.env\.development\.local$/,
  /\.env\.test\.local$/,
  /\.env\.production\.local$/,
  /test\.env$/,
];

/**
 * Calculate priority score for a file path
 */
function getFilePriority(filePath: string): number {
  // Check if file should be ignored
  if (IGNORE_PATTERNS.some((pattern) => pattern.test(filePath))) {
    return -1;
  }

  // Find highest matching priority score
  for (const { patterns, score } of Object.values(PRIORITY_SCORES)) {
    if (patterns.some((pattern) => pattern.test(filePath))) {
      return score;
    }
  }

  return PRIORITY_SCORES.DEFAULT.score;
}

/**
 * Serializes text-based files in a repository or subdirectory into chunks.
 */
async function serializeRepo(options: SerializeOptions): Promise<string | undefined> {
  const {
    maxTokens,
    basePath,
    model = 'chatgpt-4o-latest',
    stream = false,
    countTokens: shouldCountTokens = false,
  } = options;
  let outputDir: string | undefined;

  if (!stream) {
    const checksum = await getRepoChecksum(maxTokens);
    const pathSuffix = basePath ? `_${path.basename(basePath)}` : '';
    const sizeType = shouldCountTokens ? 'tokens' : 'bytes';
    const dirName =
      maxTokens === Infinity
        ? `${checksum}${pathSuffix}`
        : `${checksum}${pathSuffix}_${maxTokens}${sizeType}`;
    outputDir = path.join(process.cwd(), 'repo-serialized', dirName);
    await fs.mkdir(outputDir, { recursive: true });
  }

  const ig = await readGitignore();
  const files: FileEntry[] = [];
  let currentSize = 0;
  let chunkIndex = 0;
  let totalSize = 0;

  const startPath = basePath ? path.resolve(process.cwd(), basePath) : process.cwd();

  // Collect all files first
  const allFiles: { path: string; priority: number }[] = [];
  for await (const filePath of walkDirectory(startPath, ig, startPath)) {
    const priority = getFilePriority(path.relative(process.cwd(), filePath));
    if (priority >= 0) {
      allFiles.push({ path: filePath, priority });
    }
  }

  // Sort files by priority (highest first)
  const sortedFiles = _.sortBy(allFiles, (file) => -file.priority);

  // Process files in priority order
  for (const { path: filePath } of sortedFiles) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const fileSize = countSize(`>>>> ${path.relative(process.cwd(), filePath)}\n${content}`, {
        countTokens: shouldCountTokens,
        model,
      });

      if (currentSize + fileSize > maxTokens) {
        // Write current chunk
        const chunkSize = await writeChunk(files, chunkIndex++, outputDir || '', {
          model,
          stream,
          countTokens: shouldCountTokens,
        });
        totalSize += chunkSize;
        files.length = 0;
        currentSize = 0;
      }

      files.push({
        path: path.relative(process.cwd(), filePath),
        content,
      });
      currentSize += fileSize;
    } catch (error) {
      assertError(error);
      logger.error(`Error processing file ${filePath}:`, error.message);
    }
  }

  // Write final chunk if there are remaining files
  if (files.length > 0) {
    const chunkSize = await writeChunk(files, chunkIndex, outputDir || '', {
      model,
      stream,
      countTokens: shouldCountTokens,
    });
    totalSize += chunkSize;
  }

  if (!stream) {
    const sizeType = shouldCountTokens ? 'tokens' : 'bytes';
    logger.info(`Total size: ${formatSize(totalSize, shouldCountTokens)} ${sizeType}`);
    return outputDir;
  }
  return undefined;
}

/**
 * Parses command-line arguments and validates them.
 */
const argv = yargs(hideBin(process.argv))
  .option('tokens', {
    alias: 't',
    type: 'number',
    description: 'Maximum tokens/bytes per chunk (default: Infinity)',
    default: Infinity,
  })
  .option('path', {
    alias: 'p',
    type: 'string',
    description: 'Base path to serialize (optional)',
  })
  .option('model', {
    alias: 'm',
    type: 'string',
    description: 'OpenAI model to use for token counting',
    default: 'chatgpt-4o-latest' as ModelType,
    choices: [
      'chatgpt-4o-latest',
      'gpt-4',
      'gpt-4-32k',
      'gpt-3.5-turbo',
      'gpt-3.5-turbo-16k',
      'o1',
      'o1-mini',
    ] as ModelType[],
  })
  .option('count-tokens', {
    alias: 'c',
    type: 'boolean',
    description: 'Count tokens instead of bytes (slower but more accurate)',
    default: false,
  })
  .option('stream', {
    alias: 's',
    type: 'boolean',
    description: 'Stream output to stdout instead of writing to files',
    default: false,
  })
  .example('pnpm serialize-repo', 'Serialize entire repository into a single file')
  .example('pnpm serialize-repo -t 128000', 'Split repository into chunks of max 128KB')
  .example('pnpm serialize-repo -t 128000 -c', 'Split into chunks of max 128K tokens (slower)')
  .example('pnpm serialize-repo -p src/app', 'Serialize only the src/app directory')
  .example('pnpm serialize-repo -s | pbcopy', 'Stream output to clipboard on macOS')
  .check(async (argv) => {
    if (isNaN(argv.tokens) || argv.tokens <= 0) {
      throw new Error('Please provide a valid token limit');
    }

    if (
      argv.path &&
      !(await fs
        .access(argv.path)
        .then(() => true)
        .catch(() => false))
    ) {
      throw new Error('Provided path does not exist');
    }

    return true;
  })
  .help().argv;

/**
 * Main entry point. Parses command-line options, then serializes the repository.
 */
async function main() {
  try {
    const { tokens, path: basePath, model, stream, countTokens } = await argv;
    if (!stream) {
      const limit =
        tokens === Infinity ? '' : ` with max ${formatSize(tokens, countTokens)} per chunk`;
      logger.info(
        `Serializing repo from ${basePath || 'root'}${limit}${
          countTokens ? ` using ${model} with token counting` : ''
        }`,
      );
    }

    const outputDir = await serializeRepo({
      maxTokens: tokens,
      basePath,
      model,
      stream,
      countTokens,
    });

    if (!stream) {
      logger.info(`✨ Repository serialized successfully!`);

      if (tokens !== Infinity) {
        const files = await fs.readdir(outputDir!);
        logger.info(`Generated chunks:`);
        for (const file of files) {
          logger.info(path.join(outputDir!, file));
        }
      } else {
        logger.info(`Outputed file:`);
        logger.info(path.join(outputDir!, 'chunk-0.txt'));
      }
    }
    process.exit(0);
  } catch (error) {
    assertError(error);
    logger.error('Failed to serialize repository:', error.message);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  assertError(error);
  logger.error('Unhandled promise rejection:', error.message);
  process.exit(1);
});

void main();
