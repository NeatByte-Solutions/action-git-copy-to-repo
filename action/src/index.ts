import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import * as path from 'path';
import genConfig from './config';
import { Console } from './types';
import checkout from './checkout';

export interface EnvironmentVariables {
  SRC_REPO?: string;
  SRC_BRANCH?: string;
  SRC_SSH_PRIVATE_KEY?: string;
  SRC_GITHUB_TOKEN?: string;
  KNOWN_HOSTS_FILE?: string;
  TARGET_REPO?: string;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends EnvironmentVariables {}
  }
}

export const main = async ({
  env = process.env,
  log,
}: {
  env?: EnvironmentVariables;
  log: Console;
}) => {
  // create config
  const config = genConfig({
    repo: env.SRC_REPO || '',
    branch: env.SRC_BRANCH || '',
    githubToken: env.SRC_GITHUB_TOKEN,
    privateKey: env.SRC_SSH_PRIVATE_KEY,
    knownHostsFile: env.KNOWN_HOSTS_FILE,
  });

  // Calculate paths that use temp diractory
  const TMP_PATH = await fs.mkdtemp(
    path.join(tmpdir(), 'git-publish-subdir-action-')
  );
  const SRC_REPO_TEMP = path.join(TMP_PATH, 'repo/src');
  const SSH_AUTH_SOCK = path.join(TMP_PATH, 'ssh_agent.sock');

  // Environment to pass to children
  const childEnv = Object.assign({}, process.env, {
    SSH_AUTH_SOCK,
  });

  await checkout(config, SRC_REPO_TEMP, childEnv, log);
};
