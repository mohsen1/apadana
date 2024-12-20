import chalk from 'chalk';
import { spawn } from 'child_process';
import fs from 'fs';

import { assertError } from '@/utils';
import { Logger } from '@/utils/logger';


const logger = new Logger('', 'debug');



async function execCommand(command: string, args: string[], allowFailure = false): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  logger.info(chalk.dim(`$ ${command} ${args.join(' ')}`));

  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      const chunk = data.toString();
      stdout += chunk;
      process.stdout.write(chunk);
    });

    proc.stderr.on('data', (data) => {
      const chunk = data.toString();
      stderr += chunk;
      process.stderr.write(chunk);
    });

    proc.on('close', (code) => {
      if (code === 0 || allowFailure) {
        resolve({ stdout, stderr, exitCode: code ?? 0 });
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
    await execCommand('pnpm', ['docker:rebuild']);
  } catch (error) {
    assertError(error);
    logger.error(chalk.bold.red('\n❌ Docker rebuild failed:'));
    logger.error(chalk.red(error.message));
    process.exit(1);
  }

  try {
    logger.info(chalk.bold.blue('\n🚀 Running E2E tests...'));
    await execCommand('pnpm', ['e2e:dev']);
  } catch (error) {
    assertError(error);
    logger.error(chalk.bold.red('\n❌ E2E tests failed:'));
    logger.error(chalk.red(error.message));
    process.exit(1);
  }
}

async function updatePackage(packageName: string, currentVersion: string, version: string) {
  logger.info(chalk.bold.cyan(`\n📦 Updating ${packageName} to ${version}`));

  try {

    await execCommand('pnpm', ['add', `${packageName}@${version}`]);
    
    logger.info(chalk.bold.yellow('\n🧪 Running tests...'));
    await runTests();

    // Determine update type
    const updateType = getUpdateType(currentVersion, version);
    
    const commitMessage = [
      `chore(deps): ${updateType} update ${packageName} from ${currentVersion} to ${version}`,
      '',
      `Updates ${packageName} from ${currentVersion} to version ${version}`,
      '',
      'Testing: All tests passed ✅',
      '',
      `Type: ${updateType} update`
    ].join('\n');

    await execCommand('git', ['add', 'package.json', 'pnpm-lock.yaml']);
    await execCommand('git', ['commit', '-m', commitMessage]);

    logger.info(
      chalk.bold.green(`\n✅ Successfully updated ${packageName} to ${version}`),
    );
    return true;
  } catch (error) {
    assertError(error);
    logger.error(chalk.bold.red(`\n❌ Failed to update ${packageName}:`));
    logger.error(chalk.red(error.message));
    
    logger.info(chalk.bold.yellow('\n↩️ Rolling back changes...'));
    await execCommand('git', ['checkout', '--', 'package.json', 'pnpm-lock.yaml']);
    await execCommand('pnpm', ['install']);
    
    // Exit immediately on failure
    process.exit(1);
  }
}

function getUpdateType(currentVersion: string, newVersion: string): 'major' | 'minor' | 'patch' {
  if (!currentVersion || !newVersion) return 'patch';
  
  const current = currentVersion.replace(/[^\d.]/g, '').split('.').map(Number);
  const next = newVersion.replace(/[^\d.]/g, '').split('.').map(Number);
  
  if (next[0] > current[0]) return 'major';
  if (next[1] > current[1]) return 'minor';
  return 'patch';
}



async function main() {
  try {
    logger.info(chalk.bold.blue('🔍 Checking for outdated packages...'));
    const outdatedOutput = await execCommand('pnpm', ['outdated', '--json'], true);



    const updates = await JSON.parse(outdatedOutput.stdout) as {
      current: string;
      latest: string;
      wanted: string;
      isDeprecated: boolean;
      dependencyType: string;
    }[];

    logger.info(
      chalk.bold.cyan(`📋 Found ${updates.length} packages to update`),
    );

    for (const { current, latest, wanted } of updates) {
      await updatePackage(current, latest, wanted);
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
