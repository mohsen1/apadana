/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { core } from '@actions/core';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { findMissingFiles } from './find-missing-snapshots.mjs';
import { validateSnapshotChanges } from './validate-snapshot-changes.mjs';

vi.mock('fs');
vi.mock('child_process', () => ({
  execSync: vi.fn(),
}));
vi.mock('path');
vi.spyOn(console, 'log');
vi.mock('@actions/core', () => ({
  core: {
    setOutput: vi.fn(),
    setFailed: vi.fn(),
  },
}));

describe('findMissingFiles', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('finds missing files correctly', async () => {
    fs.readdirSync.mockReturnValue([{ name: 'test1.png', isDirectory: () => false }]);

    path.join.mockImplementation((...args) => args.join('/'));
    path.relative.mockReturnValue('test1.png');

    findMissingFiles();

    expect(core.setOutput).toHaveBeenCalledWith(
      'MISSING_SNAPSHOT_FILES',
      JSON.stringify(['test1.png']),
    );
  });
});

describe('validateSnapshotChanges', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('validates matching snapshot changes', async () => {
    const missingFiles = [
      'src/storybook-e2e/__screenshots__/storybook-screenshots.spec.ts/linux/file1.png',
      'src/storybook-e2e/__screenshots__/storybook-screenshots.spec.ts/linux/file2.png',
    ];
    process.env.MISSING_SNAPSHOT_FILES = JSON.stringify(missingFiles);
    execSync.mockReturnValue(missingFiles.join('\n'));

    await validateSnapshotChanges();
    expect(core.setFailed).not.toHaveBeenCalled();
  });

  test('fails on mismatched snapshot changes', async () => {
    process.env.MISSING_SNAPSHOT_FILES = JSON.stringify([
      'src/storybook-e2e/__screenshots__/storybook-screenshots.spec.ts/linux/file1.png',
    ]);
    execSync.mockReturnValue(
      'src/storybook-e2e/__screenshots__/storybook-screenshots.spec.ts/linux/file2.png',
    );

    await validateSnapshotChanges();
    expect(core.setFailed).toHaveBeenCalledWith(
      'Changed files do not match exactly with missing files list',
    );
  });
});
