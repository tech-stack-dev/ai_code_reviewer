import { config } from '@/config';

import { OpenAIModel } from './services';
import { AIModels } from '@/helpers';

const aiModelServices = Object.freeze({
  [AIModels.OPEN_AI]: new OpenAIModel(),
});

export const currentAiModel =
  aiModelServices[config.aiModel as keyof typeof aiModelServices];
