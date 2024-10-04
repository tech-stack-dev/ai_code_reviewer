import { reviewIssues } from '@/helpers';

export const diffsReviewPrompts = (
  diffs: string,
  issueType: keyof typeof reviewIssues,
  addressedIssues: string,
): string => {
  const selectedConfig = reviewIssues[issueType];

  const formattedPoints = selectedConfig.points
    .map((point, index) => (index % 2 === 0 ? `- **${point}:**` : point))
    .join('\n');

  return `
## Context 

## Task Description 

You will review the code changes provided (in diff format) and leave specific, actionable comments where necessary. The focus areas include:

## 1. Prioritization Category: ${selectedConfig.title}

${formattedPoints}

${addressedIssues}

## 2. Avoiding False Positives:
Avoid leaving unnecessary comments on code that adheres to the project’s standards, even if it's not your personal preference.
Be specific in identifying real issues or improvements, and skip comments that are too vague or speculative.
Do not raise concerns unless they clearly violate standards of the repository, considering the repository context at all times.

## Input Format 

You will receive: 

1. Code changes (diffs) with line numbers, indicating specific lines modified or added. 
2. Original code that was replaced, if applicable. 
3. Full file content for more context.
4. Focus on commenting only on diff hunks

Example: 
### Example changes
#### File: \`my_module.py\`
Full file content:
\`\`\`python
1: import os
2: def existing_function():
3:     new_variable = 5
4:     result = new_variable * 2
5:     return result
\`\`\`

Diff:
\`\`\`diff
@@ -3,7 +3,9 @@ 
+ 	new_variable = 5 
+ 	result = new_variable * 2 
- 	result = 0 
return result
\`\`\`

## Expected Output
Provide detailed review comments in Markdown format. Each comment should:
- Reference specific line numbers within the newly added or modified code.
- Focus on a single issue or suggestion.
- Include code examples or corrections where appropriate.
- Aim for a constructive and collaborative tone in your feedback.
- Provide concise answers without additional explanations or apologies.
- Give me the information directly without any introductory sentences.
- Exclude any extra wording and just provide the essential answer.
- Look for opportunities to improve the overall solution.
- Evaluate if changes align with project guidelines and best practices.
- Please focus solely on the points outlined in the Prioritization Category section. Avoid commenting on anything unrelated to those points.
- Do not repeat the same issue over and over again.
- Do not describe the changes that have been made focus specifically on pointing out issues.
- Consider any potential impacts on the overall system, if applicable.


## Output Format

### Comment on lines X-Y 
File: path to file goes here
Start line: X
End line: Y
Comment: Description of the issue or suggestion. 
\`\`\`diff 
- Problematic or original code 
+ Suggested correction or improvement
\`\`\`

## Review Guidelines

1. Specificity: Provide objective insights based on the given context. Avoid general feedback or summaries of changes.

2. Scope: Focus primarily on the code presented but also you can mention potential system impacts

3. Formatting:
   - Use fenced code blocks with appropriate language identifiers.
   - For suggested fixes, use diff code blocks (see Output Format above).
   - Ensure code in your comments is properly formatted and indented.

4. Line Number References:
   - **The start and end line numbers for each comment should be explicitly mentioned.**
   - **For single-line comments, the start and end line numbers should be identical.**
   - **For multi-line comments, indicate the start and end lines for the comment range.**
   - **It is crucial to mention correct start and end lines so that the comment will be placed correctly in the diff hunk.**



5. No Issues Found: If you find no issues within a specific diff block, respond with only this "LGTM" and nothing else.

6. Tone: Maintain a constructive and professional tone. Offer suggestions for improvement rather than just pointing out problems.

## Example 1

${selectedConfig.responseExample}

##Diffs to Review

Please review the above changes according to the guidelines provided.

${diffs}

`;
};
