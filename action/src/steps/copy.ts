import { exec } from '../utils/processUtils';
import { Context } from '../types';
import fs from 'fs';
import path from 'path';

const getExcludePatterns = (globsToDelete: string): string[] => {
  return globsToDelete.split('\n').map((glob) => `':!${glob.trim()}'`);
};

const getChangedFiles = async (
  context: Context
): Promise<{ addedOrModified: string[]; deleted: string[] }> => {
  const { log } = context;
  const excludePatterns = getExcludePatterns(context.config?.src?.globsToDelete || '');

  log.log(
    `##[info] Getting list of changed files: git diff master... -- ${excludePatterns.join(' ')}`
  );
  const { stdout } = await exec(
    `git diff --name-status master... -- ${excludePatterns.join(' ')}`,
    context.exec.srcExecOpt
  );

  const changes = stdout.trim().split('\n').filter(Boolean);
  const addedOrModified: string[] = [];
  const deleted: string[] = [];

  changes.forEach((line) => {
    const [status, file] = line.split('\t');
    if (status === 'D') {
      deleted.push(file);
    } else {
      addedOrModified.push(file);
    }
  });

  return { addedOrModified, deleted };
};

const copyFiles = (srcDir: string, targetDir: string, files: string[], toDelete: string[]) => {
  // Copy added or modified files
  files.forEach((file) => {
    const srcFilePath = path.join(srcDir, file);
    const targetFilePath = path.join(targetDir, file);

    const targetFileDir = path.dirname(targetFilePath);
    if (!fs.existsSync(targetFileDir)) {
      fs.mkdirSync(targetFileDir, { recursive: true });
    }

    fs.copyFileSync(srcFilePath, targetFilePath);
  });

  // Delete files that no longer exist in source
  toDelete.forEach((file) => {
    const targetFilePath = path.join(targetDir, file);
    if (fs.existsSync(targetFilePath)) {
      fs.unlinkSync(targetFilePath);
    }
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
    const { addedOrModified, deleted } = await getChangedFiles(context);
    copyFiles(srcTempRepo, targetTempRepo, addedOrModified, deleted);
  } else {
    log.log(`##[info] Copying all files: cp -rT "${srcTempRepo}"/ ${targetTempRepo}`);
    await exec(`cp -rT "${srcTempRepo}"/ ${targetTempRepo}`, context.exec?.targetExecOpt);
  }
};
