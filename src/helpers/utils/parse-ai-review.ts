import { ParsedAIReview } from '@/types';
import { FILE_REGEX, START_LINE_REGEX, END_LINE_REGEX, COMMENT_REGEX, TRIM_UNWANTED_CHARS_REGEX } from '../regex';

export const parseAIReview = (aiReview: string): ParsedAIReview[] => {
  const reviews: ParsedAIReview[] = [];

  const reviewBlocks = aiReview.split('---');

  for (const block of reviewBlocks) {
    const fileMatch = block.match(FILE_REGEX);
    const startLineMatch = block.match(START_LINE_REGEX);
    const endLineMatch = block.match(END_LINE_REGEX);
    const commentMatch = block.match(COMMENT_REGEX);

    if (fileMatch && startLineMatch && endLineMatch && commentMatch) {
      const sanitizedFile = fileMatch[1]
        .replace(TRIM_UNWANTED_CHARS_REGEX, '')
        .trim();

      reviews.push({
        file: sanitizedFile,
        startLine: parseInt(startLineMatch[1], 10),
        endLine: parseInt(endLineMatch[1], 10),
        comment: commentMatch[1].trim(),
      });
    }
  }

  return reviews;
};
