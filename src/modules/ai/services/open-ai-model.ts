import * as fs from 'fs';
import { OpenAI } from 'openai';

import {
  ASSISTANT_MODEL,
  ASSISTANT_TEMPERATURE,
  ASSISTANT_TOP_P,
  extractIssues,
  reviewIssues,
} from '@/helpers';
import {
  contextAwarenessPrompt,
  defaultAssistantPrompt,
  diffsReviewPrompts,
  refineIssuesPrompt,
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
    const fileId = await this.uploadFile(repoFileName);
    const assistantId = await this.createAssistant();

    const thread = await this.openai.beta.threads.create();

    const responses: string[] = [];
    const mentionedIssues: string[] = [];

    this.openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: contextAwarenessPrompt,
      attachments: [{ file_id: fileId, tools: [{ type: 'file_search' }] }],
    });

    for (const config of Object.keys(reviewIssues)) {
      const typedConfig = config as keyof typeof reviewIssues;
      const currentPrompt = this.generateReviewPrompt(
        combinedDiffsAndFiles,
        mentionedIssues,
        typedConfig,
      );

      await this.openai.beta.threads.messages.create(thread.id, {
        role: 'user',
        content: currentPrompt,
        attachments: [{ file_id: fileId, tools: [{ type: 'file_search' }] }],
      });

      const responseText = await this.getResponseText(thread.id, assistantId);

      if (responseText) {
        const refinedIssues = await this.refineIssues({issues: extractIssues(responseText), combinedDiffsAndFiles, fileId, assistantId});
        if (refinedIssues.length > 0) {
          responses.push(...refinedIssues);
          mentionedIssues.push(...refinedIssues);
        }
      }
    }

    return responses.join('\n\n---\n\n');
  }

  private async uploadFile(repoFileName: string): Promise<string> {
    const file = await this.openai.files.create({
      file: fs.createReadStream(repoFileName),
      purpose: 'assistants',
    });

    return file.id;
  }

  async refineIssues({issues, combinedDiffsAndFiles, fileId, assistantId}: {issues: string[], combinedDiffsAndFiles: string, fileId: string, assistantId: string}): Promise<string[]> {
    const refinedIssues: string[] = [];

    for (const issue of issues) {
      const thread = await this.openai.beta.threads.create();
      await this.openai.beta.threads.messages.create(thread.id, {
        role: 'user',
        content: refineIssuesPrompt(issue, combinedDiffsAndFiles),
        attachments: [{ file_id: fileId, tools: [{ type: 'file_search' }] }],
      });

      const responseText = await this.getResponseText(thread.id, assistantId);

      if (responseText?.includes('actionable')) {
        refinedIssues.push(issue);  
      }
    }

    return refinedIssues;
  }


  private async createAssistant(): Promise<string> {
    const assistant = await this.openai.beta.assistants.create({
      name: 'PR Reviewer',
      instructions: defaultAssistantPrompt,
      model: ASSISTANT_MODEL,
      tools: [{ type: 'file_search' }],
      temperature: ASSISTANT_TEMPERATURE,
      top_p: ASSISTANT_TOP_P,
    });
    return assistant.id;
  }

  private async getResponseText(
    threadId: string,
    assistantId: string,
  ): Promise<string | null> {
    const run = await this.openai.beta.threads.runs.createAndPoll(threadId, {
      assistant_id: assistantId,
    });

    const messages = await this.openai.beta.threads.messages.list(threadId, {
      run_id: run.id,
    });

    const message = messages.data.pop();
    return message && message.content[0].type === 'text'
      ? message.content[0].text.value
      : null;
  }

  generateReviewPrompt(
    diffs: string,
    mentionedIssues: string[],
    issueType: keyof typeof reviewIssues,
  ): string {
    const mentionedIssuesText = mentionedIssues.length
      ? `\n\nThe following issues have already been addressed in previous review categories. DO NOT mention these again: \n${mentionedIssues
          .map((issue, index) => `${index + 1}. ${issue}`)
          .join('\n')}\n\n`
      : '';

    return diffsReviewPrompts(diffs, issueType, mentionedIssuesText);
  }
}
