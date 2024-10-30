import { config } from '@/config';
import { AIModels } from '@/helpers';

import { OpenAIModel } from './services';

const aiModelServices = Object.freeze({
  [AIModels.OPEN_AI]: new OpenAIModel(),
});

export const currentAiModel =
  aiModelServices[config.aiModel as keyof typeof aiModelServices];
