/* eslint-disable no-console */

import fs from 'fs';
import http from 'http';
import stripAnsi from 'strip-ansi';

// Add error handling for file operations
/**
 * @param {string} path
 * @returns {string}
 */
const safeReadFile = (path) => {
  try {
    return fs.readFileSync(path, 'utf8');
  } catch (err) {
    console.error(`Error reading file ${path}:`, err);
    return '';
  }
};

const ERROR_FILE = '/tmp/build_error.txt';
const BUILD_IN_PROGRESS_FILE = '/tmp/build_in_progress';
const REBUILD_TRIGGER_FILE = '/tmp/rebuild_trigger';

const server = http.createServer((req, res) => {
  if (req.url === '/api/health') {
    res.writeHead(200);
    res.end('OK');
    return;
  }

  if (req.method === 'POST' && req.url === '/api/rebuild') {
    fs.writeFileSync(REBUILD_TRIGGER_FILE, new Date().toISOString());
    res.writeHead(302, { Location: '/' });
    res.end();
    return;
  }

  const isError = fs.existsSync(ERROR_FILE);
  const isBuildInProgress = fs.existsSync(BUILD_IN_PROGRESS_FILE);

  let buildMessage = '';
  if (isError) {
    buildMessage = stripAnsi(safeReadFile(ERROR_FILE));
  } else if (isBuildInProgress) {
    buildMessage = stripAnsi(safeReadFile(BUILD_IN_PROGRESS_FILE));
  }

  buildMessage = buildMessage.replace(/\n/g, '<br>');

  const html = `<!DOCTYPE html>
    <html>
      <head>
        <meta http-equiv="refresh" content="5" />
        <title>${isError ? 'Build Failed' : 'Building...'}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta charset="utf-8">
        <style>
          :root {
            color-scheme: light dark;
            --bg-primary: #fcfcfc;
            --text-primary: #333;
            --border-subtle: #d1d5db;
            --bg-subtle: #f3f4f6;
            --loader-border: #eee;
            --loader-accent: #3b82f6;
            --error-bg: #fee2e2;
            --error-border: #ef4444;
            --error-text: #991b1b;
            --btn-primary: #3b82f6;
            --btn-hover: #2563eb;
            --btn-disabled: #93c5fd;
            --btn-text: white;
          }
          @media (prefers-color-scheme: dark) {
            :root {
              --bg-primary: #1a1a1a;
              --text-primary: #e5e5e5;
              --border-subtle: #4b5563;
              --bg-subtle: #1f2937;
              --loader-border: #333;
              --error-bg: #450a0a;
              --error-border: #b91c1c;
              --error-text: #fca5a5;
              --btn-disabled: #1d4ed8;
              --btn-text: #93c5fd;
            }
          }
          html, body {
            margin: 0;
            padding: 0;
            background-color: var(--bg-primary);
            color: var(--text-primary);
            transition: background-color 0.3s ease, color 0.3s ease;
          }
          body {
            display: grid;
            place-items: center;
            height: 100vh;
            font-family: sans-serif;
          }
          .container {
            text-align: center;
            padding: 2rem;
          }
          .loader {
            width: 48px;
            height: 48px;
            border: 5px solid var(--loader-border);
            border-bottom-color: var(--loader-accent);
            border-radius: 50%;
            display: inline-block;
            box-sizing: border-box;
            animation: rotation 1s linear infinite;
            margin: 1rem 0;
          }
          @keyframes rotation {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .message {
            margin-top: 1rem;
            padding: 1rem;
            border-radius: 0.5rem;
            font-family: monospace;
            max-width: 800px;
            max-height: 600px;
            overflow-y: auto;
            white-space: pre-wrap;
            text-align: left;
            display: flex;
            flex-direction: column-reverse;
          }
          .error {
            background: var(--error-bg);
            border: 1px solid var(--error-border);
            color: var(--error-text);
          }
          .build {
            background: var(--bg-subtle);
            border: 1px solid var(--border-subtle);
            color: var(--text-primary);
          }
          .rebuild-btn {
            margin-top: 1rem;
            padding: 0.5rem 1rem;
            border-radius: 0.25rem;
            background: var(--btn-primary);
            color: var(--btn-text);
            border: none;
            cursor: pointer;
            font-size: 1rem;
          }
          .rebuild-btn:hover {
            background: var(--btn-hover);
          }
          .rebuild-btn:disabled {
            background: var(--btn-disabled);
            color: var(--btn-text);
            cursor: not-allowed;
          }
          form {
            margin-top: 1rem;
          }
        </style>
        <script>
          function handleSubmit(e) {
            const btn = e.target.querySelector('button');
            btn.disabled = true;
            btn.textContent = 'Rebuilding...';
          }
        </script>
      </head>
      <body>
        <div class="container">
          ${
            isError
              ? `
            <h1>Build Failed</h1>
            ${buildMessage ? `<div class="message error">${buildMessage}</div>` : ''}
            <p>Fix the build error and click rebuild to retry the build</p>
            <form method="POST" action="/api/rebuild" onsubmit="handleSubmit(event)">
              <button type="submit" class="rebuild-btn" ${!isError ? 'disabled' : ''}>
                Rebuild Now
              </button>
            </form>
          `
              : `
            <h1>The production app is building</h1>
            <div class="loader"></div>
            ${buildMessage ? `<div class="message build">${buildMessage}</div>` : ''}
            <p>You will be redirected to the production app when it's ready.</p>
          `
          }
        </div>
      </body>
    </html>`;

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
});

server.listen(3030);

// Add graceful shutdown
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Placeholder server shutting down');
    process.exit(0);
  });
});
