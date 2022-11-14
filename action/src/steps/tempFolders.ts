import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import * as path from 'path';
import { Context } from '../types';

export const prepareTempFolders = async (context: Context) => {
  const tempPath = await fs.mkdtemp(path.join(tmpdir(), 'action-git-copy-to-repo-'));

  await fs.mkdir(path.join(tempPath, 'src'));
  await fs.mkdir(path.join(tempPath, 'target'));

  context.temp = {
    srcTempFolder: path.join(tempPath, 'src'),
    targetTempFolder: path.join(tempPath, 'target'),

    srcTempRepo: path.join(tempPath, 'src/repo'),
    targetTempRepo: path.join(tempPath, 'target/repo'),
  };
};
