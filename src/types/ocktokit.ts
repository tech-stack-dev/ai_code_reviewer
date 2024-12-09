export type CommentParams = {
  owner: string;
  repo: string;
  pull_number: number;
  body: string;
  commit_id: string;
  path: string;
  side: 'RIGHT' | 'LEFT';
};
