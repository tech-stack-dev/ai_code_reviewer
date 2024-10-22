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
Avoid leaving unnecessary comments on code that adheres to the project's standards, even if it's not your personal preference.
Be specific in identifying real issues or improvements, and skip comments that are too vague or speculative.
Do not raise concerns unless they clearly violate standards of the repository, considering the repository context at all times.

## Input Format 

You will receive: 

1. Code changes (diffs) with line numbers, indicating specific lines modified or added. Each continuous block of changes is called a "hunk".
2. Original code that was replaced, if applicable. 
3. Full file content for more context (only use this for understanding the context, not for line numbers).

Example: 
### Example changes
### File: \`my_module.py\`

### Diff (Start line and End line of a review comment must be taken from here, **include only hunk numbers in comments**):
\`\`\`diff
@@ -1,5 +1,5 @@ 
+ 	new_variable = 5 
+ 	result = new_variable * 2 
- 	result = 0 
  return result
@@ -10,15 +10,15 @@
  # Another hunk starts here
  def another_function():
      pass
\`\`\`

### Full file content (Should be used only for context):
\`\`\`python
1: import os
2: def existing_function():
3:     new_variable = 5
4:     result = new_variable * 2
5:     return result
\`\`\`

## Expected Output
### Each review comment should:
1. Use line numbers from the diff hunks only **(must be >= 1, never 0)**
2. Focus on a single, specific issue
3. Include a minimal code example showing the fix
4. Be constructive and actionable
5. Stay within the prioritization category scope
6. Avoid redundant or duplicate comments
7. Point out issues, not describe changes
8. Consider system-wide impacts when relevant
9. No explanations, apologies, or extra words - just the essential feedback.

Example of diff hunks:
\`\`\`diff
@@ -1,5 +1,5 @@    <- Hunk 1 starts
  line1
  line2              <- These lines are part of Hunk 1 
  line3              
@@ -10,15 +10,15 @@  <- Hunk 2 starts
  line10
  line11             <- These lines are part of Hunk 2
  line12
\`\`\`

**IMPORTANT: Line Number Rules**
1. Start line and End line MUST come from the diff content within a single hunk
2. Line numbers must be greater than or equal to 1 (never use line 0)
3. Always specify which hunk number (N) the comment refers to
4. Never reference lines across different hunks - each comment should address issues within a single hunk only
5. If an issue spans multiple hunks, create separate comments for each hunk
6. Any comment with line number 0 will be rejected by the system

## Output Format

Example: If the first changed line in a hunk is line 1, use 1 as the start line. NEVER use line 0.

### Comment on lines X-Y 
File: path to file goes here
Start line: X (from hunk, **must be  >= 1**, must be inside of the same hunk as End line)
End line: Y (from hunk, **must be >= 1**, must be inside of the same hunk as Start line)
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

4. No Issues Found: If you find no issues within a specific diff block, respond with only this "LGTM" and nothing else.

5. Tone: Maintain a constructive and professional tone. Offer suggestions for improvement rather than just pointing out problems.

## Example

${selectedConfig.responseExample}

##Diffs to Review

Please review the above changes according to the guidelines provided.

${diffs}

`;
};
