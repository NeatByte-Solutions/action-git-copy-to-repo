import * as child_process from 'child_process';
import { stream as fgStream } from 'fast-glob';
import fsModule, { promises as fs } from 'fs';
import gitUrlParse from 'git-url-parse';
import { homedir, tmpdir } from 'os';
import * as path from 'path';
import git from 'isomorphic-git';
import { mkdirP } from '@actions/io';

export type Console = {
  readonly log: (...msg: unknown[]) => void;
  readonly error: (...msg: unknown[]) => void;
  readonly warn: (...msg: unknown[]) => void;
};

// Paths

const RESOURCES = path.join(path.dirname(__dirname), 'resources');
const KNOWN_HOSTS_GITHUB = path.join(RESOURCES, 'known_hosts_github.com');
const SSH_FOLDER = path.join(homedir(), '.ssh');
const KNOWN_HOSTS_TARGET = path.join(SSH_FOLDER, 'known_hosts');

const SSH_AGENT_PID_EXTRACT = /SSH_AGENT_PID=([0-9]+);/;

interface BaseConfig {
  branch: string;
  // folder: string;
  repo: string;
  // squashHistory: boolean;
  // skipEmptyCommits: boolean;
  // message: string;
  // tag?: string;
}

interface SshConfig extends BaseConfig {
  mode: 'ssh' | 'github';
  parsedUrl?: gitUrlParse.GitUrl;
  privateKey?: string;
  knownHostsFile?: string;
}

type GenConfigProps = {
  repo: string;
  branch: string;
  githubToken?: string;
  privateKey?: string;
  knownHostsFile?: string;
};

const genConfig: (props: GenConfigProps) => SshConfig = ({
  repo,
  branch,
  githubToken,
  privateKey,
  knownHostsFile,
}) => {
  if (!repo) throw new Error('REPO must be specified');
  if (!branch) throw new Error('BRANCH must be specified');
  //if (!env.FOLDER) throw new Error('FOLDER must be specified');

  // const folder = env.FOLDER;
  // const squashHistory = env.SQUASH_HISTORY === 'true';
  // const skipEmptyCommits = env.SKIP_EMPTY_COMMITS === 'true';
  // const message = env.MESSAGE || DEFAULT_MESSAGE;
  // const tag = env.TAG;

  // Determine the type of URL
  if (githubToken) {
    const url = `https://x-access-token:${githubToken}@github.com/${repo}.git`;
    const config: SshConfig = {
      repo: url,
      branch,
      mode: 'github',
    };
    return config;
  }
  const parsedUrl = gitUrlParse(repo);

  if (parsedUrl.protocol === 'ssh') {
    if (!privateKey)
      throw new Error('SSH_PRIVATE_KEY must be specified when REPO uses ssh');
    const config: SshConfig = {
      repo,
      branch,
      mode: 'ssh',
      parsedUrl,
      privateKey,
      knownHostsFile,
    };
    return config;
  }
  throw new Error('Unsupported REPO URL');
};

export const exec = async (
  cmd: string,
  opts: {
    env?: any;
    cwd?: string;
    log: Console;
  }
) => {
  const { log } = opts;
  const env = opts?.env || {};
  const ps = child_process.spawn('bash', ['-c', cmd], {
    env: {
      HOME: process.env.HOME,
      ...env,
    },
    cwd: opts.cwd,
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  const output = {
    stderr: '',
    stdout: '',
  };

  // We won't be providing any input to command
  ps.stdin.end();
  ps.stdout.on('data', (data) => {
    output.stdout += data;
    log.log(`data`, data.toString());
  });
  ps.stderr.on('data', (data) => {
    output.stderr += data;
    log.error(data.toString());
  });

  return new Promise<{
    stderr: string;
    stdout: string;
  }>((resolve, reject) =>
    ps.on('close', (code) => {
      if (code !== 0) {
        reject(
          new Error('Process exited with code: ' + code + ':\n' + output.stderr)
        );
      } else {
        resolve(output);
      }
    })
  );
};

export interface EnvironmentVariables {
  SRC_REPO?: string;
  SRC_BRANCH?: string;
  SRC_SSH_PRIVATE_KEY?: string;
  SRC_GITHUB_TOKEN?: string;
  KNOWN_HOSTS_FILE?: string;
  TARGET_REPO?: string;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends EnvironmentVariables {}
  }
}

// Error messages

const KNOWN_HOSTS_WARNING = `
##[warning] KNOWN_HOSTS_FILE not set
This will probably mean that host verification will fail later on
`;

const writeToProcess = (
  command: string,
  args: string[],
  opts: {
    env: { [id: string]: string | undefined };
    data: string;
    log: Console;
  }
) =>
  new Promise<void>((resolve, reject) => {
    const child = child_process.spawn(command, args, {
      env: opts.env,
      stdio: 'pipe',
    });
    child.stdin.setDefaultEncoding('utf-8');
    child.stdin.write(opts.data);
    child.stdin.end();
    child.on('error', reject);
    let stderr = '';
    child.stdout.on('data', (data) => {
      /* istanbul ignore next */
      opts.log.log(data.toString());
    });
    child.stderr.on('data', (data) => {
      stderr += data;
      opts.log.error(data.toString());
    });
    child.on('close', (code) => {
      /* istanbul ignore else */
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(stderr));
      }
    });
  });

