import { EnvironmentVariables, Console, Context } from './types';

import { createContext } from './context';
import config from './config';
import prepareTempFolders from './tempFoldersAndFiles';
import { setupSshKeys, killSshProcesses} from './steps/ssh';
// import { checkoutSrc, checkoutTarget } from './checkout';

export const main = async (
  env: EnvironmentVariables = process.env,
  log: Console,
) => {
  const context: Context = await createContext(log);

  // process and validate config
  await config(env, context);

  // calculate paths that use temp directories
  await prepareTempFolders(context);

  // if needed setup ssh keys for git access
  await setupSshKeys(context);

  // Clone branches
  // await checkoutSrc(context);
  // await checkoutTarget(context);

  // Kill ssh processes if private keys were installed
  await killSshProcesses(context);
};
