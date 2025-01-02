import { createAppAuth } from '@octokit/auth-app';
import { Octokit } from '@octokit/rest';

// Parse repository information from GITHUB_REPOSITORY
const [owner, repo] = (process.env.GITHUB_REPOSITORY || '').split('/');

if (!owner || !repo) {
  throw new Error(`Invalid GITHUB_REPOSITORY: ${process.env.GITHUB_REPOSITORY}`);
}

/** @type {string | undefined} */
const s3UploadResult = process.env.S3_UPLOAD_RESULT;

if (!s3UploadResult) {
  throw new Error('S3_UPLOAD_RESULT is not set');
}

const indexHtmlLocationPath = process.env.INPUT_INDEX_HTML_LOCATION_PATH;

if (!indexHtmlLocationPath) {
  throw new Error('INDEX_HTML_LOCATION_PATH is not set');
}

// Process S3 upload results to get report URL
/** @type {string[]} */
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const locations = JSON.parse(s3UploadResult);
const reportUrl = locations.find((location) => location.endsWith(indexHtmlLocationPath));

if (!reportUrl) {
  throw new Error('No index.html found in upload results');
}

// Create app authentication first
const appAuth = createAppAuth({
  appId: process.env.INPUT_APP_ID,
  privateKey: process.env.PRIVATE_KEY,
});

// Get JWT token for app authentication
const appAuthToken = await appAuth({ type: 'app' });

// Create Octokit instance with app authentication
const appOctokit = new Octokit({
  auth: appAuthToken.token,
});

// Get the installation ID for the repository
const { data: installation } = await appOctokit.apps.getRepoInstallation({
  owner,
  repo,
});

// Now get installation token
const installationAuth = await appAuth({
  type: 'installation',
  installationId: installation.id,
});

// Create final Octokit instance with installation token
const octokit = new Octokit({
  auth: installationAuth.token,
});

await octokit.rest.repos.createCommitStatus({
  owner,
  repo,
  sha: process.env.GITHUB_SHA,
  state: process.env.INPUT_TEST_OUTCOME === 'success' ? 'success' : 'failure',
  target_url: reportUrl,
  description: `Click to view ${process.env.INPUT_TEST_NAME}`,
  context: process.env.INPUT_TEST_NAME,
});
