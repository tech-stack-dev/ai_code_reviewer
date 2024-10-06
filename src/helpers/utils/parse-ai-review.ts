import { ParsedAIReview } from '@/types';

export const parseAIReview = (aiReview: string): ParsedAIReview[] => {
  const reviews: ParsedAIReview[] = [];

  const reviewBlocks = aiReview.split('---');

  for (const block of reviewBlocks) {
    const fileMatch = block.match(/File: (.+)/);
    const startLineMatch = block.match(/Start line: (\d+)/);
    const endLineMatch = block.match(/End line: (\d+)/);
    const commentMatch = block.match(/Comment: ([\s\S]+)/);

    if (fileMatch && startLineMatch && endLineMatch && commentMatch) {
      const sanitizedFile = fileMatch[1]
        .replace(/^[\s'"\\[\]]+|[\s'"\\[\]]+$/g, '')
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
