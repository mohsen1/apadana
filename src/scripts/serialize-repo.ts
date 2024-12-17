// run by
// pnpm tsx src/scripts/serialize-repo.ts
import * as fs from 'fs';
import * as path from 'path';

const IGNORED_DIRS = [
  'node_modules',
  '.next',
  'dist',
  'build',
  'coverage',
  '.git',
  'test-results',
  'playwright-report',
];

const IGNORED_FILES = [
  '.DS_Store',
  'yarn.lock',
  'package-lock.json',
  'pnpm-lock.yaml',
];

const ALLOWED_EXTENSIONS = [
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.json',
  '.yml',
  '.yaml',
  '.env',
  '.env.example',
  '.gitignore',
  '.dockerignore',
  'Dockerfile',
  '.md',
];

function shouldInclude(filePath: string): boolean {
  const ext = path.extname(filePath);
  const basename = path.basename(filePath);

  // Check if file should be ignored
  if (IGNORED_FILES.includes(basename)) return false;

  // Check if extension is allowed
  if (!ALLOWED_EXTENSIONS.includes(ext) && ext !== '') return false;

  return true;
}

function serializeDirectory(dirPath: string, output: string[] = []): string[] {
  const items = fs.readdirSync(dirPath);

  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const relativePath = path.relative(process.cwd(), fullPath);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      // Skip ignored directories
      if (IGNORED_DIRS.includes(item)) continue;

      serializeDirectory(fullPath, output);
    } else if (stats.isFile() && shouldInclude(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      output.push(
        `\n### ${relativePath}\n`,
        '```' + path.extname(item).slice(1) + '\n',
        content,
        '```\n',
      );
    }
  }

  return output;
}

function main() {
  const output = serializeDirectory(process.cwd());
  fs.writeFileSync('repo-content.md', output.join('\n'));
  // eslint-disable-next-line no-console
  console.log('Repository content serialized to repo-content.md');
}

main();
