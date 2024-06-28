import { exec } from '../utils/processUtils';
import { Context } from '../types';
import fs from 'fs';
import path from 'path';

const getChangedFiles = async (context: Context): Promise<string[]> => {
  const { log } = context;

  log.log(`##[info] Getting list of changed files: git diff master...`);
  const { stdout } = await exec(`git diff --name-only master...`, context.exec.srcExecOpt);

  const changedFiles = stdout.trim().split('\n').filter(Boolean);
  log.log(`##[info] Changed files:\n${changedFiles.join('\n')}`);

  return changedFiles;
};

const copyFiles = (srcDir: string, targetDir: string, files: string[]) => {
  files.forEach((file) => {
    const srcFilePath = path.join(srcDir, file);
    const targetFilePath = path.join(targetDir, file);
    const targetFileDir = path.dirname(targetFilePath);

    if (!fs.existsSync(targetFileDir)) {
      fs.mkdirSync(targetFileDir, { recursive: true });
    }

    fs.copyFileSync(srcFilePath, targetFilePath);
  });
};

export const copy = async (context: Context) => {
  const { log } = context;
  const { srcTempRepo, targetTempRepo } = context.temp;
  const mode = context.config?.copyMode;

  if (!srcTempRepo || !targetTempRepo) {
    return;
  }

  if (mode === 'diff') {
    log.log(`##[info] Copying only changed files`);
    const changedFiles = await getChangedFiles(context);
    copyFiles(srcTempRepo, targetTempRepo, changedFiles);
  } else {
    log.log(`##[info] Copying all files: cp -rT "${srcTempRepo}"/ ${targetTempRepo}`);
    await exec(`cp -rT "${srcTempRepo}"/ ${targetTempRepo}`, context.exec?.targetExecOpt);
  }
};
