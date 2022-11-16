import { EnvironmentVariables, Console, Context } from './types';

import { createContext } from './context';
// TODO: do not use default exports for steps
import { config } from './steps/config';
import { prepareTempFolders } from './steps/tempFolders';
import { setupSshKeys, killSshProcesses } from './steps/ssh';
import { checkout } from './steps/checkout';

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

  // Kill ssh processes if private keys were installed
  await killSshProcesses(context);
};
