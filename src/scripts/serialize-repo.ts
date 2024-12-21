import { execSync } from 'child_process';
import crypto from 'crypto';
import fs from 'fs/promises';
import ignore, { Ignore } from 'ignore';
import _ from 'lodash';
import path from 'path';

import logger from '@/utils/logger';

const BINARY_FILE_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.ico',
  '.webp',
  '.pdf',
  '.mp4',
  '.webm',
  '.mov',
  '.mp3',
  '.wav',
  '.ttf',
  '.woff',
  '.woff2',
  '.eot',
]);

interface FileEntry {
  path: string;
  content: string;
}

function assertError(error: unknown): asserts error is Error {
  if (!(error instanceof Error)) throw new Error('Unknown error type');
}

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

async function* walkDirectory(dir: string, ig: Ignore, base = ''): AsyncGenerator<string> {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const relativePath = path.join(base, entry.name);
    const fullPath = path.join(dir, entry.name);

    if (ig.ignores(relativePath)) continue;

    if (entry.isDirectory()) {
      yield* walkDirectory(fullPath, ig, relativePath);
    } else if (entry.isFile() && (await isTextFile(fullPath))) {
      yield fullPath;
    }
  }
}

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

async function writeChunk(files: FileEntry[], index: number, outputDir: string): Promise<void> {
  const chunk = files.map((file) => `### ${file.path}\n${file.content}`).join('\n\n');
  const outputPath = path.join(outputDir, `chunk-${index}.txt`);
  await fs.writeFile(outputPath, chunk, 'utf-8');
  logger.info(`Written chunk ${index} with ${files.length} files`);
}

async function serializeRepo(chunkSizeMB: number): Promise<string> {
  const checksum = await getRepoChecksum(chunkSizeMB);
  const dirName = chunkSizeMB === Infinity ? checksum : `${checksum}_${chunkSizeMB}mb`;
  const outputDir = path.join(process.cwd(), 'repo-serialized', dirName);

  await fs.mkdir(outputDir, { recursive: true });

  const ig = await readGitignore();
  const files: FileEntry[] = [];
  let currentChunkSize = 0;
  let chunkIndex = 0;

  for await (const filePath of walkDirectory(process.cwd(), ig)) {
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

// Handle CLI argument
const chunkSize = Number(process.argv[2]) || Infinity;
if (isNaN(chunkSize) || chunkSize <= 0) {
  logger.error('Please provide a valid chunk size in megabytes');
  process.exit(1);
}

serializeRepo(chunkSize)
  .then((outputDir) => {
    logger.info(`✨ Repository serialized successfully!`);
    logger.info(`📁 Output location: ${outputDir}`);
    logger.info(`📝 Use 'ls ${outputDir}' to see the chunks`);
  })
  .catch((error) => {
    assertError(error);
    logger.error('Failed to serialize repository:', error.message);
    process.exit(1);
  });
