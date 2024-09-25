import { openai } from './core';

async function analyzeDiffWithAI(diff: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a code reviewer. Analyze the following diff and provide a concise review.',
        },
        { role: 'user', content: diff },
      ],
    });

    return response.choices[0].message.content || 'No analysis generated';
  } catch (error) {
    console.error('Error analyzing diff with AI:', error);
    throw error;
  }
}

export { analyzeDiffWithAI };
