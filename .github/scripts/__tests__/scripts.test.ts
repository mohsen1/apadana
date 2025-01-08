import { execSync } from 'child_process';
import fs, { Dirent } from 'fs';
import path from 'path';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { findMissingFiles } from '../find-missing-snapshots.js';
import { validateSnapshotChanges } from '../validate-snapshot-changes.js';

vi.mock('fs');
vi.mock('child_process', () => ({
  execSync: vi.fn(),
}));
vi.mock('path');
vi.spyOn(console, 'log');

describe('findMissingFiles', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('finds missing files correctly', async () => {
    vi.mocked(fs.readdirSync).mockReturnValue([
      { name: 'test1.png', isDirectory: () => false } as unknown as Dirent,
    ]);

    vi.mocked(path.join).mockImplementation((...args) => args.join('/'));
    vi.mocked(path.relative).mockReturnValue('test1.png');
    vi.mocked(fs.existsSync).mockReturnValue(false);

    await findMissingFiles();

    // eslint-disable-next-line no-console
    expect(console.log).toHaveBeenCalledWith(JSON.stringify(['test1.png']));
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
    vi.mocked(execSync).mockReturnValue(missingFiles.join('\n'));

    await validateSnapshotChanges();
  });

  test('fails on mismatched snapshot changes', async () => {
    process.env.MISSING_SNAPSHOT_FILES = JSON.stringify([
      'src/storybook-e2e/__screenshots__/storybook-screenshots.spec.ts/linux/file1.png',
    ]);
    vi.mocked(execSync).mockReturnValue(
      'src/storybook-e2e/__screenshots__/storybook-screenshots.spec.ts/linux/file2.png',
    );

    await expect(validateSnapshotChanges()).rejects.toThrow(
      'Changed files do not match missing files list',
    );
  });
});
