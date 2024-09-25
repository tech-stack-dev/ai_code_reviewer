import * as core from '@actions/core';
import * as github from '@actions/github';
import { WebhookPayload } from '@actions/github/lib/interfaces';
import { Octokit } from '@octokit/rest';

const githubToken = core.getInput('github_token');
const autoTrigger = core.getInput('auto_trigger').toLowerCase() === 'true';
const octokit = new Octokit({ auth: githubToken });

async function run(): Promise<void> {
  try {
    const context = github.context;
    const payload = context.payload;

    if (context.eventName === 'pull_request' && autoTrigger) {
      await reviewPullRequest(payload.pull_request);
    } else {
      console.log('Event does not meet criteria for review');
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed('An unexpected error occurred');
    }
  }
}

async function reviewPullRequest(
  pullRequest: WebhookPayload['pull_request'],
): Promise<void> {
  if (pullRequest) {
    const { number } = pullRequest;
    const owner = pullRequest.base.repo.owner.login;
    const repo = pullRequest.base.repo.name;

    const reviewComment =
      'AI review: This is a placeholder for the AI-generated review.';

    await octokit.issues.createComment({
      owner,
      repo,
      issue_number: number,
      body: reviewComment,
    });
  }
}

run();
