const fs = require('fs');
const {forbiddenCommitMessages} = require('./constants');

const MIN_WORD_AMOUNT = 2

const validateCommitMessage = (commitMessage) => {
  const commitMessagePattern = /^.{1,60}$/;
  const wordCount = commitMessage.split(/\s+/).length;

  if (forbiddenCommitMessages.includes(commitMessage.toLowerCase())) {
    console.error(`Error: Commit message "${commitMessage}" is forbidden.
      Please avoid using generic messages such as: ${forbiddenMessages.join(', ')}.`);
    process.exit(1);
  }

  if (wordCount < MIN_WORD_AMOUNT) {
    console.error(`Error: Commit message "${commitMessage}" must contain at least ${MIN_WORD_AMOUNT} words.`);
    process.exit(1);
  }

  if (!commitMessagePattern.test(commitMessage)) {
    console.error(`Error: Commit message "${commitMessage}" is not valid.
      Commit messages must be concise and ideally no more than 60 characters.`);
    process.exit(1);
  }

  console.log(`Commit message "${commitMessage}" is valid.`);
};

const commitMessageFile = process.argv[2];
try {
  const commitMessage = fs.readFileSync(commitMessageFile, 'utf8').trim();
  validateCommitMessage(commitMessage);
} catch (error) {
  console.error('Error reading commit message:', error.message);
  process.exit(1);
}
