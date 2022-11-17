import git from 'isomorphic-git';
import fsModule from 'fs';
import { exec } from '../utils/processUtils';
import { Context } from '../types';

const checkIfChanged = async (context: Context) => {
  const { log } = context;
  const dir = context.temp.targetTempRepo;

  log.log(`##[info] Checking whether contents have changed before pushing`);
  const head = await git.resolveRef({
    fs: fsModule,
    dir,
    ref: 'HEAD',
  });
  const currentCommit = await git.readCommit({
    fs: fsModule,
    dir,
    oid: head,
  });
  if (currentCommit.commit.parent.length === 1) {
    const previousCommit = await git.readCommit({
      fs: fsModule,
      dir,
      oid: currentCommit.commit.parent[0],
    });
    if (currentCommit.commit.tree === previousCommit.commit.tree) {
      log.log(`##[info] Contents of target repo unchanged, exiting.`);
      return;
    }
  }
};

const push = async (context: Context) => {
  const { log } = context;
  const folder = context.temp.targetTempRepo;

  log.log(`##[info] Pushing: git push origin "${folder}"`);
  const push = await exec(`git push origin "${folder}"`, context.exec.targetExecOpt);
  log.log(push.stdout);
  log.log(`##[info] Deployment Successful`);
};

export const commit = async (context: Context) => {
  // const { log } = context;
  // await exec(`git add -A .`, context.exec?.targetExecOpt);
  // const message = config.message
  //   .replace(/\{target\-branch\}/g, config.branch)
  //   .replace(/\{sha\}/g, gitInfo.sha.substr(0, 7))
  //   .replace(/\{long\-sha\}/g, gitInfo.sha)
  //   .replace(/\{msg\}/g, gitInfo.commitMessage);
  // await git.commit({
  //   fs: fsModule,
  //   dir: REPO_TEMP,
  //   message,
  //   author: { email, name },
  // });

  // Before we push, check whether it changed the tree,
  // and avoid pushing if not
  checkIfChanged(context);

  // Push branch
  push(context);
};
