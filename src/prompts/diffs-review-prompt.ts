import { reviewConfig } from "../config/review-config";

export const diffsReviewPrompts = (diffs: string, issueType: keyof typeof reviewConfig): string => {
    const selectedConfig = reviewConfig[issueType];

    const formattedPoints = selectedConfig.points
      .map((point, index) => (index % 2 === 0 ? `- **${point}:**` : point))
      .join('\n');
    
    return `
## Context 
You are reviewing code changes in the context of our existing codebase and project guidelines. 
Aim for a constructive and collaborative tone in your feedback.
Provide concise answers without additional explanations or apologies.
Give me the information directly without any introductory sentences.
Exclude any extra wording and just provide the essential answer.

## Task Description 

Review the provided code changes (diffs) and identify significant problems or areas for improvement. Provide specific, actionable feedback in the form of review comments. 
You will review the code changes provided (in diff format) and leave specific, actionable comments where necessary. The focus areas include:

Important: Consider the impact of these changes on the entire system. Use the repository context provided to you for a more comprehensive review. If you identify issues that affect the broader system or conflict with existing code, highlight these concerns and suggest appropriate fixes.

## 1. Prioritization Category: ${selectedConfig.title}

${formattedPoints}

## 2. Avoiding False Positives:
Avoid leaving unnecessary comments on code that adheres to the project’s standards, even if it's not your personal preference.
Be specific in identifying real issues or improvements, and skip comments that are too vague or speculative.
Consider code intent: Understand the intent behind the code; sometimes unconventional approaches are justified by specific requirements or constraints.

## Input Format 

You will receive: 

1. Code changes (diffs) with line numbers, indicating specific lines modified or added. 
2. Original code that was replaced, if applicable. 

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
Reference specific line numbers within the newly added or modified code.
Focus on a single issue or suggestion.
Include code examples or corrections where appropriate.

## Output Format

### Comment on lines X-Y 
Description of the issue or suggestion. 
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
   - The start and end line numbers for each comment should be within the same code fragment.
   - For single-line comments, use identical start and end line numbers.

5. No Issues Found: If you find no issues within a specific diff block, respond with "LGTM (Looks Good To Me) for lines X-Y".

6. Tone: Maintain a constructive and professional tone. Offer suggestions for improvement rather than just pointing out problems.

## Example

### Example changes
#### File: \`my_module.py\`

Full file content:
\`\`\`python
1: import os
2: def calculate_average(numbers):
3:     if count == 0:
4:      		return 0
5:     avarage = sum(numbers) / len(numbers)
6:     return round(avarage, 2)
7: def process_data(data):
8:    processed = [x * 2 for x in data]
9:    return processed

\`\`\`diff
@@ -5,7 +5,7 @@
+   total = sum(numbers)
+   count = len(numbers)
     if count == 0:
         return 0
-    avarage =  sum(numbers) / len(numbers)
+    avarage = total / count
     return round(avarage, 2)
\`\`\`

---comment_chains—
\`\`\`
Please review this change.
\`\`\`

---end_change_section—
### Example response
5-5: 
There's a typo in the variable name.
\`\`\`diff
- avarage = total / count
+ average = total / count
\`\`\`



##Diffs to Review

Please review the above changes according to the guidelines provided.

${diffs}

`
};