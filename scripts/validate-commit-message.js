const { execSync } = require('child_process');

const forbiddenMessages = [
  'WIP',
  'temp',
  'fix',
  'update',
  'dummy',
  'initial commit',
  'bugfix',
  'minor changes',
  'refactor',
  'chore',
  'changes',
  'remove unused code',
  'code cleanup',
  'test',
  'some changes',
  'fix typo',
  'bump version',
  'improvements',
  'fix issue',
  'this is a commit',
  'another commit',
  'updated files'
];

const validateCommitMessage = () => {
  try {
    const commitMessage = execSync('git log -1 --pretty=%B').toString().trim();

    const commitMessagePattern = /^.{1,60}$/;
    const wordCount = commitMessage.split(/\s+/).length;

    if (forbiddenMessages.includes(commitMessage.toLowerCase())) {
      console.error(`Error: Commit message "${commitMessage}" is forbidden.
        Please avoid using generic messages such as: ${forbiddenMessages.join(', ')}.`);
      process.exit(1);
    }

    if (wordCount < 2) {
      console.error(`Error: Commit message "${commitMessage}" must contain at least 2 words.`);
      process.exit(1);
    }

    if (commitMessagePattern.test(commitMessage)) {
      console.log(`Commit message "${commitMessage}" is valid.`);
    } else {
      console.error(`Error: Commit message "${commitMessage}" is not valid.
        Commit messages must be concise and ideally no more than 60 characters.`);
      process.exit(1);
    }
  } catch (error) {
    console.error('Error getting commit message:', error.message);
    process.exit(1);
  }
};

validateCommitMessage();
