import * as path from 'path';

import { Context, ExecOpts, RepoData } from '../types';
import { exec, writeToProcess } from '../utils/processUtils';

// RegEx to extract SSH_AGENT_PID
const SSH_AGENT_PID_EXTRACT = /SSH_AGENT_PID=([0-9]+);/;

const createExecOpts = (context: Context, envAppend?: Object, cwd?: string): ExecOpts => {
  const { log } = context;

  const childEnv = Object.assign({}, process.env, envAppend);

  return {
    log,
    cwd,
    env: childEnv,
  };
};

const setupSshKeysForRepo = async (
  context: Context,
  repoData: RepoData,
  tempFolder: string,
  tempRepoFolder: string
): Promise<ExecOpts> => {
  const { log } = context;
  const SSH_AUTH_SOCK = path.join(tempFolder, 'ssh_agent.sock');

  let execOpts = createExecOpts(context, {
    SSH_AUTH_SOCK,
  });

  // Setup ssh-agent with private key
  log.log(`Setting up ssh-agent on ${SSH_AUTH_SOCK}`);
  const sshAgentMatch = SSH_AGENT_PID_EXTRACT.exec(
    (await exec(`ssh-agent -a ${SSH_AUTH_SOCK}`, execOpts)).stdout
  );

  if (!sshAgentMatch) {
    throw new Error('Unexpected output from ssh-agent');
  }

  log.log(`Adding private key to ssh-agent at ${SSH_AUTH_SOCK}`);

  // add PID to execOpts
  execOpts = createExecOpts(
    context,
    {
      SSH_AGENT_PID: sshAgentMatch[1],
      SSH_AUTH_SOCK,
    },
    tempRepoFolder
  );

  await writeToProcess('ssh-add', ['-'], repoData.sshPrivateKey + '\n', execOpts);

  log.log(`Private key added to ssh agent at ${SSH_AUTH_SOCK}`);

  return execOpts;
};

export const setupSshKeys = async (context: Context): Promise<void> => {
  const { log } = context;

  if (context.config?.src?.sshPrivateKey) {
    log.log(`##[info] Setting ssh key for src repo`);

    const execOpts = await setupSshKeysForRepo(
      context,
      context.config?.src,
      context.temp?.srcTempFolder || '',
      context.temp?.srcTempRepo || ''
    );

    context.exec.srcExecOpt = execOpts;
  } else {
    context.exec.srcExecOpt = {
      log,
      cwd: context.temp?.srcTempRepo || '',
      env: process.env,
    };
  }

  if (context.config?.target?.sshPrivateKey) {
    log.log(`##[info] Setting ssh key for target repo`);

    const execOpts = await setupSshKeysForRepo(
      context,
      context.config?.target,
      context.temp?.targetTempFolder || '',
      context.temp?.srcTempRepo || ''
    );

    context.exec.targetExecOpt = execOpts;
  } else {
    context.exec.targetExecOpt = {
      log,
      cwd: context.temp?.targetTempRepo || '',
      env: process.env,
    };
  }
};

export const killSshProcesses = async (context: Context): Promise<void> => {
  const { log } = context;

  if (context.config?.src?.sshPrivateKey) {
    log.log(`##[info] Killing ssh-agent for src repo`);
    await exec(`ssh-agent -k`, context.exec.srcExecOpt);
  }

  if (context.config?.target?.sshPrivateKey) {
    log.log(`##[info] Killing ssh-agent for target repo`);
    await exec(`ssh-agent -k`, context.exec.targetExecOpt);
  }
};
