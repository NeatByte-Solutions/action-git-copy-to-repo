import * as path from 'path';
import { homedir } from 'os';
import { promises as fs } from 'fs';
import { mkdirP } from '@actions/io';

import { Context } from '../types';
import { KNOWN_HOSTS_WARNING } from '../utils/errorMessages';

// Paths
const SSH_FOLDER = path.join(homedir(), '.ssh');
const KNOWN_HOSTS_TARGET = path.join(SSH_FOLDER, 'known_hosts');

const KNOWN_HOSTS_DEFAULT = path.join(path.dirname(__dirname), '../../resources/known_hosts');

// setup known hosts file for secure  git ssh access
// if none value was passed via env vars - use default with most popular Git hosting services (aka: Github, Gitlab, Bitbucket)
const setupKnownHosts = async (context: Context): Promise<void> => {
  const { log } = context;

  // TODO: add skip option for this step???

  let knownHostsFilepath = KNOWN_HOSTS_DEFAULT;

  if (context?.config?.knownHostsFile) {
    knownHostsFilepath = context.config.knownHostsFile;
  } else {
    log.warn(KNOWN_HOSTS_WARNING);
  }

  // create ~/.ssh folder
  await mkdirP(SSH_FOLDER);

  // copy known hosts file to ~/.ssh folder
  await fs.copyFile(knownHostsFilepath, KNOWN_HOSTS_TARGET);
};

export default setupKnownHosts;
