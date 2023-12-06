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
    } else {
      const { stdout } = await exec(`git diff --stat ${previousCommit.oid} ${head}`, {
        ...context.exec.targetExecOpt,
        logOutput: false,
      });

      log.log(`##[info] Changes:\n${stdout}`);
    }
  }

  return true;
};

const checkIfFileCountMatches = async (context: Context) => {
  const { config, log } = context;
  const expectedFileChangeCount = config?.expectedFileChangeCount;
  const baseBranch = config?.target.baseBranch;
  const targetBranch = config?.target.branch;

  if (expectedFileChangeCount === undefined || baseBranch === undefined) {
    return true;
  }

  log.log(
    `##[info] Checking whether the number of changed files between ${baseBranch} and ${targetBranch} matches the expected count`
  );

  // Fetch base branch
  await exec(`git fetch origin ${baseBranch}:${baseBranch}`, {
    ...context.exec.targetExecOpt,
    logOutput: false,
  });

  // Find the common ancestor of the target branch and the base branch
  const { stdout: commonAncestor } = await exec(`git merge-base ${targetBranch} ${baseBranch}`, {
    ...context.exec.targetExecOpt,
    logOutput: false,
  });

  // Compare the target branch against the common ancestor
  const { stdout } = await exec(`git diff --name-only ${commonAncestor.trim()} ${targetBranch}`, {
    ...context.exec.targetExecOpt,
    logOutput: false,
  });

  const changedFilesCount = stdout
    .trim()
    .split('\n')
    .filter((line) => line).length;

  if (changedFilesCount !== expectedFileChangeCount) {
    log.log(
      `##[info] File change count (${changedFilesCount}) does not match the expected number (${expectedFileChangeCount}), exiting.`
    );
    return false;
  }

  return true;
};

const push = async (context: Context, force?: boolean) => {
  const { log } = context;
  const branch = context.config?.target.branch;
  const forceFlag = force ? '--force ' : '';

  if (branch) {
    log.log(`##[info] Pushing: git push ${forceFlag} origin ${branch}`);
    const push = await exec(`git push ${forceFlag} origin ${branch}`, context.exec.targetExecOpt);
    log.log(push.stdout);
  } else {
    log.log(`##[info] Pushing: git push ${forceFlag}`);
    const push = await exec(`git push ${forceFlag}`, context.exec.targetExecOpt);
    log.log(push.stdout);
  }

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

  // Verify if the file change count matches the expected number
  const fileCountMatches = await checkIfFileCountMatches(context);

  if (isChanged && fileCountMatches) {
    await push(context);
  }
};

export const revertCommit = async (context: Context) => {
  const { log } = context;

  log.log(`##[info] Reverting last commit: git reset --hard HEAD^1`);
  await exec(`git reset --hard HEAD^1`, context.exec?.targetExecOpt);

  await push(context, true);
};
