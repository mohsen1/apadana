/* eslint-disable no-console */

// NOTE: This is a single-file example implementation. You may want to split it into multiple files.
// This code attempts to:
// - Parse YAML files from `scripts/<command>/script.yml`
// - Provide a CLI interface that supports:
//   * `./command-runner <command>`: runs the default subcommand in that script
//   * `./command-runner <command> <subcommand>`: runs a specific subcommand
//   * `./command-runner --list`: lists all commands and their subcommands
//   * `./command-runner --validate`: validates script structure
//   * `./command-runner docker dev`: example for nested command
// - Supports env variables, envFiles, steps, concurrency, and loading from node_modules/.bin
// - Suggests some extra config keys in the YAML files if needed.

// EXTRA SUGGESTIONS FOR CONFIG FILES:
// You might consider adding a `pre` and `post` step for each command, as well as `retry` counts.
// Also consider a `description` field for top-level scripts.

// This code is just a reference implementation and might need refinement to handle all edge cases properly.

import chalk from 'chalk';
import { spawn } from 'child_process';
import { execa } from 'execa';
import { existsSync, readFileSync } from 'fs';
import { sync as globSync } from 'glob';
import { join, resolve } from 'path';
import * as YAML from 'yaml';

interface CommandStep {
  command?: string;
  script?: string; // references another command from same or other script
  steps?: (CommandStep | string)[];
  concurrently?: (CommandStep | string)[];
  env?: Record<string, string>;
  envFile?: string[];
  help?: string;
  depends?: string[];
  watch?: string[];
  subcommands?: Record<string, CommandStep>;
  // Additional suggestions:
  // pre?: (CommandStep | string)[];
  // post?: (CommandStep | string)[];
  // retry?: number;
}

interface ScriptConfig {
  [subcommand: string]: CommandStep;
}

const SCRIPTS_DIR = resolve(process.cwd(), './scripts'); // Adjust if needed

// Parse CLI args
const args = process.argv.slice(2);

let listMode = false;
let validateMode = false;
const positionalArgs: string[] = [];
for (const arg of args) {
  if (arg === '--list') listMode = true;
  else if (arg === '--validate') validateMode = true;
  else positionalArgs.push(arg);
}

// Load all scripts
function loadAllScripts(): Record<string, ScriptConfig> {
  const scripts: Record<string, ScriptConfig> = {};
  const files = globSync('**/script.yml', { cwd: SCRIPTS_DIR });
  for (const file of files) {
    const fullPath = join(SCRIPTS_DIR, file);
    const yamlContent = readFileSync(fullPath, 'utf8');
    try {
      const parsed = YAML.parse(yamlContent);
      // The directory name before script.yml is the command name
      const commandName = file.split('/')[0];
      scripts[commandName] = parsed;
    } catch (err) {
      console.error(`Failed to parse ${file}: ${(err as Error).message}`);
    }
  }
  return scripts;
}

const allScripts = loadAllScripts();

// Validation function
function validateScripts(scripts: Record<string, ScriptConfig>): boolean {
  let valid = true;
  for (const [commandName, script] of Object.entries(scripts)) {
    if (typeof script !== 'object') {
      console.error(`Script ${commandName} is not an object`);
      valid = false;
      continue;
    }
    for (const [sub, subDef] of Object.entries(script)) {
      if (typeof subDef !== 'object') {
        console.error(`Subcommand ${commandName}/${sub} is not an object`);
        valid = false;
      }
      // Add more validation if needed
    }
  }
  return valid;
}

// If listing
if (listMode) {
  for (const [commandName, script] of Object.entries(allScripts)) {
    const hasDefault = script.default !== undefined;
    const defaultHelp = hasDefault ? script.default.help : '';
    console.log(
      hasDefault
        ? chalk.bold.blue(`❯ ${commandName}`)
        : chalk.bold.gray(commandName),
      defaultHelp ? chalk.gray(`: ${defaultHelp}`) : '',
    );
    for (const [sub, subDef] of Object.entries(script)) {
      if (sub === 'default') continue;
      const isLastSubcommand =
        sub === Object.keys(script)[Object.keys(script).length - 1];
      console.log(
        `  ${chalk.green(isLastSubcommand ? '└─' : '├─')} ${chalk.blue(`${commandName} ${sub}`)}${
          subDef.help ? chalk.gray(`: ${subDef.help}`) : ''
        }`,
      );
      if (subDef.subcommands && typeof subDef.subcommands === 'object') {
        const entries = Object.entries(subDef.subcommands);
        entries.forEach(([nestedSub, nestedDef], index) => {
          const isLast = index === entries.length - 1;
          console.log(
            `  ${chalk.green('│ ')}${chalk.green(
              isLast ? '└─' : '├─',
            )} ${chalk.cyan(`${commandName} ${sub} ${nestedSub}`)}${
              nestedDef.help ? chalk.gray(`: ${nestedDef.help}`) : ''
            }`,
          );
        });
      }
    }
    console.log(); // Add empty line between command groups
  }
  process.exit(0);
}

