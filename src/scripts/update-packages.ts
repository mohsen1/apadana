import chalk from 'chalk';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import semver from 'semver';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { assertError } from '@/utils';
import { Logger } from '@/utils/logger';

const logger = new Logger('', 'debug');

const IGNORE_PACKAGES = ['chalk', 'sudo-prompt', 'react', 'react-dom', '@types/react'];

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
  dependencyType: 'devDependencies' | 'dependencies';
}

interface TestResult {
  type: 'typecheck' | 'lint' | 'unit';
  passed: boolean;
  error?: string;
}

interface UpdateResult {
  dependencyType: 'devDependencies' | 'dependencies';
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
  options: { allowFailure?: boolean; env?: Record<string, string>; silent?: boolean } = {
    allowFailure: false,
    env: {},
    silent: false,
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
      if (!options.silent) process.stdout.write(chunk);
    });

    proc.stderr.on('data', (data: Buffer) => {
      const chunk = data.toString();
      stderr.push(chunk);
      if (!options.silent) process.stderr.write(chunk);
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
    args: string[],
    env = {},
  ): Promise<TestResult> => {
    try {
      logger.info(chalk.bold.blue(`\n${getTestEmoji(type)} Running ${type} checks...`));
      const { stderr, exitCode } = await execCommand('pnpm', args, {
        allowFailure: true,
        env,
      });
      const passed = exitCode === 0;
      if (passed) {
        logger.info(chalk.bold.green(`✅ ${type} checks passed for ${update.packageName}`));
      } else {
        logger.error(chalk.bold.yellow(`⚠️ ${type} checks failed for ${update.packageName}`));
      }
      return { type, passed, error: passed ? undefined : stderr };
    } catch (error) {
      assertError(error);
      logger.error(chalk.bold.yellow(`⚠️ ${type} checks failed for ${update.packageName}`));
      return { type, passed: false, error: error.message };
    }
  };

  const tests: TestResult[] = await Promise.all([
    runTest('typecheck', ['typecheck']),
    runTest('lint', ['lint:strict']),
    runTest('unit', ['test']),
  ]);

  update.testResults = tests;
  return tests.every((test) => test.passed);
}

