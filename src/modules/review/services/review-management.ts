import { AIModel } from '@/modules/ai/interfaces';
import { VCS } from '@/modules/vcs/interfaces';

export class ReviewManagement {
  constructor(
    private vcs: VCS,
    private aiModel: AIModel,
  ) {}

  async execute(): Promise<void> {
    if ((await this.vcs.getCurrentContext()).isReviewRequested) {
      const combinedDiffsAndFiles =
        await this.vcs.getDiffsAndFullFilesContent();
      const repositoryFileName = await this.vcs.bundleRepositoryToTxt();
      const aiReview = await this.aiModel.generateReview(
        combinedDiffsAndFiles ?? '',
        repositoryFileName,
      );
      await this.vcs.postComment(aiReview);
    }
  }
}
