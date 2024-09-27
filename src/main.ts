import * as core from '@actions/core';
import * as github from '@actions/github';
import { WebhookPayload } from '@actions/github/lib/interfaces';
import { Octokit } from '@octokit/rest';
import * as fs from 'fs';
import { OpenAI } from 'openai';

import { reviewConfig } from './config/review-config';
import { defaultAssistantPrompt, diffsReviewPrompts } from './prompts';

const githubToken = core.getInput('github_token');
const openaiApiKey = core.getInput('openai_api_key');
const autoTrigger = core.getInput('auto_trigger').toLowerCase() === 'true';
const octokit = new Octokit({ auth: githubToken });
const openai = new OpenAI({ apiKey: openaiApiKey });

async function run(): Promise<void> {
  try {
    console.log('Starting AI review process');
    console.log(`Auto-trigger is set to: ${autoTrigger}`);

    const context = github.context;
    const payload = context.payload;

    if (context.eventName === 'pull_request' && autoTrigger) {
      if (payload.pull_request) {
        console.log(`Processing pull request #${payload.pull_request.number}`);
        await reviewPullRequest(payload.pull_request);
      } else {
        console.log('Pull request data is missing in the payload');
      }
    } else {
      console.log('Event does not meet criteria for review');
    }
  } catch (error) {
    console.error('Error in run function:', error);
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed('An unexpected error occurred');
    }
  }
}

async function reviewPullRequest(
  pullRequest: WebhookPayload['pull_request'],
): Promise<void> {
  if (pullRequest) {
    const { number } = pullRequest;
    const owner = pullRequest.base.repo.owner.login;
    const repo = pullRequest.base.repo.name;

    console.log(`Reviewing PR #${number} in ${owner}/${repo}`);

    try {
      console.log('Fetching diff...');
      const diffResponse = await octokit.request(
        `GET /repos/{owner}/{repo}/pulls/{pull_number}`,
        {
          owner,
          repo,
          pull_number: number,
          mediaType: {
            format: 'diff',
          },
        },
      );
      const diffString = diffResponse.data as unknown as string;

      console.log('Bundling repository content...');
      await bundleRepositoryToTxt(owner, repo);

      console.log('Uploading repository content to OpenAI...');
      const file = await openai.files.create({
        file: fs.createReadStream('repository.txt'),
        purpose: 'assistants',
      });

      console.log('Creating an assistant...');
      const assistant = await openai.beta.assistants.create({
        name: 'PR Reviewer',
        instructions: defaultAssistantPrompt,
        model: 'gpt-4o-mini',
        tools: [{ type: 'file_search' }],
      });

      console.log('Creating a thread...');
      const thread = await openai.beta.threads.create();

      const responses: string[] = [];

      for (const config of Object.keys(reviewConfig)) {
        const typedConfig = config as keyof typeof reviewConfig;

        console.log(`Adding message for config: ${typedConfig}`);
        await openai.beta.threads.messages.create(thread.id, {
          role: 'user',
          content: diffsReviewPrompts(diffString, typedConfig),
          attachments: [{ file_id: file.id, tools: [{ type: 'file_search' }] }],
        });

        console.log('Waiting for assistant to complete response...');
        const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
          assistant_id: assistant.id,
        });

        console.log('Retrieving response from the assistant...');
        const messages = await openai.beta.threads.messages.list(thread.id, {
          run_id: run.id,
        });

        const message = messages.data.pop();
        if (message && message.content[0].type === 'text') {
          responses.push(message.content[0].text.value);
        }
      }

      const combinedResponse = responses.join('\n\n---\n\n');

      console.log('Posting combined review comment...');
      await octokit.issues.createComment({
        owner,
        repo,
        issue_number: number,
        body: `AI Review:\n\n${combinedResponse}`,
      });

      console.log('AI review posted successfully');

      await openai.files.del(file.id);
      await openai.beta.assistants.del(assistant.id);
    } catch (error) {
      console.error('Error in reviewPullRequest:', error);
      if (error instanceof Error) {
        console.error(`Error message: ${error.message}`);
        console.error(`Error stack: ${error.stack}`);
      }
      throw error;
    }
  } else {
    console.log('Pull request object is undefined');
  }
}

async function bundleRepositoryToTxt(
  owner: string,
  repo: string,
): Promise<string> {
  const txtFilePath = 'repository.txt';
  const txtStream = fs.createWriteStream(txtFilePath);

  console.log('Fetching repository content using Octokit...');

  await fetchDirectoryContent(owner, repo, '', txtStream);

  txtStream.end();
  console.log('Repository content written to repository.txt');

  return txtFilePath;
}

async function fetchDirectoryContent(
  owner: string,
  repo: string,
  path: string,
  txtStream: fs.WriteStream,
): Promise<void> {
  try {
    const response = await octokit.repos.getContent({
      owner,
      repo,
      path,
    });

    if (Array.isArray(response.data)) {
      for (const item of response.data) {
        if (item.type === 'dir') {
          await fetchDirectoryContent(owner, repo, item.path, txtStream);
        } else if (item.type === 'file') {
          const fileContentResponse = await octokit.repos.getContent({
            owner,
            repo,
            path: item.path,
            mediaType: {
              format: 'raw',
            },
          });

          txtStream.write(
            `\n\nFile: ${item.path}\n\n${fileContentResponse.data}\n`,
          );
        }
      }
    }
  } catch (error) {
    console.error(`Error fetching directory content for path: ${path}`, error);
    throw error;
  }
}

run()
  .then(() => console.log('GitHub Action completed'))
  .catch((error) => console.error('Unhandled error in GitHub Action:', error));