// If validating
if (validateMode) {
  const valid = validateScripts(allScripts);
  if (!valid) {
    process.exit(1);
  }
  console.log('All scripts appear to be valid.');
  process.exit(0);
}

// Run mode
// positionalArgs might look like [ "dev" ] or [ "docker", "dev" ]
// The first arg is the top-level command, subsequent is subcommands
if (positionalArgs.length === 0) {
  console.error('No command specified');
  process.exit(1);
}

const topCommand = positionalArgs[0];
const subCommands = positionalArgs.slice(1);

if (!allScripts[topCommand]) {
  console.error(`Unknown command: ${topCommand}`);
  process.exit(1);
}

function resolveCommand(
  script: ScriptConfig,
  subPath: string[],
): CommandStep | null {
  let current: CommandStep | null = null;
  // Start with script as top-level
  // If no subPath given, return `default` if exists
  if (subPath.length === 0) {
    current = script['default'] || null;
    return current;
  }
  // If subPath has one element, try that first-level subcommand
  current = script[subPath[0]] || null;
  if (!current) {
    // Maybe the top-level step defines subcommands inside it?
    // If top-level has `default` and it has `subcommands`, check inside subcommands
    if (
      script['default'] &&
      script['default'].subcommands &&
      script['default'].subcommands![subPath[0]]
    ) {
      current = script['default'].subcommands![subPath[0]];
      subPath = subPath.slice(1);
    } else {
      return null;
    }
  } else {
    subPath = subPath.slice(1);
  }

  // Traverse deeper if needed
  while (subPath.length > 0 && current) {
    if (current.subcommands && current.subcommands[subPath[0]]) {
      current = current.subcommands[subPath[0]];
      subPath = subPath.slice(1);
    } else {
      return null;
    }
  }

  return current;
}

const script = allScripts[topCommand];
const cmdDef = resolveCommand(script, subCommands);

if (!cmdDef) {
  console.error(
    `Subcommand not found for ${topCommand} ${subCommands.join(' ')}`,
  );
  process.exit(1);
}

// Handle `depends`
async function runDepends(depends: string[]) {
  for (const dep of depends) {
    // depends might look like "prisma/generate" -> run `./command-runner prisma generate`
    const parts = dep.split('/');
    const depCommand = parts[0];
    const depSubs = parts.slice(1);
    if (!allScripts[depCommand]) {
      console.error(`Dependency command not found: ${depCommand}`);
      process.exit(1);
    }
    const depScript = allScripts[depCommand];
    const depCmdDef = resolveCommand(depScript, depSubs);
    if (!depCmdDef) {
      console.error(`Dependency subcommand not found: ${dep}`);
      process.exit(1);
    }
    await runCommand(depCmdDef, depCommand, depSubs);
  }
}

// Load env from files
function loadEnvFromFiles(files: string[] | undefined) {
  if (!files) return {};
  const result: Record<string, string> = {};
  for (const file of files) {
    const path = resolve(process.cwd(), file);
    if (existsSync(path)) {
      const content = readFileSync(path, 'utf-8');
      const lines = content.split('\n');
      for (const l of lines) {
        const line = l.trim();
        if (!line || line.startsWith('#')) continue;
        const eqIdx = line.indexOf('=');
        if (eqIdx === -1) continue;
        const key = line.slice(0, eqIdx).trim();
        const val = line.slice(eqIdx + 1).trim();
        result[key] = val;
      }
    }
  }
  return result;
}

async function runSteps(
  steps: (CommandStep | string)[],
  baseEnv: Record<string, string>,
) {
  for (const step of steps) {
    if (typeof step === 'string') {
      // If string, interpret as a "command"
      await runSingleCommand(step, baseEnv);
    } else {
      // If object
      await runCommand(step, '', [], baseEnv);
    }
  }
}

