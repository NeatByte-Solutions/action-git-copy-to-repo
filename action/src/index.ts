import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import * as path from 'path';
import genConfig from './config';
import { Console } from './types';
import checkout from './checkout';
import { EnvironmentVariables } from './types';

export const main = async ({
  env = process.env,
  log,
}: {
  env?: EnvironmentVariables;
  log: Console;
}) => {
  // create config
  const config = genConfig(env);

  // Calculate paths that use temp diractory
  const TMP_PATH = await fs.mkdtemp(
    path.join(tmpdir(), 'git-publish-subdir-action-')
  );
  const SRC_REPO_TEMP = path.join(TMP_PATH, 'repo/src');
  const TARGET_REPO_TEMP = path.join(TMP_PATH, 'repo/target');
  const SSH_AUTH_SOCK = path.join(TMP_PATH, 'ssh_agent.sock');

  // Environment to pass to children
  const childEnv = Object.assign({}, process.env, {
    SSH_AUTH_SOCK,
  });

  await checkout({
    config: config.src,
    tmpFolder: SRC_REPO_TEMP,
    knownHostsFile: config.knownHostsFile,
    childEnv,
    log,
  });
  await checkout({
    config: config.target,
    tmpFolder: TARGET_REPO_TEMP,
    knownHostsFile: config.knownHostsFile,
    childEnv,
    log,
  });
};
