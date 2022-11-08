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
  SRC_REPO?: any;
  TARGET_REPO?: any;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends EnvironmentVariables {}
  }
}

export const main = async ({
  env = process.env,
  log,
}: {
  env?: EnvironmentVariables;
  log: Console;
}) => {
  log.log(`env`, env);
  // const config = genConfig(env);

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

  // Clone source repo
  log.log(
    `##[info] Vit Cloning the repo: git clone "${env.SRC_REPO}" "${REPO_TEMP}"`
  );

  await exec(`git clone "${env.SRC_REPO}" "${REPO_TEMP}"`, {
    log,
    env: childEnv,
  }).catch((err) => {
    // const s = err.toString();
    // /* istanbul ignore else */
    // if (config.mode === 'ssh') {
    //   /* istanbul ignore else */
    //   if (s.indexOf('Host key verification failed') !== -1) {
    //     log.error(KNOWN_HOSTS_ERROR(config.parsedUrl.resource));
    //   } else if (s.indexOf('Permission denied (publickey') !== -1) {
    //     log.error(SSH_KEY_ERROR);
    //   }
    // }
    throw err;
  });
};
