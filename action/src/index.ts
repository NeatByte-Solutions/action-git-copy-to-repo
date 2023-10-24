import { EnvironmentVariables, Console, Context } from './types';

import { createContext } from './context';
import { config } from './steps/config';
import { prepareTempFolders } from './steps/tempFolders';
import { setupKnownHosts } from './steps/knownHosts';
import { setupSshKeys, killSshProcesses } from './steps/ssh';
import { checkout } from './steps/checkout';
import { clear } from './steps/clear';
import { copy } from './steps/copy';
import { commit, revertCommit } from './steps/commit';

export const main = async (env: EnvironmentVariables = process.env, log: Console) => {
  const context: Context = await createContext(log);

  // Process and validate config
  await config(env, context);

  // Calculate paths that use temp directories
  await prepareTempFolders(context);

  // Copy known hosts file that has most popular public Git repo domains
  await setupKnownHosts(context);

  // If needed setup ssh keys for git access
  await setupSshKeys(context);

  // Clone branches
  await checkout(context);

  // Delete globs from source and target
  await clear(context);

  // Copy files from source to target
  await copy(context);

  // Commit and push target
  await commit(context);

  // Kill ssh processes if private keys were installed
  await killSshProcesses(context);
};

export const targetRepoRevert = async (env: EnvironmentVariables = process.env, log: Console) => {
  const context: Context = await createContext(log);

  // Process and validate config
  await config(env, context);

  // Calculate paths that use temp directories
  await prepareTempFolders(context);

  // Copy known hosts file that has most popular public Git repo domains
  await setupKnownHosts(context);

  // If needed setup ssh keys for git access
  await setupSshKeys(context);

  // Clone target branch
  await checkout(context, true);

  // Revert last commit and force push
  await revertCommit(context);

  // Kill ssh processes if private keys were installed
  await killSshProcesses(context);
};
