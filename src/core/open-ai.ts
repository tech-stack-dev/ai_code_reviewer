import * as core from '@actions/core';
import { config } from 'dotenv';
import { OpenAI } from 'openai';

config();

export const openai = new OpenAI({
  apiKey: core.getInput('openai_api_key'),
});
