/* eslint-disable 
  no-console,
  @typescript-eslint/no-explicit-any, 
  @typescript-eslint/no-unsafe-return, 
  @typescript-eslint/no-unsafe-argument
*/

import chalk from 'chalk';
import path from 'path';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export class Logger {
  #levelsMap: Record<LogLevel, LogLevel[]> = {
    debug: ['debug', 'info', 'warn', 'error'] as const,
    info: ['info', 'warn', 'error'] as const,
    warn: ['warn', 'error'] as const,
    error: ['error'] as const,
  } as const;
  #isEnabled = true;
  #level: LogLevel = 'debug';
  #prefix: string | undefined;

  constructor(prefix: string | undefined = undefined, level: LogLevel = 'debug') {
    this.#prefix = prefix;
    this.#level = level;
  }

  get isEnabled(): boolean {
    return this.#isEnabled;
  }

  get #currentLevel(): LogLevel[] {
    return this.#levelsMap[this.#level];
  }

  setLevel(level: LogLevel): void {
    this.#level = level;
  }

  enable(level: LogLevel = 'debug'): void {
    this.#isEnabled = true;
    this.#level = level;
  }

  disable(): void {
    this.#isEnabled = false;
  }

  #applyPrefix(messages: any[]) {
    if (this.#prefix) {
      messages.unshift(chalk.gray(`[${this.#prefix}]`));
    }
    return messages;
  }

  debug(...messages: any[]): void {
    if (this.#currentLevel.includes('debug') && this.#isEnabled)
      console.debug(...this.#applyPrefix(messages));
  }

  /**
   * logger.log is always printing as long as logger is enabled
   */
  log(...messages: any[]): void {
    if (this.#isEnabled) console.log(...this.#applyPrefix(messages));
  }

  info(...messages: any[]): void {
    if (this.#currentLevel.includes('info') && this.#isEnabled)
      console.info(...this.#applyPrefix(messages));
  }

  warn(...messages: any[]): void {
    if (this.#currentLevel.includes('warn') && this.#isEnabled)
      console.warn(...this.#applyPrefix(messages));
  }

  error(...messages: any[]): void {
    if (this.#currentLevel.includes('error') && this.#isEnabled)
      console.error(...this.#applyPrefix(messages));
  }
}

export function createLogger(filePath?: string, level: LogLevel = 'debug') {
  if (!filePath) {
    const error = new Error();
    const stackLines = error.stack?.split('\n') || [];
    const callerLine = stackLines[2]; // Skip Error and createLogger frames
    const match = callerLine?.match(/\((.*):\d+:\d+\)/) || callerLine?.match(/at (.*):\d+:\d+/);
    filePath = match?.[1] || 'unknown';
  }

  if (filePath.includes('/src/')) {
    filePath = filePath.split('/src/')[1];
  }

  const fileName = path.basename(filePath);

  const commonFileNames = ['index.ts', 'index.tsx', 'index.js', 'index.jsx', 'action.ts'];

  if (commonFileNames.includes(fileName)) {
    return new Logger(`${path.dirname(filePath)}/${fileName}`);
  }

  return new Logger(fileName, level);
}
