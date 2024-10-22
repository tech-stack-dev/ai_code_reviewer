/**
 * Regex pattern to match and extract the file name from a review block.
 *
 * Matches the line formatted as:
 * File: <file-name>
 *
 * Captures:
 * 1. File name
 *
 * Key components:
 * - `File: (.+)`: Matches the string "File: " followed by one or more characters (.+).
 */
export const FILE_REGEX = /File: (.+)/;

/**
 * Regex pattern to match and extract the start line from a review block.
 *
 * Matches the line formatted as:
 * Start line: <line-number>
 *
 * Captures:
 * 1. Start line number
 *
 * Key components:
 * - `Start line: (\d+)`: Matches the string "Start line: " followed by one or more digits (\d+).
 */
export const START_LINE_REGEX = /Start line: (\d+)/;

/**
 * Regex pattern to match and extract the end line from a review block.
 *
 * Matches the line formatted as:
 * End line: <line-number>
 *
 * Captures:
 * 1. End line number
 *
 * Key components:
 * - `End line: (\d+)`: Matches the string "End line: " followed by one or more digits (\d+).
 */
export const END_LINE_REGEX = /End line: (\d+)/;

/**
 * Regex pattern to match and extract the comment text from a review block.
 *
 * Matches the line formatted as:
 * Comment: <comment-text>
 *
 * Captures:
 * 1. The full comment text.
 *
 * Key components:
 * - `Comment: ([\s\S]+)`: Matches the string "Comment: " followed by any characters, including newlines ([\s\S]+).
 */
export const COMMENT_REGEX = /Comment: ([\s\S]+)/;

/**
 * Regex pattern to trim unwanted characters from the start and end of a string.
 *
 * Removes any leading or trailing:
 * - Whitespace characters
 * - Single quotes ('), double quotes ("), backslashes (\\)
 * - Square brackets ([]).
 *
 * Key components:
 * - `^[\s'"\\[\]]+`: Matches one or more unwanted characters at the beginning of the string.
 * - `|`: Separates the two parts of the regex (beginning and end).
 * - `[\s'"\\[\]]+$`: Matches one or more unwanted characters at the end of the string.
 * - `/g`: Global flag ensures the pattern applies to the entire string.
 */
export const TRIM_UNWANTED_CHARS_REGEX = /^[\s'"\\[\]]+|[\s'"\\[\]]+$/g;
