import * as core from '@actions/core';
import * as github from '@actions/github';
import { Context } from '@actions/github/lib/context';
import { WebhookPayload } from '@actions/github/lib/interfaces';
import { Octokit } from '@octokit/rest';
import * as fs from 'fs';

import { CurrentContextVCS, ReviewRequestData, VCS } from '../interfaces';

const githubToken = core.getInput('github_token');

export class GitHubVCS implements VCS {
  private octokit: Octokit;
  private context: Context;
  private pullRequest: WebhookPayload['pull_request'];

  constructor() {
    this.octokit = new Octokit({ auth: githubToken });
    this.context = github.context;
    this.pullRequest = this.context.payload.pull_request;
  }

  getInput(input: string): string {
    return core.getInput(input);
  }

  async getCurrentContext(): Promise<CurrentContextVCS> {
    const autoTrigger = core.getInput('auto_trigger').toLowerCase() === 'true';

    return {
      isReviewRequested:
        this.context.eventName === 'pull_request' && autoTrigger,
    };
  }

  async getReviewRequestData(prId: number): Promise<ReviewRequestData> {
    const { data } = await this.octokit.pulls.get({
      owner: 'owner',
      repo: 'repo',
      pull_number: prId,
    });

    return {
      id: data.number,
      title: data.title,
      description: data.body ?? '',
      repoName: data.base.repo.name,
      repoOwner: data.base.repo.owner.login,
    };
  }

  async getDiffFiles(): Promise<
    | {
        sha: string;
        filename: string;
        patch?: string;
        status:
          | 'added'
          | 'removed'
          | 'modified'
          | 'renamed'
          | 'copied'
          | 'changed'
          | 'unchanged';
        previous_filename?: string;
      }[]
    | undefined
  > {
    if (this.pullRequest) {
      const { number } = this.pullRequest;
      const owner = this.pullRequest.base.repo.owner.login;
      const repo = this.pullRequest.base.repo.name;

      const diffResponse = await this.octokit.request(
        `GET /repos/{owner}/{repo}/pulls/{pull_number}/files`,
        {
          owner,
          repo,
          pull_number: number,
        },
      );

      return diffResponse.data;
    }
  }

  async getDiffsAndFullFilesContent(): Promise<string | undefined> {
    const changedFiles = await this.getDiffFiles();
    const diffsAndFullFiles: string[] = [];

    if (changedFiles) {
      for (const file of changedFiles) {
        if (file.status === 'added') {
          console.log(
            `New file detected: ${file.filename}, using diff as full content.`,
          );
          diffsAndFullFiles.push(
            `File: ${file.filename}\n\nContent (new file):\n${file.patch}`,
          );
        } else if (file.status === 'modified') {
          console.log(
            `Fetching full content for modified file: ${file.filename}`,
          );

          const owner = this.pullRequest?.base.repo.owner.login;
          const repo = this.pullRequest?.base.repo.name;

          const fileContentResponse = await this.octokit.repos.getContent({
            owner,
            repo,
            path: file.filename,
            mediaType: {
              format: 'raw',
            },
          });

          const fullFileContent = fileContentResponse.data as unknown as string;
          const diffAndFile = `File: ${file.filename}\n\nDiff:\n${file.patch}\n\nFull content:\n${fullFileContent}`;
          diffsAndFullFiles.push(diffAndFile);
        }
      }

      return diffsAndFullFiles.join('\n\n---\n\n');
    }
  }

  async fetchRepositoryContent(
    path: string,
    txtStream: fs.WriteStream,
  ): Promise<void> {
    try {
      const owner = this.pullRequest?.base.repo.owner.login;
      const repo = this.pullRequest?.base.repo.name;

      const response = await this.octokit.repos.getContent({
        owner,
        repo,
        path,
      });

      if (Array.isArray(response.data)) {
        for (const item of response.data) {
          if (item.type === 'dir') {
            await this.fetchRepositoryContent(item.path, txtStream);
          } else if (item.type === 'file') {
            const fileContentResponse = await this.octokit.repos.getContent({
              owner,
              repo,
              path: item.path,
              mediaType: {
                format: 'raw',
              },
            });

            txtStream.write(
              `\n\nFile: ${item.path}\n\n${fileContentResponse.data}\n`,
            );
          }
        }
      }
    } catch (error) {
      console.error(
        `Error fetching directory content for path: ${path}`,
        error,
      );
      throw error;
    }
  }

  async bundleRepositoryToTxt(): Promise<string> {
    const txtFilePath = 'repository.txt';
    const txtStream = fs.createWriteStream(txtFilePath);

    console.log('Fetching repository content using Octokit...');

    await this.fetchRepositoryContent('', txtStream);

    txtStream.end();
    console.log('Repository content written to repository.txt');

    return txtFilePath;
  }

  async postComment(comment: string): Promise<void> {
    const owner = this.pullRequest?.base.repo.owner.login;
    const repo = this.pullRequest?.base.repo.name;

    await this.octokit.issues.createComment({
      owner,
      repo,
      issue_number: this.pullRequest?.number ?? 0,
      body: comment,
    });
  }
}
