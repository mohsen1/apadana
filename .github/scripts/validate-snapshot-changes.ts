/* eslint-disable no-console */
import { execSync } from 'child_process';

export async function validateSnapshotChanges() {
  const missingFiles = (JSON.parse(process.env.MISSING_SNAPSHOT_FILES || '[]') as string[]).sort();

  const changedFiles = execSync('git diff --name-only HEAD^ HEAD')
    .toString()
    .split('\n')
    .filter((file) =>
      file.match(/src\/storybook-e2e\/__screenshots__\/storybook-screenshots\.spec\.ts\/linux\//),
    )
    .sort();

  if (JSON.stringify(missingFiles) !== JSON.stringify(changedFiles)) {
    throw new Error(
      `Changed files do not match exactly with missing files list:\nchangedFiles: ${changedFiles.join(
        '\n',
      )}\nmissingFiles: ${missingFiles.join('\n')}`,
    );
  }
}

if (require.main === module) {
  validateSnapshotChanges().catch((error) => {
    console.error('Error validating snapshot changes:', error);
    throw new Error(`Failed to validate snapshot changes: ${error}`);
  });
}
