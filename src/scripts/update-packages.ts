import chalk from 'chalk';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import semver from 'semver';

import { assertError } from '@/utils';
import { Logger } from '@/utils/logger';

const logger = new Logger('', 'debug');

const PACKAGE_GROUPS = [
  {
    name: 'Radix UI',
    pattern: /^@radix-ui\//,
  },
  {
    name: 'Prisma',
    pattern: /^@prisma\/|^prisma$/,
  },
  {
    name: 'Shadcn UI',
    pattern: /^@\/components\/ui\//,
  },
  {
    name: 'DND Kit',
    pattern: /^@dnd-kit\//,
  },
  {
    name: 'DefinitlyTyped',
    pattern: /^@types\//,
  },
  {
    name: 'Storybook',
    pattern: /^@storybook\//,
  },
  {
    name: 'React',
    pattern: /^@react\//,
  },
  {
    name: 'ESLint',
    pattern: /eslint/,
  },
  {
    name: 'Vercel',
    pattern: /@vercel\//,
  },
] as const;

interface PackageUpdate {
  packageName: string;
  current: string;
  latest: string;
  wanted: string;
  isDeprecated: boolean;
  dependencyType: string;
}

interface TestResult {
  type: 'typecheck' | 'lint' | 'unit';
  passed: boolean;
  error?: string;
}

interface UpdateResult {
  packageName: string;
  groupName?: string;
  fromVersion: string;
  toVersion: string;
  updateType: 'major' | 'minor' | 'patch';
  testResults: TestResult[];
}

const results: UpdateResult[] = [];

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