function getUpdateType(currentVersion: string, newVersion: string): 'major' | 'minor' | 'patch' {
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

async function updatePackageGroup(updates: PackageUpdate[], groupName?: string) {
  logger.info(
    chalk.bold.cyan(
      `\n📦 Updating ${updates.length} packages: ${updates.map((u) => u.packageName).join(', ')}`,
    ),
  );

  try {
    // Split dev and regular dependencies to ensure correct flags
    const devUpdates = updates.filter((u) => u.dependencyType === 'devDependencies');
    const prodUpdates = updates.filter((u) => u.dependencyType === 'dependencies');

    if (prodUpdates.length) {
      await execCommand('pnpm', [
        'add',
        ...prodUpdates.map((u) => `${u.packageName}@${u.latest}`),
        '--silent',
      ]);
    }
    if (devUpdates.length) {
      await execCommand('pnpm', [
        'add',
        '-D',
        ...devUpdates.map((u) => `${u.packageName}@${u.latest}`),
        '--silent',
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
      dependencyType: updates[0].dependencyType,
      testResults: [],
    };

    logger.info(chalk.bold.yellow('\n🧪 Running tests...'));
    const passed = await runTests(updateResult);
    results.push(updateResult);

    if (!passed) {
      logger.error(chalk.bold.red(`Rolling back changes for ${updateResult.packageName}`));
      await execCommand('git', ['reset', '--hard'], {
        silent: true,
      });
      await execCommand('pnpm', ['install']);
      return false;
    }

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

    const tempFile = path.join(os.tmpdir(), `.temp-commit-msg-${Date.now()}`);
    await fs.writeFile(tempFile, commitMessage);

    const commitResult = await execCommand('git', ['commit', '-a', '-F', tempFile, '--no-verify'], {
      allowFailure: true,
    });

    if (commitResult.exitCode !== 0) {
      logger.error(chalk.bold.red(`\n❌ Failed to commit changes to git`));
      logger.error(chalk.red(commitResult.stderr));
      return false;
    }

    logger.info(chalk.bold.green(`\n✅ Committed changes to git`));
    logger.info(
      chalk.bold.green(
        `\n✅ Successfully updated ${updates[0].packageName} to ${updates[0].latest}`,
      ),
    );
    return true;
  } catch (error) {
    assertError(error);
    logger.error(chalk.bold.red(`\n❌ Failed to update ${updates[0].packageName}:`));
    logger.error(chalk.red(error.message));

    logger.info(chalk.bold.yellow('\n↩️ Rolling back changes...'));
    await execCommand('git', ['reset', '--hard'], {
      silent: true,
    });
    await execCommand('pnpm', ['install']);
    process.exit(1);
  }
}

function organizeResults(results: UpdateResult[]) {
  // Map groupName -> array of UpdateResult
  const grouped = new Map<string, UpdateResult[]>();

  for (const r of results) {
    // Fall back to “Ungrouped” if no groupName
    const gName = r.groupName ?? 'Ungrouped';
    const current = grouped.get(gName) || [];
    current.push(r);
    grouped.set(gName, current);
  }

  return grouped;
}

function generatePRSummary(results: UpdateResult[]): string {
  // Mark anything with failing tests as needing manual update
  const manualUpdates = results.filter((r) => r.testResults.some((t) => !t.passed));

  const grouped = organizeResults(results);

  // Build text lines
  const lines: string[] = [];

  // High-level heading
  lines.push('# Package Updates Summary', '');
  lines.push('Automated script to update dependencies has generated this PR');

  // Manual updates
  lines.push(`### ${manualUpdates.length} packages need manual update`);
  lines.push(
    '<pre>' +
      manualUpdates
        .map(
          (r) =>
            `pnpm add ${r.dependencyType === 'devDependencies' ? '-D ' : ''}${
              r.packageName
            }@${r.toVersion}`,
        )
        .join('\n') +
      '</pre>',
    '',
  );

  // Overview table
  lines.push('## Overview', '');
  lines.push('<table>');
  lines.push(
    '<thead><tr><th>Group</th><th>Package(s)</th><th>Update Type</th><th>From</th><th>To</th><th>Status</th></tr></thead>',
  );
  lines.push('<tbody>');

  for (const [groupName, items] of grouped.entries()) {
    for (const r of items) {
      const passedAll = r.testResults.every((t) => t.passed);
      const status = passedAll
        ? '✅ All Passed'
        : `⚠️ ${r.testResults
            .map((t) => (t.passed ? '' : t.type))
            .filter(Boolean)
            .join(', ')} failed`;
      lines.push(
        '<tr>',
        `<td>${groupName}</td>`,
        `<td><code>${r.packageName}</code></td>`,
        `<td>${r.updateType.toUpperCase()}</td>`,
        `<td><code>${r.fromVersion}</code></td>`,
        `<td><code>${r.toVersion}</code></td>`,
        `<td>${status}</td>`,
        '</tr>',
      );
    }
  }

  lines.push('</tbody></table>', '');

  // Detailed results
  lines.push('## Detailed Test Results', '');
  for (const [groupName, items] of grouped.entries()) {
    lines.push(`### ${groupName}`, '');
    for (const r of items) {
      lines.push(`#### \`${r.packageName}\``, '');
      if (r.testResults.length === 0) {
        lines.push('_No test results found for this package._', '');
        continue;
      }
      lines.push('<table>');
      lines.push('<thead><tr><th>Test Type</th><th>Status</th><th>Error</th></tr></thead>');
      lines.push('<tbody>');
      for (const test of r.testResults) {
        const errorDetails = test.error
          ? `<details><summary>Error Details</summary><pre>${test.error}</pre></details>`
          : '';
        lines.push(
          '<tr>',
          `<td><code>${test.type}</code></td>`,
          `<td>${test.passed ? '✅ Passed' : '❌ Failed'}</td>`,
          `<td>${errorDetails}</td>`,
          '</tr>',
        );
      }
      lines.push('</tbody></table>', '');
    }
  }

  return lines.join('\n');
}

async function main() {
  const argv = await yargs(hideBin(process.argv))
    .option('limit', {
      alias: 'l',
      type: 'number',
      description: 'Limit the number of packages to update',
      default: 0,
    })
    .help()
    .parseAsync();

  const limit = argv.limit === undefined || argv.limit === 0 ? Infinity : argv.limit;

  try {
    logger.info(chalk.bold.blue('🔍 Checking for outdated packages...'));
    const outdatedOutput = await execCommand('pnpm', ['outdated', '--json'], {
      allowFailure: true,
      silent: true,
    });

    const updates = Object.entries(
      JSON.parse(outdatedOutput.stdout) as Record<string, Omit<PackageUpdate, 'packageName'>>,
    )
      .map(([packageName, update]) => ({
        ...update,
        packageName,
      }))
      .filter((update) => !IGNORE_PACKAGES.includes(update.packageName))
      .slice(0, limit);

    logger.info(chalk.bold.cyan(`📋 Found ${updates.length} packages to update`));
    logger.info(chalk.dim(updates.map((u) => u.packageName).join(', ')));

    if (argv.limit > 0) {
      logger.info(chalk.bold.yellow(`ℹ️ Limiting updates to ${argv.limit} packages`));
    }

    const { groups, ungrouped } = groupPackageUpdates(updates);

    for (const [groupName, groupUpdates] of [...groups].sort(
      ([, a], [, b]) => b.length - a.length,
    )) {
      await updatePackageGroup(groupUpdates, groupName);
    }

    for (const update of ungrouped) {
      await updatePackageGroup([update]);
    }

    const prSummary = generatePRSummary(results);
    logger.info('\n📋 PR Summary:');
    logger.log(prSummary);

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
