import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import * as path from 'path';
import { Context } from './types';

const prepareTempFolders = async (context: Context) => {
  const tempPath = await fs.mkdtemp(path.join(tmpdir(), 'git-publish-subdir-action-'));

  context.srcTempFolder = path.join(tempPath, 'repo/src');
  context.targetTempFolder = path.join(tempPath, 'repo/target');
};

export default prepareTempFolders;
