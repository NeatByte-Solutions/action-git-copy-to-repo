import * as path from 'path';
import { homedir } from 'os';
import { exec } from './utils/processUtils';
import { Console, Context, ExecOpts, RepoData } from './types';
import { SSH_KEY_ERROR } from './utils/errorMessages';

class NoSuchBranchError extends Error {
  constructor(branch: string, repo: string) {
    super(`Failed to checkout branch "${branch}" from repository "${repo}"`);
  }
}

// use check
// if (err instanceOf NoSuchBranchError)
// for not existing branch cases

// const checkoutTargetBranch = async ({ config, tmpFolder, childEnv, log }: CheckoutProps) => {
//   // Check if branch already exists
//   log.log(`##[info] Checking if branch ${config.branch} exists already`);
//   const branchCheck = await exec(`git branch --list "${config.branch}"`, {
//     log,
//     env: childEnv,
//     cwd: tmpFolder,
//   });

//   if (branchCheck.stdout.trim() === '') {
//     // Branch does not exist yet, let's create a new branch
//     log.log(`##[info] ${config.branch} does not exist, creating a new branch from default branch`);
//     await exec(`git checkout -b "${config.branch}"`, {
//       log,
//       env: childEnv,
//       cwd: tmpFolder,
//     });
//   } else {
//     await exec(`git checkout "${config.branch}"`, {
//       log,
//       env: childEnv,
//       cwd: tmpFolder,
//     });
//   }
// };

export type CheckoutProps = {
  repoData?: RepoData;
  tmpFolder?: string;
  execOpts?: ExecOpts;
  log: Console;
};

export const checkout = async ({ repoData, tmpFolder, execOpts, log }: CheckoutProps) => {
  // Clone repo
  // log.log(`##[info] Cloning the repo: git clone "${repoData.repo}" "${tmpFolder}"`);

  // try {
  //   await exec(`git clone "${repoData.repo}" "${tmpFolder}"`, execOpts);
  // } catch (err: any) {
  //   const s = err.toString();
  //   /* istanbul ignore else */
  //   if (repoData.mode === 'ssh') {
  //     /* istanbul ignore else */
  //     if (s.indexOf('Host key verification failed') !== -1) {
  //       // log.error(KNOWN_HOSTS_ERROR(config.parsedUrl?.resource || ''));
  //     } else if (s.indexOf('Permission denied (publickey') !== -1) {
  //       log.error(SSH_KEY_ERROR);
  //     }
  //   }
  //   throw err;
  // }
};

export const checkoutSrc = async (context: Context) => {

  await checkout({
    repoData: context.config?.src,
    tmpFolder: context.temp.srcTempFolder,
    execOpts: context.exec.srcExecOpt,
    log: context.log,
  });

  // switch to config branch (error if failure)
};

export const checkoutTarget = async (context: Context) => {

  await checkout({
    repoData: context.config?.target,
    tmpFolder: context.temp.targetTempFolder,
    execOpts: context.exec.targetExecOpt,
    log: context.log,
  });

  // 1) switch to config branch (can be a failure if such doesn't exist)
  // 2) switch to "TARGET_BASE_BRANCH" (if needed otherwise stay on default branch)
  // 3) create new branch (from default branch or defined "TARGET_BASE_BRANCH")

  
  // await checkoutTargetBranch({
  //   config: config.target,
  //   tmpFolder: TARGET_REPO_TEMP,
  //   childEnv,
  //   log,
  // });
};

// use same approach as "setupSshKeys = async (context: Context): Promise<void>"
// (no need to have more code in index.ts - just pass context, all details are hidden inside step)
// maybe better to do 2 funcs: checkoutBranch, checkoutOrCreateBranch
// as src and target repos have different logic
