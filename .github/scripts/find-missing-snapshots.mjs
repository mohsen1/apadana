/* eslint-disable no-console */
/// <reference types="./core.d.ts" />
import fs from 'fs';
import path from 'path';

// Possible to add other paths here in future
const baseDir = 'src/storybook-e2e/__screenshots__/storybook-screenshots.spec.ts';

/**
 * Get all files in a directory
 * @param {string} dir - The directory to get files from
 * @returns {string[]} - An array of file paths
 */
function getAllFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files.push(...getAllFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Find missing snapshot files
 * @returns {string[]} - An array of missing file paths
 */
export async function findMissingFiles() {
  if (!fs.existsSync(path.join(baseDir, 'linux')) || !fs.existsSync(path.join(baseDir, 'darwin'))) {
    console.log(`Nothing in ${baseDir}`);
    return '';
  }

  const darwinFiles = getAllFiles(path.join(baseDir, 'darwin'));
  const missingFiles = darwinFiles
    .map((file) => path.relative(path.join(baseDir, 'darwin'), file))
    .filter((relPath) => !fs.existsSync(path.join(baseDir, 'linux', relPath)));

  // eslint-disable-next-line no-undef
  core.setOutput('MISSING_SNAPSHOT_FILES', JSON.stringify(missingFiles));
  console.log('Missing files:', missingFiles);
}
