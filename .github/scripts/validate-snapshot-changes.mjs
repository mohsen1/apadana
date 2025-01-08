/* eslint-disable no-console */
import { core } from '@actions/core';
import { execSync } from 'child_process';

export async function validateSnapshotChanges() {
  /** @type {string[]} */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const missingFiles = JSON.parse(process.env.MISSING_SNAPSHOT_FILES).sort();

  const changedFiles = execSync('git diff --name-only HEAD^ HEAD')
    .toString()
    .split('\n')
    .filter((file) =>
      file.match(/src\/storybook-e2e\/__screenshots__\/storybook-screenshots\.spec\.ts\/linux\//),
    )
    .sort();

  if (JSON.stringify(missingFiles) !== JSON.stringify(changedFiles)) {
    console.log('Changed files:', changedFiles);
    console.log('Missing files:', missingFiles);

    core.setFailed('Changed files do not match exactly with missing files list');
  }
}
