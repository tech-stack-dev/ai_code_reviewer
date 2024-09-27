import * as fs from 'fs';
import { OpenAI } from 'openai';

import { reviewConfig } from '@/config/review-config';
import {
  contextAwarenessPrompt,
  defaultAssistantPrompt,
  diffsReviewPrompts,
} from '@/prompts';

import { currentVCS } from '../../vcs';
import { AIModel } from '../interfaces';

export class OpenAIModel implements AIModel {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ apiKey: currentVCS.getInput('openai_api_key') });
  }

  async generateReview(
    combinedDiffsAndFiles: string,
    repoFileName: string,
  ): Promise<string> {
    const file = await this.openai.files.create({
      file: fs.createReadStream(repoFileName),
      purpose: 'assistants',
    });

    console.log('Creating an assistant...');
    const assistant = await this.openai.beta.assistants.create({
      name: 'PR Reviewer',
      instructions: defaultAssistantPrompt,
      model: 'gpt-4o-mini',
      tools: [{ type: 'file_search' }],
      temperature: 0.5,
      top_p: 0.6,
    });

    console.log('Creating a thread...');
    const thread = await this.openai.beta.threads.create();

    const responses: string[] = [];
    const mentionedIssues: string[] = [];

    await this.openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: contextAwarenessPrompt,
      attachments: [{ file_id: file.id, tools: [{ type: 'file_search' }] }],
    });

    const run = await this.openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: assistant.id,
    });

    console.log('Retrieving response from the assistant...');
    const messages = await this.openai.beta.threads.messages.list(thread.id, {
      run_id: run.id,
    });

    const message = messages.data.pop();
    if (message && message.content[0].type === 'text') {
      // const responseText = message.content[0].text.value;
      // responses.push(responseText);
    }

    for (const config of Object.keys(reviewConfig)) {
      const typedConfig = config as keyof typeof reviewConfig;
      let currentPrompt = this.generateReviewPrompt(
        combinedDiffsAndFiles,
        mentionedIssues,
        typedConfig,
      );

      console.log(`Reviewing for ${reviewConfig[typedConfig].title}`);
      await this.openai.beta.threads.messages.create(thread.id, {
        role: 'user',
        content: currentPrompt,
        attachments: [{ file_id: file.id, tools: [{ type: 'file_search' }] }],
      });

      console.log('Waiting for assistant to complete response...');
      const run = await this.openai.beta.threads.runs.createAndPoll(thread.id, {
        assistant_id: assistant.id,
      });

      console.log('Retrieving response from the assistant...');
      const messages = await this.openai.beta.threads.messages.list(thread.id, {
        run_id: run.id,
      });

      const message = messages.data.pop();
      if (message && message.content[0].type === 'text') {
        const responseText = message.content[0].text.value;
        responses.push(responseText);

        const newIssues = this.extractIssues(responseText);
        mentionedIssues.push(...newIssues);

        console.log(mentionedIssues);

        currentPrompt = this.generateReviewPrompt(
          combinedDiffsAndFiles,
          mentionedIssues,
          typedConfig,
        );
      }
    }

    return responses.join('\n\n---\n\n');
  }

  extractIssues(responseText: string): string[] {
    const issues: string[] = [];

    const issueRegex = /(?:###\s*)?Comment on lines (\d+)-(\d+)\s*\n([\s\S]+?)(?=\n\s*###|$)/g;

    let match;
    while ((match = issueRegex.exec(responseText)) !== null) {
      const startLine = match[1];
      const endLine = match[2];
      const issueDescription = match[3].trim();

      const formattedIssue = `Lines ${startLine}-${endLine}: ${issueDescription}`;
      issues.push(formattedIssue);
    }

    return issues;
  }

  generateReviewPrompt(
    diffs: string,
    mentionedIssues: string[],
    issueType: keyof typeof reviewConfig,
  ): string {
    const mentionedIssuesText = mentionedIssues.length
      ? `\n\nThe following issues have already been addressed in previous review categories. DO NOT mention these again: \n${mentionedIssues
          .map((issue, index) => `${index + 1}. ${issue}`)
          .join('\n')}\n\n`
      : '';

    return diffsReviewPrompts(diffs, issueType, mentionedIssuesText);
  }
}
