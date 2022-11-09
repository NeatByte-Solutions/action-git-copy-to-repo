import * as path from 'path';
import { homedir } from 'os';
import { promises as fs } from 'fs';
import { mkdirP } from '@actions/io';
import exec from './utils/exec';
import writeToProcess from './utils/writeToProcess';
import { githubRepoData, sshRepoData } from './config';
import { Console } from './types';
import { KNOWN_HOSTS_WARNING, SSH_KEY_ERROR } from './error-messages';

// Paths
const SSH_FOLDER = path.join(homedir(), '.ssh');
const KNOWN_HOSTS_TARGET = path.join(SSH_FOLDER, 'known_hosts');
const SSH_AGENT_PID_EXTRACT = /SSH_AGENT_PID=([0-9]+);/;

type CheckoutProps = {
  config: githubRepoData | sshRepoData;
  tmpFolder: string;
  childEnv: NodeJS.ProcessEnv & {
    SSH_AUTH_SOCK: string;
  };
  knownHostsFile?: string;
  log: Console;
};

const checkout = async ({
  config,
  tmpFolder,
  childEnv,
  knownHostsFile,
  log,
}: CheckoutProps) => {
  if (config.mode === 'ssh') {
    if (!knownHostsFile) {
      log.warn(KNOWN_HOSTS_WARNING);
    } else {
      await mkdirP(SSH_FOLDER);
      await fs.copyFile(knownHostsFile, KNOWN_HOSTS_TARGET);
    }

    // Setup ssh-agent with private key
    log.log(`Setting up ssh-agent on ${childEnv.SSH_AUTH_SOCK}`);
    const sshAgentMatch = SSH_AGENT_PID_EXTRACT.exec(
      (
        await exec(`ssh-agent -a ${childEnv.SSH_AUTH_SOCK}`, {
          log,
          env: childEnv,
        })
      ).stdout
    );

    if (!sshAgentMatch) {
      throw new Error('Unexpected output from ssh-agent');
    }
    childEnv.SSH_AGENT_PID = sshAgentMatch[1];
    log.log(`Adding private key to ssh-agent at ${childEnv.SSH_AUTH_SOCK}`);

    await writeToProcess('ssh-add', ['-'], {
      data: config.sshPrivateKey + '\n',
      env: childEnv,
      log,
    });
    log.log(`Private key added`);
  }

  // Clone repo
  log.log(
    `##[info] Vit Cloning the repo: git clone "${config.repo}" "${tmpFolder}"`
  );

  try {
    await exec(`git clone "${config.repo}" "${tmpFolder}"`, {
      log,
      env: childEnv,
    });
  } catch (err: any) {
    const s = err.toString();
    /* istanbul ignore else */
    if (config.mode === 'ssh') {
      /* istanbul ignore else */
      if (s.indexOf('Host key verification failed') !== -1) {
        // log.error(KNOWN_HOSTS_ERROR(config.parsedUrl?.resource || ''));
      } else if (s.indexOf('Permission denied (publickey') !== -1) {
        log.error(SSH_KEY_ERROR);
      }
    }
    throw err;
  }
};

export default checkout;
