import * as core from '@actions/core';
import * as github from '@actions/github';
import { Context } from '@actions/github/lib/context';
import { WebhookPayload } from '@actions/github/lib/interfaces';
import { Octokit } from '@octokit/rest';
import * as fs from 'fs';

import { parseAIReview } from '@/helpers';
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
            return `File: ${file.filename}\n\nContent (new file):\n${file.patch}`;
          } else if (file.status === 'modified' && owner && repoName) {
            const fileContentResponse = await this.octokit.repos.getContent({
              owner,
              repo: repoName,
              path: file.filename,
              mediaType: { format: 'raw' },
            });

            console.log(`FILE PATCH: ${file.patch}`)

            const fullFileContent =
              fileContentResponse.data as unknown as string;
            return `
              ### File: ${file.filename}

              ### Diff (Start Line and End Line should be specified from here):
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
          this.postMultiLineReviewComment({
            path: file,
            startLine,
            endLine,
            body: comment,
          }),
      );

      await Promise.all(commentPromises);
    }
  }

  async postMultiLineReviewComment({
    path,
    startLine,
    endLine,
    body,
  }: {
    path: string;
    startLine: number;
    endLine: number;
    body: string;
  }): Promise<void> {
    if (this.pullRequest) {
      const {
        number,
        base: { repo },
      } = this.pullRequest;
      const owner = repo.owner.login;
      const repoName = repo.name;

      const { data: pullRequestData } = await this.octokit.pulls.get({
        owner,
        repo: repoName,
        pull_number: number,
      });

      const commitId = pullRequestData.head.sha;

      // const diffFiles = await this.octokit.pulls.listFiles({
      //   owner,
      //   repo: repoName,
      //   pull_number: number,
      // });

      // const validFile = diffFiles.data.find((file) => file.filename === path);
      // if (!validFile) {
      //   throw new Error(`Invalid file path: ${path}`);
      // }

      // if (startLine < 0 || endLine > validFile.changes) {
      //   throw new Error(
      //     `Invalid line range: ${startLine}-${endLine} in file ${path}`,
      //   );
      // }

      if (startLine === endLine) {
        await this.octokit.pulls.createReviewComment({
          owner,
          repo: repoName,
          pull_number: number,
          body: body,
          commit_id: commitId,
          path: path,
          line: startLine,
          side: 'RIGHT',
        });
      } else {
        await this.octokit.pulls.createReviewComment({
          owner,
          repo: repoName,
          pull_number: number,
          body: body,
          commit_id: commitId,
          start_line: startLine,
          path: path,
          line: endLine,
          side: 'RIGHT',
        });
      }
    }
  }
}
