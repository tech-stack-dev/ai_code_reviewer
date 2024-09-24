import { Octokit } from '@octokit/rest';
import * as fs from 'fs';

const githubToken = process.env.GITHUB_TOKEN;
const octokit = new Octokit({ auth: githubToken });

async function run() {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    throw new Error('GITHUB_EVENT_PATH is not defined.');
  }

  const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
  const eventName = process.env.GITHUB_EVENT_NAME;

  if (eventName === 'pull_request' || eventName === 'issue_comment') {
    await commentOnPullRequest(eventData.pull_request);
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
