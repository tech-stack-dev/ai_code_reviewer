const { execSync } = require('child_process');

const validateCommitMessage = () => {
  try {
    const commitMessage = execSync('git log -1 --pretty=%B').toString().trim();

    const commitMessagePattern = /^(AICR-\d+: .{1,60}|Initial commit)$/i;

    if (commitMessagePattern.test(commitMessage)) {
      console.log(`Commit message "${commitMessage}" is valid.`);
    } else {
      console.error(`Error: Commit message "${commitMessage}" is not valid.
        Commit messages must follow this format:
        JIRA-ID: Brief description
        Example: AICR-1234: Implement new feature
        - The description should be concise and ideally no more than 60 characters.
        - Use the imperative mood for the description.`);
      process.exit(1);
    }
  } catch (error) {
    console.error('Error getting commit message:', error.message);
    process.exit(1);
  }
};

validateCommitMessage();
