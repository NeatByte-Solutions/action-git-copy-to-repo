import * as child_process from 'child_process';
import { Console } from '../types';

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

export default writeToProcess;
