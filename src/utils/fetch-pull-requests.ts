import axios from 'axios';
import { octokit } from 'core/octokit';

async function fetchPullRequestDiff(
  owner: string,
  repo: string,
  pullNumber: number,
): Promise<string> {
  try {
    const { data: pullRequest } = await octokit.pulls.get({
      owner,
      repo,
      pull_number: pullNumber,
    });

    const diffUrl = pullRequest.diff_url;
    const response = await axios.get(diffUrl, {
      headers: { Accept: 'application/vnd.github.v3.diff' },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching pull request diff:', error);
    throw error;
  }
}

export { fetchPullRequestDiff };
