import { createAppAuth } from '@octokit/auth-app';
import { Octokit } from '@octokit/rest';

const auth = createAppAuth({
  appId: process.env.INPUT_APP_ID,
  privateKey: process.env.PRIVATE_KEY,
  installationId: process.env.GITHUB_RUN_ID,
});

const installationToken = await auth({ type: 'installation' });
const octokit = new Octokit({ auth: installationToken.token });

const checkName = process.env.INPUT_TEST_NAME;

// Try to find existing check
const { data: checks } = await octokit.checks.listForRef({
  owner: process.env.GITHUB_REPOSITORY_OWNER,
  repo: process.env.GITHUB_REPOSITORY.split('/')[1],
  ref: process.env.GITHUB_SHA,
  check_name: checkName,
});

const params = {
  owner: process.env.GITHUB_REPOSITORY_OWNER,
  repo: process.env.GITHUB_REPOSITORY.split('/')[1],
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
