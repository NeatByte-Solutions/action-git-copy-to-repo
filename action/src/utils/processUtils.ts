import * as child_process from 'child_process';
import { Console } from '../types';

export const exec = async (
  cmd: string,
  opts: {
    env?: any;
    cwd?: string;
    log: Console;
    logOutput?: boolean;
  }
) => {
  const { log, logOutput = true } = opts;
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
    if (logOutput) {
      log.log(`data`, data.toString());
    }
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
        reject(new Error('Process exited with code: ' + code + ':\n' + output.stderr));
      } else {
        resolve(output);
      }
    })
  );
};

export const writeToProcess = (
  command: string,
  args: string[],
  data: string,
  opts: {
    env?: any;
    cwd?: string;
    log: Console;
  }
) =>
  new Promise<void>((resolve, reject) => {
    const child = child_process.spawn(command, args, {
      env: opts.env,
      stdio: 'pipe',
    });
    child.stdin.setDefaultEncoding('utf-8');
    child.stdin.write(data);
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
