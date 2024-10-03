import * as core from '@actions/core';
import * as github from '@actions/github';
import { Context } from '@actions/github/lib/context';
import { WebhookPayload } from '@actions/github/lib/interfaces';
import { Octokit } from '@octokit/rest';
import * as fs from 'fs';

import { CurrentContextVCS, ReviewRequestData, VCS } from '../interfaces';
import { DiffFile } from '@/types';

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
    const autoTrigger = this.getInput('auto_trigger') === 'true';
    return {
      isReviewRequested: this.context.eventName === 'pull_request' && autoTrigger,
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

  async getDiffFiles(): Promise<DiffFile[] | undefined> {
    if (!this.pullRequest) return;

    const { number } = this.pullRequest;
    const { owner, name: repo } = this.pullRequest.base.repo;

    const diffResponse = await this.octokit.request(`GET /repos/{owner}/{repo}/pulls/{pull_number}/files`, {
      owner: owner.login,
      repo,
      pull_number: number,
    });

    return diffResponse.data;
  }

  async getDiffsAndFullFilesContent(): Promise<string | undefined> {
    const changedFiles = await this.getDiffFiles();
    if (!changedFiles) return;

    const diffsAndFullFiles = await Promise.all(changedFiles.map(async (file) => {
      if (file.status === 'added') {
        return `File: ${file.filename}\n\nContent (new file):\n${file.patch}`;
      }

      if (file.status === 'modified') {
        const fullFileContent = await this.getFullFileContent(file.filename);
        return `File: ${file.filename}\n\nDiff:\n${file.patch}\n\nFull content:\n${fullFileContent}`;
      }

      return null;
    }));

    return diffsAndFullFiles.filter(Boolean).join('\n\n---\n\n');
  }

  private async getFullFileContent(filename: string): Promise<string> {
    const owner = this.pullRequest?.base.repo.owner.login;
    const repo = this.pullRequest?.base.repo.name;

    const fileContentResponse = await this.octokit.repos.getContent({
      owner,
      repo,
      path: filename,
      mediaType: { format: 'raw' },
    });

    return fileContentResponse.data as unknown as string;
  }

  async fetchRepositoryContent(path: string, txtStream: fs.WriteStream): Promise<void> {
    try {
      const owner = this.pullRequest?.base.repo.owner.login;
      const repo = this.pullRequest?.base.repo.name;

      const response = await this.octokit.repos.getContent({ owner, repo, path });

      if (Array.isArray(response.data)) {
        await Promise.all(response.data.map(item => {
          if (item.type === 'dir') {
            return this.fetchRepositoryContent(item.path, txtStream);
          }

          if (item.type === 'file') {
            return this.writeFileContent(item.path, txtStream);
          }

          return null;
        }));
      }
    } catch (error) {
      console.error(`Error fetching directory content for path: ${path}`, error);
      throw error;
    }
  }

  private async writeFileContent(filePath: string, txtStream: fs.WriteStream): Promise<void> {
    const owner = this.pullRequest?.base.repo.owner.login;
    const repo = this.pullRequest?.base.repo.name;

    const fileContentResponse = await this.octokit.repos.getContent({
      owner,
      repo,
      path: filePath,
      mediaType: { format: 'raw' },
    });

    txtStream.write(`\n\nFile: ${filePath}\n\n${fileContentResponse.data}\n`);
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
