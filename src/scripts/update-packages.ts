import chalk from 'chalk';
import { spawn } from 'child_process';
import semver from 'semver';

import { assertError } from '@/utils';
import { Logger } from '@/utils/logger';

const logger = new Logger('', 'debug');

async function execCommand(
  command: string,
  args: string[],
  options: { allowFailure?: boolean; env?: Record<string, string> } = {
    allowFailure: false,
    env: {},
  },
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  logger.info(chalk.dim(`$ ${command} ${args.join(' ')}`));

  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, ...options.env },
    });
    let stdout: string[] = [];
    let stderr: string[] = [];

    proc.stdout.on('data', (data: Buffer) => {
      const chunk = data.toString();
      stdout.push(chunk);
      process.stdout.write(chunk);
    });

    proc.stderr.on('data', (data: Buffer) => {
      const chunk = data.toString();
      stderr.push(chunk);
      process.stderr.write(chunk);
    });

    proc.on('close', (code) => {
      if (code === 0 || options.allowFailure) {
        resolve({
          stdout: stdout.join(''),
          stderr: stderr.join(''),
          exitCode: code ?? 0,
        });
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    proc.on('error', reject);
  });
}

async function runTests() {
  try {
    logger.info(chalk.bold.blue('\n📝 Running TypeScript checks...'));
    const { stderr, exitCode } = await execCommand('pnpm', ['typecheck']);
    if (exitCode !== 0) {
      throw new Error(stderr);
    }
    logger.info(chalk.bold.green('✅ TypeScript checks passed'));
  } catch (error) {
    assertError(error);
    logger.error(chalk.bold.red('\n❌ TypeScript checks failed:'));
    logger.error(chalk.red(error.message));
  }

  try {
    logger.info(chalk.bold.blue('\n🧪 Running unit tests...'));
    await execCommand('pnpm', ['test']);
  } catch (error) {
    assertError(error);
    logger.error(chalk.bold.red('\n❌ Some of the tests failed:'));
    logger.error(chalk.red(error.message));
    process.exit(1);
  }

  try {
    logger.info(chalk.bold.blue('\n🐳 Rebuilding Docker for E2E...'));
    await execCommand('pnpm', ['docker:build']);
  } catch (error) {
    assertError(error);
    logger.error(chalk.bold.red('\n❌ Docker build failed:'));
    logger.error(chalk.red(error.message));
    process.exit(1);
  }

  try {
    logger.info(chalk.bold.blue('\n🚀 Running E2E tests...'));
    await execCommand('pnpm', ['e2e'], { env: { CI: 'true' } });
  } catch (error) {
    assertError(error);
    logger.error(chalk.bold.red('\n❌ E2E tests failed:'));
    logger.error(chalk.red(error.message));
    process.exit(1);
  }
}

function getUpdateType(
  currentVersion: string,
  newVersion: string,
): 'major' | 'minor' | 'patch' {
  if (!currentVersion || !newVersion) return 'patch';

  try {
    const clean1 = semver.clean(currentVersion) ?? currentVersion;
    const clean2 = semver.clean(newVersion) ?? newVersion;

    if (semver.major(clean2) > semver.major(clean1)) return 'major';
    if (semver.minor(clean2) > semver.minor(clean1)) return 'minor';
    return 'patch';
  } catch {
    return 'patch';
  }
}

async function updatePackage(
  packageName: string,
  currentVersion: string,
  version: string,
) {
  logger.info(chalk.bold.cyan(`\n📦 Updating ${packageName} to ${version}`));

  try {
    await execCommand('pnpm', ['add', `${packageName}@${version}`]);

    logger.info(chalk.bold.yellow('\n🧪 Running tests...'));
    await runTests();

    const updateType = getUpdateType(currentVersion, version);

    const commitMessage = [
      `chore(deps): ${updateType} update ${packageName} from ${currentVersion} to ${version}`,
      '',
      `Updates ${packageName} from ${currentVersion} to version ${version}`,
      '',
      'Testing: All tests passed ✅',
      '',
      `Type: ${updateType} update`,
    ].join('\n');

    await execCommand('git', ['add', 'package.json', 'pnpm-lock.yaml']);
    await execCommand('git', ['commit', '-m', commitMessage]);

    logger.info(
      chalk.bold.green(
        `\n✅ Successfully updated ${packageName} to ${version}`,
      ),
    );
    return true;
  } catch (error) {
    assertError(error);
    logger.error(chalk.bold.red(`\n❌ Failed to update ${packageName}:`));
    logger.error(chalk.red(error.message));

    logger.info(chalk.bold.yellow('\n↩️ Rolling back changes...'));
    await execCommand('git', [
      'checkout',
      '--',
      'package.json',
      'pnpm-lock.yaml',
    ]);
    await execCommand('pnpm', ['install']);

    // Exit immediately on failure
    process.exit(1);
  }
}

interface PackageUpdate {
  current: string;
  latest: string;
  wanted: string;
  isDeprecated: boolean;
  dependencyType: string;
}

async function main() {
  try {
    logger.info(chalk.bold.blue('��� Checking for outdated packages...'));
    const outdatedOutput = await execCommand('pnpm', ['outdated', '--json'], {
      allowFailure: true,
    });
    const updates = (await JSON.parse(outdatedOutput.stdout)) as Record<
      string,
      PackageUpdate
    >;

    logger.info(
      chalk.bold.cyan(
        `📋 Found ${Object.keys(updates).length} packages to update`,
      ),
    );

    for (const [packageName, { current, latest }] of Object.entries(updates)) {
      await updatePackage(packageName, current, latest);
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
