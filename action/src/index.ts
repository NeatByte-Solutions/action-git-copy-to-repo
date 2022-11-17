import { EnvironmentVariables, Console, Context } from './types';

import { createContext } from './context';
import { config } from './steps/config';
import { prepareTempFolders } from './steps/tempFolders';
import { setupSshKeys, killSshProcesses } from './steps/ssh';
import { checkout } from './steps/checkout';
import { clear } from './steps/clear';
import { copy } from './steps/copy';

export const main = async (env: EnvironmentVariables = process.env, log: Console) => {
  const context: Context = await createContext(log);

  // process and validate config
  await config(env, context);

  // calculate paths that use temp directories
  await prepareTempFolders(context);

  // if needed setup ssh keys for git access
  await setupSshKeys(context);

  // Clone branches
  await checkout(context);

  // Delete globs from source and target
  await clear(context);

  // Copy files from source to target
  await copy(context);

  // Kill ssh processes if private keys were installed
  await killSshProcesses(context);
};
