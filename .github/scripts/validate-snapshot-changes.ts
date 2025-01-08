/* eslint-disable no-console */
import { execSync } from 'child_process';

export async function validateSnapshotChanges() {
  const missingFiles = (JSON.parse(process.env.MISSING_SNAPSHOT_FILES || '[]') as string[]).sort();
  let changedFiles: string[] = [];

  try {
    // Get all parents of HEAD
    const parents = execSync('git rev-list --parents -n 1 HEAD', { stdio: 'pipe' })
      .toString()
      .trim()
      .split(' ')
      .slice(1);

    // If there's more than one parent, it's likely a merge commit
    // Use the first parent for a diff
    const diffParent = parents.length > 0 ? parents[0] : 'HEAD^';

    changedFiles = execSync(`git diff --name-only ${diffParent} HEAD`)
      .toString()
      .split('\n')
      .map((file) => file.trim())
      .filter(Boolean)
      .filter((file) =>
        /src\/storybook-e2e\/__screenshots__\/storybook-screenshots\.spec\.ts\/linux\//.test(file),
      )
      .sort();
  } catch {
    // Fallback for no previous commit or shallow clone
    changedFiles = missingFiles;
  }

  if (JSON.stringify(missingFiles) !== JSON.stringify(changedFiles)) {
    throw new Error(
      `Changed files do not match missing files list:
changedFiles:
${changedFiles.join('\n')}
missingFiles:
${missingFiles.join('\n')}`,
    );
  }
}

if (require.main === module) {
  validateSnapshotChanges().catch((error) => {
    console.error('Error validating snapshot changes:', error);
    throw new Error(`Failed to validate snapshot changes: ${error}`);
  });
}
