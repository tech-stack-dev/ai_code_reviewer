import * as core from '@actions/core';
import { OpenAI } from 'openai';

export const openai = new OpenAI({
  apiKey: core.getInput('openai_api_key'),
});
