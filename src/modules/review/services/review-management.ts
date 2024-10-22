import { AIModel } from '@/modules/ai/interfaces';
import { VCS } from '@/modules/vcs/interfaces';

export class ReviewManagement {
  constructor(
    private vcs: VCS,
    private aiModel: AIModel,
  ) {}

  async execute(): Promise<void> {
    const isReviewRequested = (await this.vcs.getCurrentContext())
      .isReviewRequested;

    if (isReviewRequested) {
      const combinedDiffsAndFiles =
        await this.vcs.getDiffsAndFullFilesContent();

      const repositoryFileName = await this.vcs.bundleRepositoryToTxt();
      const aiReview = await this.aiModel.generateReview(
        combinedDiffsAndFiles ?? '',
        repositoryFileName,
      );

      await this.vcs.postReview(aiReview);
    }
  }
}
