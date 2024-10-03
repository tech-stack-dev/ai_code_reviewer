/**
 * Regex pattern to extract issues from response text.
 *
 * Matches comments in the format:
 * ### Comment on lines 1-5
 *
 * Captures:
 * 1. Start line number
 * 2. End line number
 * 3. Issue description
 *
 * The pattern searches for lines that begin with "Comment on lines",
 * followed by a range and the description on the next line.
 */
export const MENTIONED_ISSUE_REGEX =
  /(?:###\s*)?Comment on lines (\d+)-(\d+)\s*\n([\s\S]+?)(?=\n\s*###|$)/g;
