import * as fs from 'fs';

export interface VCS {
  getCurrentContext(): Promise<CurrentContextVCS>;
  getReviewRequestData(prId: number): Promise<ReviewRequestData>;
  getDiffFiles(prId: number): Promise<
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
  >;
  postComment(comment: string): Promise<void>;
  getDiffsAndFullFilesContent(): Promise<string | undefined>;
  fetchRepositoryContent(
    path: string,
    txtStream: fs.WriteStream,
  ): Promise<void>;
  getInput(input: string): string;
  bundleRepositoryToTxt(): Promise<string>;
}

export interface ReviewRequestData {
  id: number;
  title: string;
  description: string;
  repoName: string;
  repoOwner: string;
}

export interface CurrentContextVCS {
  isReviewRequested: boolean;
}
