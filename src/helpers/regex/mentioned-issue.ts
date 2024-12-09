/**
 * Regex pattern to extract issues from response text.
 *
 * Matches comments formatted as:
 * ### Comment on lines 1-5:
 *
 * Captures:
 * 1. Start line number
 * 2. End line number
 * 3. Issue description
 *
 * Key components:
 * - `(?:###\s*)?`: Optional "###" prefix with whitespace.
 * - `Comment on lines (\d+)-(\d+)`: Matches the line range.
 * - `(?::)?`: Optional colon after the end line number.
 * - `\s*\n`: Whitespace followed by a newline, indicating the description follows.
 * - `([\s\S]+?)`: Captures the issue description (can include newlines).
 * - `(?=\n\s*###|$)`: Ensures the match ends before the next comment or the text's end.
 */
export const MENTIONED_ISSUE_REGEX =
  /(?:###\s*)?Comment on lines (\d+)-(\d+)(?::)?\s*\n([\s\S]+?)(?=\n\s*###|$)/g;
