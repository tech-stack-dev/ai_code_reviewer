export interface AIModel {
  generateReview(diffs: string, repositoryFileName: string): Promise<string>;
}
