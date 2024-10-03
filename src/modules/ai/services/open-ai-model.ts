import * as fs from 'fs';
import { OpenAI } from 'openai';

import {
  contextAwarenessPrompt,
  defaultAssistantPrompt,
  diffsReviewPrompts,
} from '@/prompts';

import { currentVCS } from '../../vcs';
import { AIModel } from '../interfaces';
import { ASSISTANT_MODEL, ASSISTANT_TEMPERATURE, ASSISTANT_TOP_P, extractIssues, reviewIssues } from '@/helpers';
import { UploadedOpenAiFile } from '@/types';

export class OpenAIModel implements AIModel {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ apiKey: currentVCS.getInput('openai_api_key') });
  }

  async generateReview(
    combinedDiffsAndFiles: string,
    repoFileName: string,
  ): Promise<string> {
    const file = await this.uploadFile(repoFileName);
    
    const assistant = await this.openai.beta.assistants.create({
      name: 'PR Reviewer',
      instructions: defaultAssistantPrompt,
      model: ASSISTANT_MODEL,
      tools: [{ type: 'file_search' }],
      temperature: ASSISTANT_TEMPERATURE,
      top_p: ASSISTANT_TOP_P,
    });

    const thread = await this.openai.beta.threads.create();

    await this.sendContextAwarenessPrompt(thread.id, file.id);

    const responses: string[] = [];
    const mentionedIssues: string[] = [];

    for (const config of Object.keys(reviewIssues) as Array<keyof typeof reviewIssues>) {
      const reviewPrompt = this.generateReviewPrompt(combinedDiffsAndFiles, mentionedIssues, config);
      const responseText = await this.getAssistantResponse(thread.id, file.id, assistant.id, reviewPrompt);

      if (responseText) {
        responses.push(responseText);
        const newIssues = extractIssues(responseText);
        mentionedIssues.push(...newIssues);
      }
    }

    return responses.join('\n\n---\n\n');
  }

  private async uploadFile(fileName: string): Promise<UploadedOpenAiFile> {
    return this.openai.files.create({
      file: fs.createReadStream(fileName),
      purpose: 'assistants',
    });
  }

  private async sendContextAwarenessPrompt(threadId: string, fileId: string): Promise<void> {
    await this.openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: contextAwarenessPrompt,
      attachments: [{ file_id: fileId, tools: [{ type: 'file_search' }] }],
    });
  }

  private async getAssistantResponse(threadId: string, fileId: string, assistantId: string, prompt: string): Promise<string | null> {
    await this.openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: prompt,
      attachments: [{ file_id: fileId, tools: [{ type: 'file_search' }] }],
    });

    const run = await this.openai.beta.threads.runs.createAndPoll(threadId, {
      assistant_id: assistantId,
    });

    const messages = await this.openai.beta.threads.messages.list(threadId, {
      run_id: run.id,
    });

    const message = messages.data.pop();
    return message?.content[0].type === 'text' ? message.content[0].text.value : null;
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
