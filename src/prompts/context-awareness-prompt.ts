export const contextAwarenessPrompt = `I've attached a file containing the complete codebase of the repository for you to review. 
This file should serve as a crucial reference for all subsequent code reviews. You need to analyze the codebase thoroughly, focusing on:

1. Overall structure, architecture, and design patterns
2. Coding conventions and standards used throughout
3. Dependencies and their versions
4. Comments and documentation, if any, within the code

You shouldn't reply to this response it is just introduction for you.

In **all future tasks**, ensure that you reference this codebase in **every** review. Consider how new changes interact with the existing system and adhere to the established coding and architectural standards. Your analysis of this repository will be central to providing consistent, accurate, and context-aware code reviews moving forward.`;
