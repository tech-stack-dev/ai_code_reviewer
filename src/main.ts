import { Octokit } from '@octokit/rest';
import * as core from '@actions/core';
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

  core.info(`Event Name: ${eventName}`);
  core.info(`Event Data: ${JSON.stringify(eventData, null, 2)}`);

  if (eventName === 'pull_request') {
    await commentOnPullRequest(eventData.pull_request);
  } else if (eventName === 'issue_comment') {
    await commentOnPullRequest(eventData.issue);
  }
}

async function commentOnPullRequest(pullRequest: any) {
  const { owner, repo, number } = pullRequest;

  core.info(`Owner: ${owner}, Repo: ${repo}, Issue Number: ${number}`);

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
