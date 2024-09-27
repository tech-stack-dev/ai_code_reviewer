import { config } from '@/config';

import { VCSOptions } from './constants';
import { VCS } from './interfaces';
import { GitHubVCS } from './services';

const VCSServices = Object.freeze({
  [VCSOptions.GITHUB]: new GitHubVCS(),
});

export const currentVCS: VCS =
  VCSServices[config.vcs as keyof typeof VCSServices];
