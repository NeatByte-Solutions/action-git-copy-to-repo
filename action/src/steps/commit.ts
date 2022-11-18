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
      return false;
    }
  }

  return true;
};

const push = async (context: Context) => {
  const { log } = context;
  const branch = context.config?.target.branch;

  log.log(`##[info] Pushing: git push origin ${branch}`);
  const push = await exec(`git push origin ${branch}`, context.exec.targetExecOpt);
  log.log(push.stdout);
  log.log(`##[info] Deployment Successful`);
};

export const commit = async (context: Context) => {
  const { log } = context;
  const { message, author, authorEmail } = context.config?.commit || {};

  await exec(`git add -f -A .`, context.exec?.targetExecOpt);
  log.log(`##[info] Committing: git commit -m "${message}" --author="${author} <${authorEmail}>"`);
  await git.commit({
    fs: fsModule,
    dir: context.temp.targetTempRepo,
    message: message || '',
    author: { email: authorEmail, name: author },
  });

  // Before we push, check whether it changed the tree,
  // and avoid pushing if not
  const isChanged = await checkIfChanged(context);

  if (isChanged) {
    await push(context);
  }
};
