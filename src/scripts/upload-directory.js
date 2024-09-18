#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');
const core = require('@actions/core');

(async () => {
  if (!process.env.UPLOADTHING_SECRET) {
    console.error('Please set the UPLOADTHING_SECRET environment variable.');
    process.exit(1);
  }

  // Get the directory from command-line arguments
  const dir = process.argv[2];
  if (!dir) {
    console.error('Usage: node src/scripts/upload-directory.js <directory>');
    process.exit(1);
  }

  // Resolve the absolute path of the directory
  const dirPath = path.resolve(process.cwd(), dir);

  console.log(`Uploading directory: ${dirPath}`);

  // Read all entries in the directory
  let entries;
  try {
    entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
  } catch (err) {
    console.error(`Error reading directory '${dirPath}': ${err.message}`);
    process.exit(1);
  }

  // Filter to only files
  const fileEntries = entries.filter((entry) => entry.isFile());
  const filePaths = fileEntries.map((entry) => path.join(dirPath, entry.name));

  if (filePaths.length === 0) {
    console.log(`No files found in directory '${dirPath}'.`);
    process.exit(0);
  }

  // Initialize UTApi after dotenv configuration
  const { UTApi } = require('uploadthing/server');
  const utapi = new UTApi({
    apiKey: process.env.UPLOADTHING_SECRET,
  });

  console.log(`Starting upload of ${filePaths.length} file(s)...\n`);

  const uploadedFiles = await execAsync(
    filePaths,
    async (filePath) => {
      const fileName = path.basename(filePath);
      try {
        const fileData = await fs.promises.readFile(filePath);
        let file;

        // Use global File class if available (Node.js v18+)
        if (typeof File !== 'undefined') {
          file = new File([fileData], fileName);
        } else {
          // If File is not available, use a simple object
          file = {
            name: fileName,
            data: fileData,
            size: fileData.length,
            type: '', // You can set the MIME type if needed
          };
        }

        const response = await utapi.uploadFiles(file);

        if (response.error) {
          console.error(
            `Error uploading '${fileName}': ${response.error.message}`,
          );
          return null;
        } else {
          console.log(`Uploaded '${fileName}'`);
          return response.data;
        }
      } catch (error) {
        console.error(`Error processing '${fileName}': ${error.message}`);
        return null;
      }
    },
    5,
  );

  // After all uploads are done, find the URL of 'index.html'
  const indexFile = uploadedFiles.find(
    (file) => file && file.name === 'index.html',
  );
  if (indexFile) {
    console.log(`\nPublic URL to 'index.html': ${indexFile.url}`);
    // Set the output variable 'url' in GitHub Actions context
    if (process.env.GITHUB_ACTIONS === 'true') {
      core.setOutput('url', indexFile.url);
    }
  } else {
    console.error(`\n'index.html' not found in uploaded files.`);
  }
})();

/**
 * Executes a function for each item in a list with concurrency limit.
 *
 * @param {Array} list - The list of items to process.
 * @param {Function} fn - The function to execute for each item.
 * @param {number} limit - The maximum number of concurrent executions.
 * @returns {Promise<Array>} - A promise that resolves to an array of results.
 */
function execAsync(list, fn, limit) {
  const results = [];
  let index = 0;

  function enqueue() {
    if (index >= list.length) {
      return Promise.resolve();
    }
    const currentIndex = index++;
    return Promise.resolve(fn(list[currentIndex])).then((result) => {
      results[currentIndex] = result;
      return enqueue();
    });
  }

  const promises = [];
  for (let i = 0; i < Math.min(limit, list.length); i++) {
    promises.push(enqueue());
  }

  return Promise.all(promises).then(() => results);
}
