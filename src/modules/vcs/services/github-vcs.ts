import * as core from '@actions/core';
import * as github from '@actions/github';
import { Context } from '@actions/github/lib/context';
import { WebhookPayload } from '@actions/github/lib/interfaces';
import { Octokit } from '@octokit/rest';
import * as fs from 'fs';

import { parseAIReview } from '@/helpers';
import { CommentParams, DiffFile } from '@/types';

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
      const {
        number,
        base: { repo },
      } = this.pullRequest;
      const owner = repo.owner.login;
      const repoName = repo.name;

      const diffResponse = await this.octokit.request(
        `GET /repos/{owner}/{repo}/pulls/{pull_number}/files`,
        {
          owner,
          repo: repoName,
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
        if (this.pullRequest) {
          const {
            base: { repo },
          } = this.pullRequest;

          const owner = repo.owner.login;
          const repoName = repo.name;

          if (file.status === 'added') {
            return `
            ### File: ${file.filename}
            
            ### Diff (New File, Start line and End line should be specified from here):
            ${file.patch}
            `;
          } else if (file.status === 'modified' && owner && repoName) {
            const fileContentResponse = await this.octokit.repos.getContent({
              owner,
              repo: repoName,
              path: file.filename,
              mediaType: { format: 'raw' },
            });

            const fullFileContent =
              fileContentResponse.data as unknown as string;
            return `
              ### File: ${file.filename}

              ### Diff (Start line and End line of a review comment must be taken from here, **include only hunk numbers in comments**):
              ${file.patch}
              
              ### Full File content (Should be used only for context):
              
              ${fullFileContent}`;
          }
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
      if (this.pullRequest) {
        const {
          base: { repo },
        } = this.pullRequest;
        const owner = repo.owner.login;
        const repoName = repo.name;

        const response = await this.octokit.repos.getContent({
          owner,
          repo: repoName,
          path,
        });

        if (Array.isArray(response.data)) {
          for (const item of response.data) {
            if (item.type === 'dir') {
              await this.fetchRepositoryContent(item.path, txtStream);
            } else if (item.type === 'file') {
              const fileContentResponse = await this.octokit.repos.getContent({
                owner,
                repo: repoName,
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
    if (this.pullRequest) {
      const {
        base: { repo },
      } = this.pullRequest;
      const owner = repo.owner.login;
      const repoName = repo.name;

      await this.octokit.issues.createComment({
        owner,
        repo: repoName,
        issue_number: this.pullRequest?.number ?? 0,
        body: comment,
      });
    }
  }

  async postReview(aiReview: string): Promise<void> {
    if (this.pullRequest) {
      const parsedReviews = parseAIReview(aiReview);

      const commentPromises = parsedReviews.map(
        ({ file, startLine, endLine, comment }) =>
          this.postReviewComment({
            path: file,
            startLine,
            endLine,
            body: comment,
          }),
      );

      await Promise.all(commentPromises);
    }
  }

  async postReviewComment(params: {
    path: string;
    startLine: number;
    endLine: number;
    body: string;
  }): Promise<void> {
    try {
      if (!this.pullRequest) return;

      const { path, startLine, endLine, body } = params;

      const {
        number,
        base: { repo },
      } = this.pullRequest;
      const { owner, name: repoName } = repo;

      const { data: pullRequestData } = await this.octokit.pulls.get({
        owner: owner.login,
        repo: repoName,
        pull_number: number,
      });

      const commitId = pullRequestData.head.sha;

      const commentParams: CommentParams = {
        owner: owner.login,
        repo: repoName,
        pull_number: number,
        body,
        commit_id: commitId,
        path,
        side: 'RIGHT',
      };

      if (startLine === endLine) {
        await this.octokit.pulls.createReviewComment({
          ...commentParams,
          line: startLine,
        });
      } else {
        await this.octokit.pulls.createReviewComment({
          ...commentParams,
          start_line: startLine,
          line: endLine,
        });
      }
    } catch (error) {
      console.log('Error while leave a review comment: ', error);
    }
  }
}
