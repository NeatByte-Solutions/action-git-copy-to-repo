import { exec } from '../utils/processUtils';
import { Context } from '../types';

export const copy = async (context: Context) => {
  const { log } = context;
  const { srcTempRepo, targetTempRepo } = context.temp;

  log.log(`##[info] Copying files: cp -rT "${srcTempRepo}"/ ${targetTempRepo}`);
  await exec(`cp -rT "${srcTempRepo}"/ ${targetTempRepo}`, context.exec?.targetExecOpt);
};