async function runConcurrently(
  concurrentSteps: (CommandStep | string)[],
  baseEnv: Record<string, string>,
) {
  // We'll use `concurrently` package to run these commands in parallel
  // Build args for concurrently
  // Steps can have `command`, `script` etc.
  const mapped = await Promise.all(
    concurrentSteps.map(async (s) => {
      if (typeof s === 'string') {
        return { command: s, env: baseEnv };
      } else {
        // It's a sub-step
        // If it has `command`, run directly
        // If it has `script`, that means run `./command-runner script ...`? Let's interpret `script: "foo bar"` as `./command-runner foo bar`
        // If it has steps or anything else, too complex for concurrent. We'll just run command.
        if (s.command) {
          return { command: s.command, env: { ...baseEnv, ...(s.env || {}) } };
        } else if (s.script) {
          // parse "foo bar" -> `command-runner foo bar`
          const parts = s.script.split(' ');
          const cmdToRun = [process.argv[1], ...parts].join(' ');
          return { command: cmdToRun, env: { ...baseEnv, ...(s.env || {}) } };
        } else {
          console.error(`Unsupported concurrent step`);
          process.exit(1);
        }
      }
    }),
  );

  const binPath = resolve(process.cwd(), 'node_modules/.bin');
  // Add bin path to PATH
  const finalEnv = {
    ...process.env,
    PATH: `${binPath}:${process.env.PATH || ''}`,
  };

  // Construct args for concurrently
  // If prefix and label are provided in YAML, that would require reading them from s.
  // For simplicity, ignore styling here. If needed, add logic.
  const commandsWithLabels = mapped.map((m) => m.command);
  await execa('concurrently', commandsWithLabels, {
    stdio: 'inherit',
    env: finalEnv,
  });
}

async function runSingleCommand(cmd: string, env: Record<string, string>) {
  const binPath = resolve(process.cwd(), 'node_modules/.bin');
  const finalEnv = {
    ...process.env,
    ...env,
    PATH: `${binPath}:${process.env.PATH || ''}`,
  };

  await new Promise<void>((resolveP, rejectP) => {
    const proc = spawn(cmd, {
      shell: true,
      stdio: 'inherit',
      env: finalEnv,
    });
    proc.on('exit', (code) => {
      if (code === 0) resolveP();
      else rejectP(new Error(`Command "${cmd}" failed with code ${code}`));
    });
  });
}

// If watch is defined, we could run nodemon
async function runWithWatch(
  cmd: string,
  files: string[],
  env: Record<string, string>,
) {
  const binPath = resolve(process.cwd(), 'node_modules/.bin');
  const finalEnv = {
    ...process.env,
    ...env,
    PATH: `${binPath}:${process.env.PATH || ''}`,
  };
  const watchArgs = ['--watch', ...files, '--exec', cmd];
  await new Promise<void>((resolveP, rejectP) => {
    const proc = spawn('nodemon', watchArgs, {
      shell: true,
      stdio: 'inherit',
      env: finalEnv,
    });
    proc.on('exit', (code) => {
      if (code === 0) resolveP();
      else
        rejectP(new Error(`Watch command "${cmd}" failed with code ${code}`));
    });
  });
}

async function runCommand(
  def: CommandStep,
  cmdName: string,
  subPath: string[] = [],
  inheritedEnv: Record<string, string> = {},
) {
  const stepEnvFiles = def.envFile ? loadEnvFromFiles(def.envFile) : {};
  const combinedEnv = { ...inheritedEnv, ...(def.env || {}), ...stepEnvFiles };

  // Handle dependencies
  if (def.depends && Array.isArray(def.depends)) {
    await runDepends(def.depends);
  }

  if (def.steps && Array.isArray(def.steps)) {
    // Run each step in sequence
    await runSteps(def.steps, combinedEnv);
    return;
  }

  if (def.concurrently && Array.isArray(def.concurrently)) {
    await runConcurrently(def.concurrently, combinedEnv);
    return;
  }

  if (def.command) {
    if (def.watch && Array.isArray(def.watch) && def.watch.length > 0) {
      await runWithWatch(def.command, def.watch, combinedEnv);
    } else {
      await runSingleCommand(def.command, combinedEnv);
    }
    return;
  }

  if (def.script) {
    // script might mean calling another command-runner command
    const parts = def.script.split(' ');
    const scriptCmd = [process.argv[1], ...parts];
    const binPath = resolve(process.cwd(), 'node_modules/.bin');
    const finalEnv = {
      ...process.env,
      ...combinedEnv,
      PATH: `${binPath}:${process.env.PATH || ''}`,
    };
    await execa('node', scriptCmd.slice(1), {
      // slice(1) to remove the ts-node runner itself
      stdio: 'inherit',
      env: finalEnv,
    });
    return;
  }

  // If we reached here, it might be just a group of subcommands with no direct command
  if (def.subcommands && Object.keys(def.subcommands).length === 0) {
    console.error(
      `No actual commands to run for ${[cmdName, ...subPath].join(' ')}`,
    );
    process.exit(1);
  }
}

// Run the requested command
runCommand(cmdDef, topCommand, subCommands).catch((err) => {
  console.error(err);
  process.exit(1);
});
