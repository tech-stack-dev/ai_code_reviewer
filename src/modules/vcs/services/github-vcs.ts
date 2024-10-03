import * as core from '@actions/core';
import * as github from '@actions/github';
import { Context } from '@actions/github/lib/context';
import { WebhookPayload } from '@actions/github/lib/interfaces';
import { Octokit } from '@octokit/rest';
import * as fs from 'fs';

import { DiffFile } from '@/types';

import { CurrentContextVCS, VCS } from '../interfaces';

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

  async getDiffFiles(): Promise<DiffFile[] | undefined> {
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
    if (!changedFiles) return;

    const diffsAndFullFiles = await Promise.all(
      changedFiles.map(async (file) => {
        const owner = this.pullRequest?.base.repo.owner.login;
        const repo = this.pullRequest?.base.repo.name;

        if (file.status === 'added') {
          return `File: ${file.filename}\n\nContent (new file):\n${file.patch}`;
        } else if (file.status === 'modified' && owner && repo) {
          const fileContentResponse = await this.octokit.repos.getContent({
            owner,
            repo,
            path: file.filename,
            mediaType: { format: 'raw' },
          });

          const fullFileContent = fileContentResponse.data as unknown as string;
          return `File: ${file.filename}\n\nDiff:\n${file.patch}\n\nFull content:\n${fullFileContent}`;
        }
      }),
    );

    return diffsAndFullFiles.filter(Boolean).join('\n\n---\n\n');
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

    await this.fetchRepositoryContent('', txtStream);

    txtStream.end();

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
