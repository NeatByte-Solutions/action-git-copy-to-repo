import { stream as fgStream } from 'fast-glob';
import { promises as fs } from 'fs';
import { Context } from '../types';

const parseGlobs = (configStr: string, defaultGlobs: string[]) => {
  const globList = configStr
    .toString()
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s !== '');

  return [...globList, ...defaultGlobs];
};

type DeleteGlobs = {
  context: Context;
  globsToDelete: string;
  defaultGlobs: string[];
  repoFolder?: string;
  logDeleted?: boolean;
};

const deleteGlobs = async ({
  context,
  globsToDelete,
  defaultGlobs,
  repoFolder,
  logDeleted = false,
}: DeleteGlobs) => {
  const { log } = context;
  const globs = parseGlobs(globsToDelete, defaultGlobs);

  log.log(`##[info] Deleting globs ${globs} from "${repoFolder}"`);
  const filesToDelete = fgStream(globs, {
    absolute: true,
    dot: true,
    followSymbolicLinks: false,
    cwd: repoFolder,
  });

  // Delete all files from the filestream
  for await (const entry of filesToDelete) {
    await fs.unlink(entry);
    if (logDeleted) {
      log.log(`Deleted file: ${entry}`);
    }
  }
};

export const clear = async (context: Context) => {
  if (context.config?.diffCopyMode) {
    return;
  }

  // Delete source globs
  await deleteGlobs({
    context,
    globsToDelete: context.config?.src?.globsToDelete || '',
    defaultGlobs: ['.git/**'],
    repoFolder: context.temp?.srcTempRepo,
    logDeleted: true,
  });

  // Delete target globs
  await deleteGlobs({
    context,
    globsToDelete: context.config?.target?.globsToDelete || '',
    defaultGlobs: ['**/*', '!.git'],
    repoFolder: context.temp?.targetTempRepo,
  });
};
