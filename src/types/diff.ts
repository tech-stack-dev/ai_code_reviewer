export type DiffStatus =
  | 'added'
  | 'removed'
  | 'modified'
  | 'renamed'
  | 'copied'
  | 'changed'
  | 'unchanged';

export type DiffFile = {
  sha: string;
  filename: string;
  patch?: string;
  status: DiffStatus;
  previous_filename?: string;
};
