import * as fs from 'fs';

import { DiffFile } from '@/types';

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

export interface VCS {
  getCurrentContext(): Promise<CurrentContextVCS>;
  getDiffFiles(prId: number): Promise<DiffFile[] | undefined>;
  postComment(comment: string): Promise<void>;
  postReview(aiReview: string): Promise<void>;
  getDiffsAndFullFilesContent(): Promise<string | undefined>;
  fetchRepositoryContent(
    path: string,
    txtStream: fs.WriteStream,
  ): Promise<void>;
  getInput(input: string): string;
  bundleRepositoryToTxt(): Promise<string>;
}
