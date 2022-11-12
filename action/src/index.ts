import config from './config';
import prepareTempFolders from './prepareTempFolders';
// import { checkoutSrc, checkoutTarget } from './checkout';
import { EnvironmentVariables, Console, Context } from './types';

export const main = async ({
  env = process.env,
  log,
}: {
  env?: EnvironmentVariables;
  log: Console;
}) => {
  const context: Context = { log };

  // process and validate config
  config(env, context);

  // Calculate paths that use temp diractory
  await prepareTempFolders(context);

  // Clone branches
  // await checkoutSrc(context);
  // await checkoutTarget(context);
  console.log(context);
};
