# AI Code Reviewer

This project integrates an AI-powered code review process into your GitHub workflow. It leverages the capabilities of OpenAI to provide insights and suggestions during pull requests.

## Prerequisites

Before you start, ensure you have the following:

- A GitHub repository where you want to set up the AI Code Reviewer.
- Access to the OpenAI API and a valid API key.

## Setup Instructions

Follow these steps to set up the AI Code Reviewer in your GitHub repository:

### 1. Create the Workflow File

Add a file called `ai-code-reviewer.yml` to the `.github/workflows` folder in your repository. Use the following configuration:

```yaml
name: Use AI Code Reviewer

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest

    steps:
      - name: Check out the code
        uses: actions/checkout@v2

      - name: Run AI Code Reviewer
        uses: tech-stack-dev/ai_code_reviewer@tag-integration
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          openai_api_key: ${{ secrets.OPENAI_API_KEY }}
          auto_trigger: 'true'
```

### 2. Configure GitHub Secrets

You need to add your OpenAI API key to your GitHub repository secrets. Follow these steps:

1. Go to your GitHub repository.
2. Click on Settings.
3. Navigate to Secrets and variables > Actions.
4. Click on New repository secret.
5. Add a secret with the name OPENAI_API_KEY and paste your OpenAI API key.

### 3. Run the Workflow

Once you've configured the workflow and added your API key, the AI Code Reviewer will automatically trigger when a pull request is opened or synchronized, thanks to the auto_trigger: 'true' setting.

### Usage

After setting up the workflow, whenever a pull request is created or updated, the AI Code Reviewer will analyze the code and provide feedback directly in the pull request comments.