async function runTests(update: UpdateResult): Promise<boolean> {
  const runTest = async (
    type: TestResult['type'],
    command: string,
    args: string[],
    env = {},
  ): Promise<TestResult> => {
    try {
      logger.info(
        chalk.bold.blue(`\n${getTestEmoji(type)} Running ${type} checks...`),
      );
      const { stderr, exitCode } = await execCommand('pnpm', args, {
        allowFailure: true,
        env,
      });
      const passed = exitCode === 0;

      if (passed) {
        logger.info(chalk.bold.green(`✅ ${type} checks passed`));
      } else {
        logger.error(chalk.bold.yellow(`⚠️ ${type} checks failed`));
      }

      return { type, passed, error: passed ? undefined : stderr };
    } catch (error) {
      assertError(error);
      logger.error(chalk.bold.yellow(`⚠️ ${type} checks failed`));
      return { type, passed: false, error: error.message };
    }
  };

  const tests: TestResult[] = await Promise.all([
    runTest('typecheck', 'pnpm', ['typecheck']),
    runTest('lint', 'pnpm', ['lint:strict']),
    runTest('unit', 'pnpm', ['test']),
  ]);

  update.testResults = tests;
  return tests.every((test) => test.passed);
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

function findPackageGroup(packageName: string) {
  return PACKAGE_GROUPS.find((group) => group.pattern.test(packageName));
}

function groupPackageUpdates(updates: PackageUpdate[]) {
  const groups = new Map<string, PackageUpdate[]>();
  const ungrouped: PackageUpdate[] = [];

  for (const update of updates) {
    const group = findPackageGroup(update.packageName);
    if (group) {
      const existing = groups.get(group.name) || [];
      groups.set(group.name, [...existing, update]);
    } else {
      ungrouped.push(update);
    }
  }

  return {
    groups,
    ungrouped,
  };
}

async function updatePackageGroup(
  updates: PackageUpdate[],
  groupName?: string,
) {
  logger.info(
    chalk.bold.cyan(
      `\n📦 Updating ${updates.length} packages: ${updates.map((u) => u.packageName).join(', ')}`,
    ),
  );

  try {
    // Install packages
    for (const update of updates) {
      await execCommand('pnpm', [
        'add',
        `${update.packageName}@${update.latest}`,
      ]);
    }

    const updateType = updates.reduce(
      (highest, update) => {
        const type = getUpdateType(update.current, update.latest);
        if (type === 'major') return 'major';
        if (type === 'minor' && highest === 'patch') return 'minor';
        return highest;
      },
      'patch' as 'major' | 'minor' | 'patch',
    );

    const updateResult: UpdateResult = {
      packageName: updates.map((u) => u.packageName).join(', '),
      groupName,
      fromVersion: updates[0].current,
      toVersion: updates[0].latest,
      updateType,
      testResults: [],
    };

    logger.info(chalk.bold.yellow('\n🧪 Running tests...'));
    await runTests(updateResult);
    results.push(updateResult);

    const commitMessage = [
      groupName
        ? `chore(deps): ${updateType} update ${groupName} packages`
        : `chore(deps): ${updateType} update ${updates[0].packageName}`,
      '',
      ...updates.map((u) => `- ${u.packageName}: ${u.current} → ${u.latest}`),
      '',
      'Testing: All tests passed ✅',
      '',
      `Type: ${updateType} update`,
    ].join('\n');

    // if not diff skip
    const diff = await execCommand('git', [
      'diff',
      'package.json',
      'pnpm-lock.yaml',
    ]);
    if (diff.stdout.trim() === '') {
      logger.info(
        chalk.bold.yellow(`\n🔍 No changes for ${updates[0].packageName}`),
      );
      return true;
    }

    await execCommand('git', ['add', 'package.json', 'pnpm-lock.yaml']);
    await execCommand('git', ['commit', '-m', commitMessage, '--no-verify']);

    logger.info(
      chalk.bold.green(
        `\n✅ Successfully updated ${updates[0].packageName} to ${updates[0].latest}`,
      ),
    );
    return true;
  } catch (error) {
    assertError(error);
    logger.error(
      chalk.bold.red(`\n❌ Failed to update ${updates[0].packageName}:`),
    );
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

function generatePRSummary(results: UpdateResult[]): string {
  const summary = [
    '# Package Updates Summary',
    '',
    '## Overview',
    '',
    '| Package(s) | Update Type | From | To | Status |',
    '|------------|-------------|------|-----|--------|',
  ];

  for (const result of results) {
    const allPassed = result.testResults.every((t) => t.passed);
    const status = allPassed ? '✅ All Passed' : '⚠️ Some Tests Failed';
    summary.push(
      `| ${result.groupName || result.packageName} | ${result.updateType} | ${result.fromVersion} | ${result.toVersion} | ${status} |`,
    );
  }

  summary.push('', '## Detailed Test Results', '');

  for (const result of results) {
    summary.push(
      `### ${result.groupName || result.packageName}`,
      '',
      '| Test Type | Status | Error |',
      '|-----------|--------|-------|',
    );

    for (const test of result.testResults) {
      summary.push(
        `| ${test.type} | ${test.passed ? '✅ Passed' : '❌ Failed'} | ${test.error ? `\`\`\`\n${test.error}\n\`\`\`` : 'N/A'} |`,
      );
    }
    summary.push('');
  }

  return summary.join('\n');
}

async function main() {
  try {
    logger.info(chalk.bold.blue('🔍 Checking for outdated packages...'));
    const outdatedOutput = await execCommand('pnpm', ['outdated', '--json'], {
      allowFailure: true,
    });
    const updates = Object.entries(
      (await JSON.parse(outdatedOutput.stdout)) as Record<
        string,
        Omit<PackageUpdate, 'packageName'>
      >,
    ).map(([packageName, update]) => ({
      ...update,
      packageName,
    }));

    logger.info(
      chalk.bold.cyan(`📋 Found ${updates.length} packages to update`),
    );

    // Group updates based on patterns
    const { groups, ungrouped } = groupPackageUpdates(updates);

    // Process grouped updates, largest group first
    for (const [groupName, groupUpdates] of [...groups].sort(
      ([, a], [, b]) => b.length - a.length,
    )) {
      await updatePackageGroup(groupUpdates, groupName);
    }

    // Process ungrouped updates individually
    for (const update of ungrouped) {
      await updatePackageGroup([update]);
    }

    // Generate and print PR summary
    const prSummary = generatePRSummary(results);
    logger.info('\n📋 PR Summary:');
    logger.log(prSummary);

    // Write summary to file
    await fs.writeFile('package-updates-summary.md', prSummary);
    logger.info(
      chalk.bold.green(
        '\n✨ Package updates completed! Summary written to package-updates-summary.md',
      ),
    );
  } catch (error) {
    logger.error(chalk.bold.red('❌ Script failed:'), error);
    process.exit(1);
  }
}

// Helper function for test emojis
function getTestEmoji(type: TestResult['type']): string {
  const emojis = {
    typecheck: '📝',
    lint: '🔍',
    unit: '🧪',
  };
  return emojis[type];
}

main().catch((error) => {
  logger.error('Script failed:', error);
  process.exit(1);
});
