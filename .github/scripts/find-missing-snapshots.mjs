/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';

const workspaceRoot = process.env.WORKSPACE_ROOT ? process.env.WORKSPACE_ROOT : process.cwd();
const baseDir = path.join(
  workspaceRoot,
  // Possible to add other paths here in future
  'src/storybook-e2e/__screenshots__/storybook-screenshots.spec.ts',
);

/**
 * Find missing snapshot files
 * @returns {string[]} - An array of missing file paths
 */
export async function findMissingFiles() {
  const darwinFiles = fs.readdirSync(path.join(baseDir, 'darwin'), { withFileTypes: true });
  const missingFiles = darwinFiles
    .map((file) => path.relative(path.join(baseDir, 'darwin'), file))
    .filter((relPath) => !fs.existsSync(path.join(baseDir, 'linux', relPath)));

  // eslint-disable-next-line no-undef, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  core.setOutput('MISSING_SNAPSHOT_FILES', JSON.stringify(missingFiles));
  console.log('Missing files:', missingFiles);
}
