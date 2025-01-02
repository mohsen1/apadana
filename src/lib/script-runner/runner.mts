#!/usr/bin/env node

/*
  Script Runner
  -------------
  Organized approach for parsing and executing YAML-based command definitions.
  - Validates scripts against a JSON schema
  - Lists available commands
  - Updates package.json with command stubs
  - Executes commands (including dependencies, concurrency, watch mode, etc.)
*/

import Ajv from 'ajv';
import chalk from 'chalk';
import { spawn } from 'child_process';
import { execa } from 'execa';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { sync as globSync } from 'glob';
import { join, resolve } from 'path';
import * as YAML from 'yaml';
import { createLogger } from '@/utils/logger';
import jsonSchema from './script.schema.json' assert { type: 'json' };

// -----------------------------------------------------------------------------
// Logger Setup
// -----------------------------------------------------------------------------
const logger = createLogger('script-runner', 'debug');
logger.debug('Script runner initialized');

// -----------------------------------------------------------------------------
// JSON Schema (Ajv) Initialization
// -----------------------------------------------------------------------------
const ajv = new Ajv();
const validate = ajv.compile(jsonSchema);
logger.debug('JSON schema validator compiled');

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------
interface CommandStep {
  command?: string;
  script?: string;
  steps?: (CommandStep | string)[];
  concurrently?: CommandStep[];
  env?: Record<string, string | number>;
  envFile?: string[];
  help?: string;
  depends?: string[];
  watch?: string[];
  subcommands?: Record<string, CommandStep>;
  prefix?: string;
  label?: string;
}

type ScriptConfig = Record<string, CommandStep>;

interface ValidationError {
  message: string;
  path: string[];
}

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------
const SCRIPTS_DIR = resolve(process.cwd(), './scripts');
const args = process.argv.slice(2);

// -----------------------------------------------------------------------------
// Argument Parsing
// -----------------------------------------------------------------------------
let listMode = false;
let validateMode = false;
let updatePackageJsonMode = false;
const positionalArgs: string[] = [];

for (const arg of args) {
  if (arg === '--list') listMode = true;
  else if (arg === '--validate') validateMode = true;
  else if (arg === '--update-package-json') updatePackageJsonMode = true;
  else positionalArgs.push(arg);
}

// -----------------------------------------------------------------------------
// Error Helpers
// -----------------------------------------------------------------------------
function mapAjvErrors(errors: unknown): ValidationError[] {
  if (!Array.isArray(errors)) return [];
  return errors.map((err) => ({
    message: String(err?.message ?? 'Unknown error'),
    path: err?.instancePath?.split('/').filter(Boolean) ?? [],
  }));
}

// -----------------------------------------------------------------------------
// Script Validation
// -----------------------------------------------------------------------------
function validateScript(
  file: string,
  data: unknown,
): { valid: boolean; errors?: ValidationError[] } {
  logger.debug(`Validating script file: ${file}`);
  const isValid = validate(data);
  if (!isValid) {
    const mappedErrors = mapAjvErrors(validate.errors);
    logger.debug(`Validation failed for ${file}`, { errors: mappedErrors });
    return { valid: false, errors: mappedErrors };
  }
  return { valid: true };
}

// -----------------------------------------------------------------------------
// Loading Scripts
// -----------------------------------------------------------------------------
function loadAllScripts(): Record<string, ScriptConfig> {
  logger.debug('Loading all scripts');
  const scripts: Record<string, ScriptConfig> = {};
  const files = globSync('**/script.yml', { cwd: SCRIPTS_DIR });
  logger.debug(`Found ${files.length} script files`);

  for (const file of files) {
    logger.debug(`Processing script file: ${file}`);
    const fullPath = join(SCRIPTS_DIR, file);
    const yamlContent = readFileSync(fullPath, 'utf8');

    try {
      const parsed = YAML.parse(yamlContent);
      const validation = validateScript(file, parsed);
      if (!validation.valid) {
        logger.error(`Invalid script file: ${file}`, { errors: validation.errors });
        logger.error(`❌ Invalid script file: ${file}`);
        logger.error('Validation errors:');
        validation.errors?.forEach((error) => {
          logger.error(`  - ${error.message} at ${error.path.join('.')}`);
        });
        continue;
      }
      const commandName = file.split('/')[0];
      logger.debug(`Adding command: ${commandName}`);
      scripts[commandName] = parsed;
    } catch (err) {
      logger.error(`Failed to parse ${file}`, { error: err });
      logger.error(`Failed to parse ${file}: ${(err as Error).message}`);
    }
  }
  return scripts;
}

const allScripts = loadAllScripts();

