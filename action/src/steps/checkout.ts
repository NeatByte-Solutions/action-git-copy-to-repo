import { exec } from '../utils/processUtils';
import { Context, ExecOpts, RepoData } from '../types';
import { SSH_KEY_ERROR, KNOWN_HOSTS_ERROR } from '../utils/errorMessages';

class NoSuchBranchError extends Error {
  constructor(branch: string, repo: string) {
    super(`Failed to checkout branch "${branch}" from repository "${repo}"`);
  }
}

const clone = async (context: Context, repoData: RepoData, execOpts: ExecOpts) => {
  const { log } = context;
  const repo = repoData?.sshPrivateKey
    ? repoData?.sshRepo || ''
    : `https://x-access-token:${repoData?.githubToken}@github.com/${repoData?.githubRepo}.git`;

  log.log(`##[info] Cloning the repo: git clone "${repo}" "${execOpts.cwd}"`);
  try {
    await exec(`git clone "${repo}" .`, execOpts);
  } catch (err: any) {
    const s = err.toString();
    if (repoData?.sshPrivateKey) {
      if (s.indexOf('Host key verification failed') !== -1) {
        log.error(KNOWN_HOSTS_ERROR);
      } else if (s.indexOf('Permission denied (publickey') !== -1) {
        log.error(SSH_KEY_ERROR);
      }
    }
    throw err;
  }
};

const checkIfBranchExists = async (branch: string, repo: string, execOpts: ExecOpts) => {
  try {
    // Fetch branch if it exists
    await exec(`git fetch -u origin ${branch}:${branch}`, execOpts);

    // Check if branch already exists
    const branchCheck = await exec(`git branch --list "${branch}"`, execOpts);
    if (branchCheck.stdout.trim() === '') {
      throw new NoSuchBranchError(branch, repo);
    }
  } catch (err: any) {
    const s = err.toString();

    if (s.indexOf("Couldn't find remote ref") === -1) {
      throw new NoSuchBranchError(branch, repo);
    } else {
      throw err;
    }
  }
};

const checkoutBranch = async (context: Context, repoData: RepoData, execOpts: ExecOpts) => {
  const { log } = context;
  const branch = repoData?.branch || '';
  const repo = repoData?.sshRepo || repoData?.githubRepo || '';

  log.log(`##[info] Checkout branch "${branch}"`);
  try {
    await checkIfBranchExists(branch, repo, execOpts);

    // Checkout branch
    await exec(`git checkout "${branch}"`, execOpts);
  } catch (err) {
    if (err instanceof NoSuchBranchError) {
      log.error(`##[warning] Failed to fetch a branch "${branch}", probably doesn't exist`);
    }
    throw err;
  }
};

const createNewBranch = async (context: Context, repoData: RepoData, execOpts: ExecOpts) => {
  const { log } = context;

  log.log(`##[info] ${repoData?.branch} does not exist, creating new one`);
  try {
    // Checkout base branch if specified
    if (repoData?.baseBranch) {
      await checkoutBranch(context, { ...repoData, branch: repoData?.baseBranch }, execOpts);
    }
    // Create new branch
    await exec(`git checkout -b "${repoData?.branch}"`, execOpts);
  } catch (err) {
    if (err instanceof NoSuchBranchError) {
      log.error(
        `##[warning] Failed to fetch a base branch "${repoData?.baseBranch}", probably doesn't exist`
      );
    }
    throw err;
  }
};

const switchOrCreateBranch = async (context: Context, repoData: RepoData, execOpts: ExecOpts) => {
  try {
    // Try to checkout branch
    await checkoutBranch(context, repoData, execOpts);
  } catch (err) {
    if (err instanceof NoSuchBranchError) {
      // Create new branch if it does not exists yet
      await createNewBranch(context, repoData, execOpts);
    } else {
      throw err;
    }
  }
};

type CheckoutProps = {
  context: Context;
  repoData: RepoData;
  execOpts: ExecOpts;
};

const checkoutSrc = async ({ context, repoData, execOpts }: CheckoutProps) => {
  // Clone source repo
  await clone(context, repoData, execOpts);

  if (repoData?.branch) {
    // Switch to source branch
    await checkoutBranch(context, repoData, execOpts);
  }
};

const checkoutTarget = async ({ context, repoData, execOpts }: CheckoutProps) => {
  // Clone target repo
  await clone(context, repoData, execOpts);

  if (repoData?.branch) {
    // Switch to target branch or create new one if such doesn't exist
    await switchOrCreateBranch(context, repoData, execOpts);
  }
};

export const checkout = async (context: Context, skipSource?: boolean) => {
  const srcParams = {
    context,
    repoData: context.config?.src || {},
    execOpts: context.exec.srcExecOpt,
  };
  const targetParams = {
    context,
    repoData: context.config?.target || {},
    execOpts: context.exec.targetExecOpt,
  };

  if (!skipSource) {
    await checkoutSrc(srcParams);
  }

  await checkoutTarget(targetParams);
};
