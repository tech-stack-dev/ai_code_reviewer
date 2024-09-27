import { config } from '@/config';

import { AIModels } from './constants';
import { OpenAIModel } from './services';

const aiModelServices = Object.freeze({
  [AIModels.OPEN_AI]: new OpenAIModel(),
});

export const currentAiModel =
  aiModelServices[config.aiModel as keyof typeof aiModelServices];
