const { execSync } = require('child_process');

const validateBranchName = () => {
  try {
    const branchName = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    
    const patterns = {
      main: /^main$/,
      development: /^development$/,
      integration: /^integration$/,
      feature: /^feature\/AICR-\d+-[a-z0-9-]+$/,
      release: /^release\/v\d+\.\d+(\.\d+)?$/,
      hotfix: /^hotfix\/AICR-\d+-[a-z0-9-]+$/
    };

    const matchedType = Object.keys(patterns).find(type => patterns[type].test(branchName));

    if (matchedType) {
      console.log(`Branch name "${branchName}" is valid (${matchedType} branch).`);
    } else {
      console.error(`Error: Branch name "${branchName}" is not valid.
        Branch names should follow one of these patterns:
        - main
        - development
        - integration
        - feature/AICR-<number>-brief-description
        - release/v<major>.<minor>[.<patch>]
        - hotfix/AICR-<number>-brief-description
        Examples:
        - feature/AICR-5678-new-feature
        - release/v1.0
        - hotfix/AICR-5678-fix-bug`);
      process.exit(1);
    }
  } catch (error) {
    console.error('Error getting branch name:', error.message);
    process.exit(1);
  }
};

validateBranchName();