export const main = async ({
  env = process.env,
  log,
}: {
  env?: EnvironmentVariables;
  log: Console;
}) => {
  log.log(`env`, env);
  const srcRepoConfig = genConfig({
    repo: env.SRC_REPO || '',
    branch: env.SRC_BRANCH || '',
    githubToken: env.SRC_GITHUB_TOKEN,
    privateKey: env.SRC_SSH_PRIVATE_KEY,
    knownHostsFile: env.KNOWN_HOSTS_FILE,
  });

  // Calculate paths that use temp diractory

  const TMP_PATH = await fs.mkdtemp(
    path.join(tmpdir(), 'git-publish-subdir-action-')
  );
  const REPO_TEMP = path.join(TMP_PATH, 'repo');
  const SSH_AUTH_SOCK = path.join(TMP_PATH, 'ssh_agent.sock');

  // Environment to pass to children
  const childEnv = Object.assign({}, process.env, {
    SSH_AUTH_SOCK,
  });

  if (srcRepoConfig.mode === 'ssh') {
    // Copy over the known_hosts file if set
    let known_hosts = srcRepoConfig.knownHostsFile;
    // Use well-known known_hosts for certain domains
    if (!known_hosts && srcRepoConfig?.parsedUrl?.resource === 'github.com') {
      known_hosts = KNOWN_HOSTS_GITHUB;
    }
    if (!known_hosts) {
      log.warn(KNOWN_HOSTS_WARNING);
    } else {
      await mkdirP(SSH_FOLDER);
      await fs.copyFile(known_hosts, KNOWN_HOSTS_TARGET);
    }

    // Setup ssh-agent with private key
    log.log(`Setting up ssh-agent on ${SSH_AUTH_SOCK}`);
    const sshAgentMatch = SSH_AGENT_PID_EXTRACT.exec(
      (await exec(`ssh-agent -a ${SSH_AUTH_SOCK}`, { log, env: childEnv }))
        .stdout
    );
    /* istanbul ignore if */
    if (!sshAgentMatch) throw new Error('Unexpected output from ssh-agent');
    childEnv.SSH_AGENT_PID = sshAgentMatch[1];
    log.log(`Adding private key to ssh-agent at ${SSH_AUTH_SOCK}`);
    await writeToProcess('ssh-add', ['-'], {
      data: srcRepoConfig.privateKey + '\n',
      env: childEnv,
      log,
    });
    log.log(`Private key added`);
  }

  // Clone source repo
  log.log(
    `##[info] Vit Cloning the repo: git clone "${srcRepoConfig.repo}" "${REPO_TEMP}"`
  );

  await exec(`git clone "${srcRepoConfig.repo}" "${REPO_TEMP}"`, {
    log,
    env: childEnv,
  }).catch((err) => {
    const s = err.toString();
    /* istanbul ignore else */
    if (srcRepoConfig.mode === 'ssh') {
      /* istanbul ignore else */
      if (s.indexOf('Host key verification failed') !== -1) {
        //log.error(KNOWN_HOSTS_ERROR(srcRepoConfig?.parsedUrl?.resource));
      } else if (s.indexOf('Permission denied (publickey') !== -1) {
        // log.error(SSH_KEY_ERROR);
      }
    }
    throw err;
  });
};
