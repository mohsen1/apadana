import { createAppAuth } from '@octokit/auth-app';
import { Octokit } from '@octokit/rest';

// Parse repository information from GITHUB_REPOSITORY
const [owner, repo] = (process.env.GITHUB_REPOSITORY || '').split('/');

if (!owner || !repo) {
  throw new Error(`Invalid GITHUB_REPOSITORY: ${process.env.GITHUB_REPOSITORY}`);
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
  target_url: process.env.INPUT_REPORT_URL,
  description: 'Results',
  context: process.env.INPUT_TEST_NAME,
});
