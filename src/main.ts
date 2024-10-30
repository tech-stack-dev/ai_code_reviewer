import { currentAiModel, currentVCS, ReviewManagement } from '@/modules';

async function run(): Promise<void> {
  const reviewProcess = new ReviewManagement(currentVCS, currentAiModel);
  reviewProcess.execute();
}

run()
  .then(() => console.log('GitHub Action completed'))
  .catch((error) => console.error('Unhandled error in GitHub Action:', error));
