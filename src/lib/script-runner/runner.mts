#!/usr/bin/env ts-node
/* eslint-disable no-console */

import concurrently from 'concurrently';
import dotenv from 'dotenv';
import { execa } from 'execa';
import yaml from 'js-yaml';
import { readdirSync, readFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { Command, Scripts, ScriptSchema } from './types.mjs';

/**
 * Recursively loads scripts from a directory.
 *
 * @param dir - The directory to load scripts from.
 * @returns An object containing all loaded scripts.
 */
function loadScripts(dir: string): Scripts {
  const scripts: Scripts = {};
  const files = readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    if (file.isDirectory()) {
      // Recursively load scripts from subdirectories
      Object.assign(scripts, loadScripts(join(dir, file.name)));
    } else {
      const ext = extname(file.name);
      if (ext === '.yml' || ext === '.yaml') {
        // Read and parse YAML script file
        const content = readFileSync(join(dir, file.name), 'utf-8');
        const parsed = yaml.load(content);
        const result = ScriptSchema.safeParse(parsed);
        if (result.success) {
          for (const [key, val] of Object.entries(result.data)) {
            const relativeKey =
              dir === 'scripts'
                ? key
                : dir
                    .replace(/^scripts\/?/, '')
                    .split('/')
                    .filter(Boolean)
                    .concat(key)
                    .join('/');

            scripts[relativeKey] = val;
          }
        }
      }
    }
  }
  return scripts;
}

/**
 * Executes a shell command.
 *
 * @param cmd - The command to execute.
 * @returns A promise that resolves when the command completes.
 */
async function runCommand(cmd: string): Promise<void> {
  await execa('sh', ['-c', cmd], { stdio: 'inherit' });
}

/**
 * Executes a series of shell commands sequentially.
 *
 * @param steps - An array of commands to execute.
 * @returns A promise that resolves when all commands have been executed.
 */
async function runSteps(steps: string[]): Promise<void> {
  for (const step of steps) {
    await runCommand(step);
  }
}

/**
 * Executes multiple commands concurrently.
 *
 * @param items - An array of command objects with optional prefixes and labels.
 * @returns A promise that resolves when all commands have been executed.
 */
async function runConcurrently(
  items: { command: string; prefix?: string; label?: string }[],
): Promise<void> {
  const commandArray = items.map((item) => ({
    command: item.command,
    name: item.label || undefined,
    prefixColor: item.prefix || undefined,
  }));
  await concurrently(commandArray, { prefix: 'name' });
}

/**
 * Finds a command based on the provided arguments.
 *
 * @param scripts - The collection of available scripts.
 * @param args - The command-line arguments.
 * @returns The matched command or undefined if not found.
 */
function findCommand(scripts: Scripts, args: string[]): Command | undefined {
  let current: Command | undefined;

  // Start from the first argument
  current = scripts[args[0]];
  if (!current) return undefined;

  // Traverse through subcommands if more arguments are provided
  for (let i = 1; i < args.length; i++) {
    if (!current?.subcommands) return undefined;
    const next = current.subcommands[args[i]] as Command | undefined;
    if (!next) return undefined;
    current = next;
  }

  // If no further arguments are given and there is a `default` subcommand, use that
  if (
    args.length === 1 &&
    current?.subcommands &&
    current?.subcommands['default']
  ) {
    return current?.subcommands['default'];
  }

  return current;
}

/**
 * Prints help information for available scripts or a specific command.
 *
 * @param scripts - The collection of available scripts.
 * @param path - The path to the current script.
 * @param obj - The specific command object to display help for.
 */
function printHelp(scripts: Scripts, path: string[] = [], obj?: Command): void {
  if (!obj) {
    console.log('Available scripts:');
    const topKeys = Object.keys(scripts).sort();
    for (const k of topKeys) {
      const help = scripts[k].help ? ` - ${scripts[k].help}` : '';
      console.log(`  ${k}${help}`);
    }
  } else {
    console.log(`Script: ${path.join(' ')}\n`);
    if (obj.help) console.log(`Description: ${obj.help}\n`);
    if (obj.command) console.log(`Command: ${obj.command}`);
    if (obj.steps) {
      console.log('Steps:');
      for (const step of obj.steps) console.log(`  - ${step}`);
    }
    if (obj.subcommands) {
      console.log('\nSubcommands:');
      const subs = obj.subcommands as Record<string, Command>;
      for (const [subKey, subVal] of Object.entries(subs)) {
        console.log(`  ${subKey}${subVal.help ? ` - ${subVal.help}` : ''}`);
      }
    }
  }
}

// Immediately Invoked Async Function Expression to run the script
(async () => {
  // Load all scripts from the 'scripts' directory
  const scripts = loadScripts('scripts');

  // Parse command-line arguments using yargs
  const argv = yargs(hideBin(process.argv))
    .usage('$0 [command] [subcommand...]')
    .option('help', { type: 'boolean', default: false })
    .option('h', { type: 'boolean', default: false })
    .parseSync();

  const args = argv._.map((a) => a.toString());
  const showHelp = argv.help || argv.h;

  if (showHelp || args.length === 0) {
    // If help flag is present or no arguments are provided, display help
    printHelp(scripts);
    process.exit(0);
  }

  // Find the corresponding command based on arguments
  const cmd = findCommand(scripts, args);
  if (!cmd) {
    console.error('Command not found.');
    process.exit(1);
  }

  // Set environment variables if defined in the command
  if (cmd.env) {
    for (const [k, v] of Object.entries(cmd.env)) {
      process.env[k] = v; // v is string as per EnvSchema
    }
  }

  // Load environment variables from a file if specified
  if (cmd.envFile) {
    dotenv.config({ path: cmd.envFile });
  }

  // Execute the command based on its type
  if (cmd.command) {
    await runCommand(cmd.command);
  } else if (cmd.steps) {
    await runSteps(cmd.steps);
  } else if (cmd.concurrently) {
    await runConcurrently(cmd.concurrently);
  } else {
    // If the command has subcommands, display help for it
    printHelp(scripts, args, cmd);
  }
})();
