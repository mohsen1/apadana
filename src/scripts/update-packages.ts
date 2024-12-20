import chalk from 'chalk';
import { exec as execCallback } from 'child_process';
import { promisify } from 'util';

import { assertError } from '@/utils';
import logger from '@/utils/logger';

const exec = promisify(execCallback);

async function execCommand(command: string, args: string[]) {
  try {
    const { stdout, stderr } = await exec(`${command} ${args.join(' ')}`, {
      // @ts-expect-error stdio is not a valid option for exec
      stdio: 'inherit',
    });
    // eslint-disable-next-line no-console
    if (stderr) console.error(stderr);
    return stdout;
  } catch (error) {
    assertError<Error & { stdout: string }>(error);
    if (command === 'pnpm' && args[0] === 'outdated' && error.stdout) {
      return error.stdout;
    }
    logger.error(chalk.bold.red('Command failed:'), { command, args, error });
    throw error;
  }
}

async function runTests() {
  // Run typechecking
  await execCommand('pnpm', ['typecheck']);
  // Run unit tests
  await execCommand('pnpm', ['test']);
  // Rebuild docker for E2E
  await execCommand('pnpm', ['docker:rebuild']);
  // Run E2E tests
  await execCommand('pnpm', ['e2e:dev']);
}

async function updatePackage(packageName: string, version: string) {
  logger.info(chalk.bold.cyan(`📦 Updating ${packageName} to ${version}`));

  try {
    await execCommand('pnpm', ['add', `${packageName}@${version}`]);

    logger.info(chalk.bold.yellow('🧪 Running tests...'));
    await runTests();

    const commitMessage = [
      `chore(deps): update ${packageName} from ${version}`,
      '',
      `Updates ${packageName} to version ${version}`,
      '',
      'Testing: All tests passed ✅',
    ].join('\n');

    await execCommand('git', ['add', 'package.json', 'pnpm-lock.yaml']);
    await execCommand('git', ['commit', '-m', commitMessage]);

    logger.info(
      chalk.bold.green(`✅ Successfully updated ${packageName} to ${version}`),
    );
    return true;
  } catch (error) {
    logger.error(chalk.bold.red(`❌ Failed to update ${packageName}`), {
      error,
    });
    logger.info(chalk.bold.yellow('↩️ Rolling back changes...'));
    await execCommand('git', [
      'checkout',
      '--',
      'package.json',
      'pnpm-lock.yaml',
    ]);
    await execCommand('pnpm', ['install']);
    return false;
  }
}

interface PnpmOutdatedPackage {
  name: string;
  current: string;
  wanted: string;
  latest: string;
  dependent: string;
  dependencies?: Record<string, string>;
}

async function parseOutdatedPackages(jsonOutput: string) {
  try {
    const outdated = JSON.parse(jsonOutput) as Record<
      string,
      PnpmOutdatedPackage
    >;
    const updates: Array<{ name: string; version: string }> = [];

    for (const [name, info] of Object.entries(outdated)) {
      // Skip deprecated packages
      if (info.latest === 'Deprecated') continue;

      // Use the latest version
      if (info.latest && info.latest !== info.current) {
        updates.push({
          name,
          version: info.latest,
        });
      }
    }

    return updates;
  } catch (error) {
    logger.error('Failed to parse outdated packages:', error);
    throw error;
  }
}

async function main() {
  try {
    logger.info(chalk.bold.blue('🔍 Checking for outdated packages...'));
    const outdatedOutput = await execCommand('pnpm', ['outdated', '--json']);

    const updates = await parseOutdatedPackages(outdatedOutput);

    logger.info(
      chalk.bold.cyan(`📋 Found ${updates.length} packages to update`),
    );

    for (const { name, version } of updates) {
      await updatePackage(name, version);
    }

    logger.info(chalk.bold.green('✨ Package updates completed!'));
  } catch (error) {
    logger.error(chalk.bold.red('❌ Script failed:'), error);
    process.exit(1);
  }
}

main().catch((error) => {
  logger.error('Script failed:', error);
  process.exit(1);
});
