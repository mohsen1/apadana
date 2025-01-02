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

const checkName = process.env.INPUT_TEST_NAME;

// Try to find existing check
const { data: checks } = await octokit.checks.listForRef({
  owner,
  repo,
  ref: process.env.GITHUB_SHA,
  check_name: checkName,
});

const params = {
  owner,
  repo,
  name: checkName,
  head_sha: process.env.GITHUB_SHA,
  status: 'completed',
  conclusion: process.env.INPUT_TEST_OUTCOME,
  details_url: process.env.INPUT_REPORT_URL,
};

if (checks.check_runs.length > 0) {
  await octokit.checks.update({
    check_run_id: checks.check_runs[0].id,
    ...params,
  });
} else {
  await octokit.checks.create(params);
}
