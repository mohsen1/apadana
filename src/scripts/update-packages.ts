import { execSync } from 'child_process';
import fs from 'fs';
import { parseArgs } from 'node:util';

const { values } = parseArgs({
  options: {
    limit: {
      type: 'string',
      short: 'l',
    },
  },
});

const packageLimit = values.limit ? parseInt(values.limit, 10) : 0;

async function updatePackages() {
  // Run npm-check-updates and capture the output
  const ncu = execSync('pnpm exec npm-check-updates --format json').toString();
  const updates = JSON.parse(ncu) as {
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
  };

  // Filter and limit the updates if a limit is set
  const packagesToUpdate = Object.entries(updates.dependencies || {})
    .slice(0, packageLimit || undefined) // if limit is 0, undefined means no limit
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {} as Record<string, string>);

  // Generate the summary for the PR
  const summary = generateUpdateSummary(packagesToUpdate);
  fs.writeFileSync('package-updates-summary.md', summary);

  // Update the packages
  if (Object.keys(packagesToUpdate).length > 0) {
    const updateCommand = Object.entries(packagesToUpdate)
      .map(([pkg, version]) => `${pkg}@${version}`)
      .join(' ');

    execSync(`pnpm add ${updateCommand} --save-exact`, { stdio: 'inherit' });
    execSync('pnpm install', { stdio: 'inherit' });

    // Stage and commit the changes
    execSync('git add package.json pnpm-lock.yaml', { stdio: 'inherit' });
    execSync('git commit -m "chore(deps): update dependencies"', { stdio: 'inherit' });
  }
}

function generateUpdateSummary(updates: Record<string, string>) {
  const totalUpdates = Object.keys(updates).length;
  let summary = `# Package Updates\n\n`;
  summary += `${totalUpdates} package(s) have been updated.\n\n`;

  if (totalUpdates > 0) {
    summary += '## Changes\n\n';
    summary += '| Package | New Version |\n';
    summary += '|---------|-------------|\n';

    Object.entries(updates).forEach(([pkg, version]) => {
      summary += `| \`${pkg}\` | \`${version}\` |\n`;
    });
  }

  return summary;
}

void updatePackages();
