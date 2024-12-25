/**
 * This script reads all text-based files in a Git repository or a specified directory,
 * splits them into chunks based on size, and writes those chunks to disk in a structured format.
 * It also calculates a checksum to keep track of repository state.
 */

import { execSync } from 'child_process';
import crypto from 'crypto';
import fs from 'fs/promises';
import ignore, { Ignore } from 'ignore';
import _ from 'lodash';
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import logger from '@/utils/logger';

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
 * Writes a chunk of files to a text file.
 * @param files The list of files to include in the chunk
 * @param index The index of the chunk
 * @param outputDir The directory to write the chunk file to
 */
async function writeChunk(files: FileEntry[], index: number, outputDir: string): Promise<void> {
  const chunk = files.map((file) => `>>>> ${file.path}\n${file.content}`).join('\n\n');
  const outputPath = path.join(outputDir, `chunk-${index}.txt`);
  await fs.writeFile(outputPath, chunk, 'utf-8');
  logger.info(`Written chunk ${index} with ${files.length} files`);
}

/**
 * Options controlling repository serialization behavior.
 */
interface SerializeOptions {
  /** Maximum chunk size in megabytes. Use Infinity for a single-chunk output */
  chunkSizeMB: number;
  /** Base path to serialize. Defaults to the current working directory if omitted */
  basePath?: string;
}

/**
 * Serializes text-based files in a repository or subdirectory into chunks.
 * Each chunk is written as a single text file containing multiple file contents.
 * @param options The serialization options including chunk size and optional base path
 * @returns The output directory path where all chunk files are stored
 */
async function serializeRepo(options: SerializeOptions): Promise<string> {
  const { chunkSizeMB, basePath } = options;
  const checksum = await getRepoChecksum(chunkSizeMB);
  const pathSuffix = basePath ? `_${path.basename(basePath)}` : '';
  const dirName =
    chunkSizeMB === Infinity
      ? `${checksum}${pathSuffix}`
      : `${checksum}${pathSuffix}_${chunkSizeMB}mb`;
  const outputDir = path.join(process.cwd(), 'repo-serialized', dirName);

  await fs.mkdir(outputDir, { recursive: true });

  const ig = await readGitignore();
  const files: FileEntry[] = [];
  let currentChunkSize = 0;
  let chunkIndex = 0;

  const startPath = basePath ? path.resolve(process.cwd(), basePath) : process.cwd();

  for await (const filePath of walkDirectory(startPath, ig, startPath)) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const fileSize = Buffer.byteLength(content, 'utf-8');

      if (currentChunkSize + fileSize > chunkSizeMB * 1024 * 1024) {
        // Write current chunk
        await writeChunk(files, chunkIndex++, outputDir);
        files.length = 0;
        currentChunkSize = 0;
      }

      files.push({
        path: path.relative(process.cwd(), filePath),
        content,
      });
      currentChunkSize += fileSize;
    } catch (error) {
      assertError(error);
      logger.error(`Error processing file ${filePath}:`, error.message);
    }
  }

  // Write final chunk if there are remaining files
  if (files.length > 0) {
    await writeChunk(files, chunkIndex, outputDir);
  }

  return outputDir;
}

/**
 * Parses command-line arguments and validates them.
 * @returns The parsed options including chunk size and base path
 */
const argv = yargs(hideBin(process.argv))
  .option('size', {
    alias: 's',
    type: 'number',
    description: 'Chunk size in megabytes',
    default: Infinity,
  })
  .option('path', {
    alias: 'p',
    type: 'string',
    description: 'Base path to serialize (optional)',
  })
  .example('pnpm serialize-repo', 'Serialize entire repository into a single file')
  .example('pnpm serialize-repo -s 10', 'Split repository into 10MB chunks')
  .example('pnpm serialize-repo -p src/app', 'Serialize only the src/app directory')
  .example('pnpm serialize-repo -s 5 -p src/components', 'Split src/components into 5MB chunks')
  .check(async (argv) => {
    if (isNaN(argv.size) || argv.size <= 0) {
      throw new Error('Please provide a valid chunk size in megabytes');
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
  const { size, path: basePath } = await argv;
  logger.info(
    `Serializing repo from ${basePath || 'root'} ${size !== Infinity ? ` with chunk size ${size}MB` : ''}`,
  );
  const outputDir = await serializeRepo({ chunkSizeMB: size, basePath });

  logger.info(`✨ Repository serialized successfully!`);

  if (size !== Infinity) {
    const files = await fs.readdir(outputDir);
    logger.info(`Generated chunks:`);
    for (const file of files) {
      logger.info(path.join(outputDir, file));
    }
  } else {
    logger.info(`Outputed file:`);
    logger.info(path.join(outputDir, 'chunk-0.txt'));
  }
}

void main();
