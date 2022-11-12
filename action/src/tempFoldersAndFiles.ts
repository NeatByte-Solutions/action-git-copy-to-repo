import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import * as path from 'path';
import { Context } from './types';

export default async (context: Context) => {
  const tempPath = await fs.mkdtemp(path.join(tmpdir(), 'action-git-copy-to-repo-'));

  context.temp = {
    srcTempFolder: path.join(tempPath, 'src'),
    targetTempFolder: path.join(tempPath, 'target'),

    srcTempRepo: path.join(tempPath, 'src/repo'),
    targetTempRepo: path.join(tempPath, 'target/repo'),
  };
};