// -----------------------------------------------------------------------------
// Package.json Updater
// -----------------------------------------------------------------------------
if (updatePackageJsonMode) {
  logger.debug('Updating package.json with script commands');
  const packageJsonPath = resolve(process.cwd(), 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

  // Reset scripts object
  packageJson.scripts = {};

  // Add top-level commands in alphabetical order
  const sortedCommands = Object.keys(allScripts).sort();
  for (const commandName of sortedCommands) {
    packageJson.scripts[commandName] = `script ${commandName}`;
  }

  logger.info('Writing updated package.json');
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  logger.info('✓ Successfully updated package.json with script commands');
  process.exit(0);
}

// -----------------------------------------------------------------------------
// Command Listing
// -----------------------------------------------------------------------------
function printCommandList() {
  for (const [commandName, script] of Object.entries(allScripts)) {
    const hasDefault = script.default !== undefined;
    const defaultHelp = hasDefault ? script.default.help : '';
    console.log(
      hasDefault ? chalk.bold.blue(`❯ ${commandName}`) : chalk.bold.gray(commandName),
      defaultHelp ? chalk.gray(`: ${defaultHelp}`) : '',
    );
    for (const [sub, subDef] of Object.entries(script)) {
      if (sub === 'default') continue;
      const isLastSubcommand = sub === Object.keys(script)[Object.keys(script).length - 1];
      console.log(
        `  ${chalk.green(isLastSubcommand ? '└─' : '├─')} ${chalk.blue(`${commandName} ${sub}`)}${
          subDef.help ? chalk.gray(`: ${subDef.help}`) : ''
        }`,
      );
      if (subDef.subcommands) {
        const entries = Object.entries(subDef.subcommands);
        entries.forEach(([nestedSub, nestedDef], index) => {
          const isLast = index === entries.length - 1;
          console.log(
            `  ${chalk.green('│ ')}${chalk.green(isLast ? '└─' : '├─')} ${chalk.cyan(
              `${commandName} ${sub} ${nestedSub}`,
            )}${nestedDef.help ? chalk.gray(`: ${nestedDef.help}`) : ''}`,
          );
        });
      }
    }
    console.log();
  }
}

if (listMode) {
  printCommandList();
  process.exit(0);
}

// -----------------------------------------------------------------------------
// Validation Mode
// -----------------------------------------------------------------------------
if (validateMode) {
  let hasErrors = false;
  const files = globSync('**/script.yml', { cwd: SCRIPTS_DIR });

  for (const file of files) {
    const fullPath = join(SCRIPTS_DIR, file);
    const yamlContent = readFileSync(fullPath, 'utf8');
    try {
      const parsed = YAML.parse(yamlContent);
      const validation = validateScript(file, parsed);

      if (!validation.valid) {
        hasErrors = true;
        logger.error(`❌ Invalid script file: ${file}`);
        logger.error('Validation errors:');
        validation.errors?.forEach((error: ValidationError) => {
          logger.error(`  - ${error.message} at ${error.path.join('.')}`);
        });
      } else {
        logger.info(`✓ Valid script file: ${file}`);
      }
    } catch (err) {
      hasErrors = true;
      logger.error(`Failed to parse ${file}: ${(err as Error).message}`);
    }
  }

  if (hasErrors) process.exit(1);
  logger.info('\n✓ All scripts are valid.');
  process.exit(0);
}

// -----------------------------------------------------------------------------
// Execute Commands
// -----------------------------------------------------------------------------
if (positionalArgs.length === 0) {
  logger.error('No command specified');
  process.exit(1);
}

const topCommand = positionalArgs[0];
const subCommands = positionalArgs.slice(1);

if (!allScripts[topCommand]) {
  logger.info('\nAvailable commands:');
  printCommandList();
  logger.error(chalk.redBright(`Unknown command: "${chalk.bold(topCommand)}"`));
  process.exit(1);
}

function resolveCommand(script: ScriptConfig, subPath: string[]): CommandStep | null {
  logger.debug('Resolving command', { subPath });
  if (subPath.length === 0) {
    logger.debug('No subpath, returning default command');
    return script['default'] || null;
  }

  let current: CommandStep | null = script[subPath[0]] || null;
  if (!current) {
    logger.debug('Direct subcommand not found, checking default subcommands');
    const defSub = script['default']?.subcommands?.[subPath[0]];
    if (defSub) {
      current = defSub;
      subPath.shift();
      logger.debug('Found command in default subcommands');
    } else {
      logger.debug('Command not found in default subcommands');
      return null;
    }
  } else {
    subPath.shift();
  }

  while (subPath.length > 0 && current) {
    logger.debug(`Traversing deeper: ${subPath[0]}`);
    const nested = current.subcommands?.[subPath[0]] as CommandStep | undefined;
    if (!nested) return null;
    current = nested;
    subPath.shift();
  }

  return current;
}

const script = allScripts[topCommand];
const cmdDef = resolveCommand(script, subCommands);
if (!cmdDef) {
  logger.error(`Subcommand not found for ${topCommand} ${subCommands.join(' ')}`);
  process.exit(1);
}

// -----------------------------------------------------------------------------
// Dependency Handling
// -----------------------------------------------------------------------------
async function runDepends(depends: string[]) {
  logger.debug('Running dependencies', { depends });
  for (const dep of depends) {
    logger.debug(`Processing dependency: ${dep}`);
    const parts = dep.split('/');
    const depCommand = parts[0];
    const depSubs = parts.slice(1);

    if (!allScripts[depCommand]) {
      logger.error(`Dependency command not found: ${depCommand}`);
      process.exit(1);
    }

    const depScript = allScripts[depCommand];
    const depCmdDef = resolveCommand(depScript, depSubs);
    if (!depCmdDef) {
      logger.error(`Dependency subcommand not found: ${dep}`);
      process.exit(1);
    }

    logger.debug(`Running dependency: ${dep}`);
    await runCommand(depCmdDef, depCommand, depSubs);
  }
}

// -----------------------------------------------------------------------------
// Environment Loading
// -----------------------------------------------------------------------------
function loadEnvFromFiles(files: string[] | undefined) {
  if (!files) return {};
  logger.debug('Loading environment from files', { files });

  const result: Record<string, string> = {};
  for (const file of files) {
    const path = resolve(process.cwd(), file);
    if (existsSync(path)) {
      logger.debug(`Loading env from file: ${file}`);
      const content = readFileSync(path, 'utf-8');
      const lines = content.split('\n');

      for (const l of lines) {
        const line = l.trim();
        if (!line || line.startsWith('#')) continue;
        const eqIdx = line.indexOf('=');
        if (eqIdx === -1) continue;
        const key = line.slice(0, eqIdx).trim();
        result[key] = line.slice(eqIdx + 1).trim();
      }
    } else {
      logger.warn(`Env file not found: ${file}`);
    }
  }
  logger.debug(`Loaded ${Object.keys(result).length} environment variables`);
  return result;
}

// -----------------------------------------------------------------------------
// Step Execution
// -----------------------------------------------------------------------------
async function runSteps(steps: (CommandStep | string)[], baseEnv: Record<string, string>) {
  logger.debug(`Running ${steps.length} steps`);
  for (const step of steps) {
    if (typeof step === 'string') {
      logger.debug(`Running string step: ${step}`);
      await runSingleCommand(step, baseEnv);
    } else {
      logger.debug('Running object step', { step });
      await runCommand(step, '', [], baseEnv);
    }
  }
}

// -----------------------------------------------------------------------------
// Concurrent Execution
// -----------------------------------------------------------------------------
async function runConcurrently(
  concurrentSteps: (CommandStep | string)[],
  baseEnv: Record<string, string>,
) {
  logger.debug(`Running ${concurrentSteps.length} steps concurrently`);

  const mapped = await Promise.all(
    concurrentSteps.map(async (s) => {
      if (typeof s === 'string') {
        logger.debug(`Mapping concurrent string command: ${s}`);
        return { command: s, env: baseEnv, label: '' };
      }
      logger.debug('Mapping concurrent object step', { step: s });
      if (s.command) {
        return {
          command: `pnpm ${s.command}`,
          env: { ...baseEnv, ...(s.env || {}) },
          prefix: s.prefix,
          label: s.label || '',
        };
      }
      if (s.script) {
        return {
          command: `pnpm ${s.script}`,
          env: { ...baseEnv, ...(s.env || {}) },
          prefix: s.prefix,
          label: s.label || '',
        };
      }
      logger.error('Unsupported concurrent step');
      process.exit(1);
    }),
  );

  const binPath = resolve(process.cwd(), 'node_modules/.bin');
  logger.debug(`Using bin path: ${binPath}`);

  const finalEnv = { ...process.env, PATH: `${binPath}:${process.env.PATH || ''}` };
  const baseArgs = [
    '--color',
    '--prefix-colors',
    'blue.bold,magenta.bold,green.bold,yellow.bold,cyan.bold',
    '--names',
    mapped.map((m) => m.label || 'task').join(','),
  ];
  const commands = mapped.map((m) => m.command);

  logger.debug('Running concurrent commands', { commands, args: baseArgs });
  await execa('concurrently', [...baseArgs, ...commands], {
    stdio: 'inherit',
    env: finalEnv,
    shell: true,
  });
}

// -----------------------------------------------------------------------------
// Single Command Execution
// -----------------------------------------------------------------------------
async function runSingleCommand(cmd: string, env: Record<string, string>) {
  logger.debug(`Running single command: ${cmd}`);
  const binPath = resolve(process.cwd(), 'node_modules/.bin');
  const finalEnv = { ...process.env, ...env, PATH: `${binPath}:${process.env.PATH || ''}` };

  await new Promise<void>((resolveP, rejectP) => {
    logger.debug('Spawning command process');
    const proc = spawn(cmd, { shell: true, stdio: 'inherit', env: finalEnv });
    proc.on('exit', (code) => {
      if (code === 0) {
        logger.debug(`Command completed successfully: ${cmd}`);
        resolveP();
      } else {
        logger.error(`Command failed with code ${code}: ${cmd}`);
        rejectP(new Error(`Command "${cmd}" failed with code ${code}`));
      }
    });
  });
}

// -----------------------------------------------------------------------------
// Watch Mode Execution
// -----------------------------------------------------------------------------
async function runWithWatch(cmd: string, files: string[], env: Record<string, string>) {
  logger.debug(`Running watch command: ${cmd}`, { watchFiles: files });
  const binPath = resolve(process.cwd(), 'node_modules/.bin');
  const finalEnv = { ...process.env, ...env, PATH: `${binPath}:${process.env.PATH || ''}` };
  const watchArgs = ['--watch', ...files, '--exec', cmd];

  logger.debug('Starting nodemon', { args: watchArgs });
  await new Promise<void>((resolveP, rejectP) => {
    const proc = spawn('nodemon', watchArgs, { shell: true, stdio: 'inherit', env: finalEnv });
    proc.on('exit', (code) => {
      if (code === 0) {
        logger.debug('Watch command completed successfully');
        resolveP();
      } else {
        logger.error(`Watch command failed with code ${code}`);
        rejectP(new Error(`Watch command "${cmd}" failed with code ${code}`));
      }
    });
  });
}

// -----------------------------------------------------------------------------
// Main Command Execution
// -----------------------------------------------------------------------------
async function runCommand(
  def: CommandStep,
  cmdName: string,
  subPath: string[] = [],
  inheritedEnv: Record<string, string> = {},
) {
  logger.debug('Running command', { cmdName, subPath, def });

  // Merge environment
  const stepEnvFiles = def.envFile ? loadEnvFromFiles(def.envFile) : {};
  const combinedEnv = {
    ...inheritedEnv,
    ...(def.env ? Object.fromEntries(Object.entries(def.env).map(([k, v]) => [k, String(v)])) : {}),
    ...stepEnvFiles,
  };
  logger.debug('Combined environment variables', { envCount: Object.keys(combinedEnv).length });

  // Dependencies
  if (def.depends?.length) {
    logger.debug('Processing dependencies');
    await runDepends(def.depends);
  }

  // Steps
  if (def.steps?.length) {
    logger.debug(`Running ${def.steps.length} sequential steps`);
    await runSteps(def.steps, combinedEnv);
    return;
  }

  // Concurrency
  if (def.concurrently?.length) {
    logger.debug(`Running ${def.concurrently.length} concurrent steps`);
    await runConcurrently(def.concurrently, combinedEnv);
    return;
  }

  // Command
  if (def.command) {
    if (def.watch?.length) {
      logger.debug('Running command with watch');
      await runWithWatch(def.command, def.watch, combinedEnv);
    } else {
      logger.debug('Running single command');
      await runSingleCommand(def.command, combinedEnv);
    }
    return;
  }

  // Script
  if (def.script) {
    logger.debug(`Running script command: ${def.script}`);
    const parts = def.script.split(' ');
    const scriptCmd = [process.argv[1], ...parts];
    const binPath = resolve(process.cwd(), 'node_modules/.bin');
    const finalEnv = {
      ...process.env,
      ...combinedEnv,
      PATH: `${binPath}:${process.env.PATH || ''}`,
    };
    await execa('node', scriptCmd.slice(1), { stdio: 'inherit', env: finalEnv });
    return;
  }

  // Subcommands
  if (def.subcommands && Object.keys(def.subcommands).length === 0) {
    const fullPath = [cmdName, ...subPath].join(' ');
    logger.error(`No actual commands to run for ${fullPath}`);
    process.exit(1);
  }
}

// -----------------------------------------------------------------------------
// Kick Off
// -----------------------------------------------------------------------------
runCommand(cmdDef, topCommand, subCommands).catch((err) => {
  logger.error('Command failed', { error: err });
  process.exit(1);
});