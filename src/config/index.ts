export const config = Object.freeze({
  aiModel: process.env.AI_MODEL ?? 'OpenAI',
  vcs: process.env.VCS ?? 'GitHub',
});
