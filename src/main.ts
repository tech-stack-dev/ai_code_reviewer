import { Octokit } from '@octokit/rest';

const githubToken = process.env.GITHUB_TOKEN;
const octokit = new Octokit({ auth: githubToken });

async function run() {
  const context = process.env.GITHUB_EVENT_NAME;

  if (context === 'pull_request' || context === 'issue_comment') {
    const pullRequest = JSON.parse(process.env.GITHUB_EVENT_BODY ?? '');
    await commentOnPullRequest(pullRequest);
  }
}

async function commentOnPullRequest(pullRequest: any) {
  const { owner, repo, number } = pullRequest;

  await octokit.issues.createComment({
    owner,
    repo,
    issue_number: number,
    body: "Testing a bot", 
  });
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
