// import * as path from 'path';
// import { homedir } from 'os';
// import { promises as fs } from 'fs';
// import { mkdirP } from '@actions/io';
// import { exec, writeToProcess } from './utils/processUtils';
// import { Console, Context, ExecOpts, RepoData } from './types';
// import { KNOWN_HOSTS_WARNING, SSH_KEY_ERROR } from './utils/errorMessages';

// // Paths
// const SSH_FOLDER = path.join(homedir(), '.ssh');
// const KNOWN_HOSTS_TARGET = path.join(SSH_FOLDER, 'known_hosts');
// const SSH_AGENT_PID_EXTRACT = /SSH_AGENT_PID=([0-9]+);/;

// // const checkoutTargetBranch = async ({ config, tmpFolder, childEnv, log }: CheckoutProps) => {
// //   // Check if branch already exists
// //   log.log(`##[info] Checking if branch ${config.branch} exists already`);
// //   const branchCheck = await exec(`git branch --list "${config.branch}"`, {
// //     log,
// //     env: childEnv,
// //     cwd: tmpFolder,
// //   });

// //   if (branchCheck.stdout.trim() === '') {
// //     // Branch does not exist yet, let's create a new branch
// //     log.log(`##[info] ${config.branch} does not exist, creating a new branch from default branch`);
// //     await exec(`git checkout -b "${config.branch}"`, {
// //       log,
// //       env: childEnv,
// //       cwd: tmpFolder,
// //     });
// //   } else {
// //     await exec(`git checkout "${config.branch}"`, {
// //       log,
// //       env: childEnv,
// //       cwd: tmpFolder,
// //     });
// //   }
// // };

// export type CheckoutProps = {
//   repoData?: RepoData;
//   tmpFolder?: string;
//   execOpts?: ExecOpts;
//   log: Console;
// };

// export const checkout = async ({ repoData, tmpFolder, execOpts, log }: CheckoutProps) => {
//   // Clone repo
//   log.log(`##[info] Cloning the repo: git clone "${repoData.repo}" "${tmpFolder}"`);

//   try {
//     await exec(`git clone "${repoData.repo}" "${tmpFolder}"`, execOpts);
//   } catch (err: any) {
//     const s = err.toString();
//     /* istanbul ignore else */
//     if (repoData.mode === 'ssh') {
//       /* istanbul ignore else */
//       if (s.indexOf('Host key verification failed') !== -1) {
//         // log.error(KNOWN_HOSTS_ERROR(config.parsedUrl?.resource || ''));
//       } else if (s.indexOf('Permission denied (publickey') !== -1) {
//         log.error(SSH_KEY_ERROR);
//       }
//     }
//     throw err;
//   }
// };

// const setupSSH = async (context: Context) => {
//   const { log } = context;
//   // if (!knownHostsFile) {
//   //   log.warn(KNOWN_HOSTS_WARNING);
//   // } else {
//   //   await mkdirP(SSH_FOLDER);
//   //   await fs.copyFile(knownHostsFile, KNOWN_HOSTS_TARGET);
//   // }

//   // Setup ssh-agent with private key
//   log.log(`Setting up ssh-agent on ${context.sshAuthSock}`);
//   const sshAgentMatch = SSH_AGENT_PID_EXTRACT.exec(
//     (
//       await exec(`ssh-agent -a ${childEnv.SSH_AUTH_SOCK}`, {
//         log,
//         env: childEnv,
//       })
//     ).stdout
//   );

//   if (!sshAgentMatch) {
//     throw new Error('Unexpected output from ssh-agent');
//   }
//   childEnv.SSH_AGENT_PID = sshAgentMatch[1];
//   log.log(`Adding private key to ssh-agent at ${childEnv.SSH_AUTH_SOCK}`);

//   await writeToProcess('ssh-add', ['-'], {
//     data: repoData.sshPrivateKey + '\n',
//     env: childEnv,
//     log,
//   });
//   log.log(`Private key added`);
// };

// export const checkoutSrc = async (context: Context) => {
//   if (context.config?.src?.sshRepo) {
//     await setupSSH(context);
//   }
//   await checkout({
//     repoData: context.config?.src,
//     tmpFolder: context.srcTempFolder,
//     execOpts: context.srcExecOpt,
//     log: context.log,
//   });
// };

// export const checkoutTarget = async (context: Context) => {
//   if (context.config?.target?.sshRepo) {
//     await setupSSH(context);
//   }
//   await checkout({
//     repoData: context.config?.target,
//     tmpFolder: context.targetTempFolder,
//     execOpts: context.targetExecOpt,
//     log: context.log,
//   });

//   // await checkoutTargetBranch({
//   //   config: config.target,
//   //   tmpFolder: TARGET_REPO_TEMP,
//   //   childEnv,
//   //   log,
//   // });
// };
