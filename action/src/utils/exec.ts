import * as child_process from 'child_process';
import { Console } from '../types';

const exec = async (
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

export default exec;
