import * as core from '@actions/core';
import { Octokit } from '@octokit/rest';

const githubToken = core.getInput('GITHUB_TOKEN');

export const octokit = new Octokit({
  auth: githubToken,
});
