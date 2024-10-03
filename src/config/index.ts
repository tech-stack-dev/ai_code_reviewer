import { DEFAULT_AI_MODEL, DEFAULT_VCS } from '@/helpers';

export const config = Object.freeze({
  aiModel: process.env.AI_MODEL ?? DEFAULT_AI_MODEL,
  vcs: process.env.VCS ?? DEFAULT_VCS,
});
