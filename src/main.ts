import { Octokit } from '@octokit/rest';
import * as core from '@actions/core';
import * as github from '@actions/github';

const githubToken = core.getInput('github_token');
const octokit = new Octokit({ auth: githubToken });

async function run() {
  try {
    const context = github.context;
    const payload = context.payload;

    if (payload.pull_request) {
      await commentOnPullRequest(payload.pull_request);
    } else if (payload.issue) {
      await commentOnPullRequest(payload.issue);
    } else {
      core.setFailed('This action only works on pull requests and issues.');
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed('An unexpected error occurred');
    }
  }
}

async function commentOnPullRequest(pullRequest: any) {
  const { owner, repo } = github.context.repo;
  const issue_number = pullRequest.number;

  console.log(`Owner: ${owner}, Repo: ${repo}, Issue Number: ${issue_number}`);

  await octokit.issues.createComment({
    owner,
    repo,
    issue_number,
    body: "Testing a bot", 
  });
}

run();