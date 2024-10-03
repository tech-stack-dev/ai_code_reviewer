import { MENTIONED_ISSUE_REGEX } from '../regex';

export const extractIssues = (responseText: string): string[] => {
  const issues: string[] = [];

  let match;
  while ((match = MENTIONED_ISSUE_REGEX.exec(responseText)) !== null) {
    const startLine = match[1];
    const endLine = match[2];
    const issueDescription = match[3].trim();

    const formattedIssue = `Lines ${startLine}-${endLine}: ${issueDescription}`;
    issues.push(formattedIssue);
  }

  return issues;
};
