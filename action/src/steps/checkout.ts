import gitUrlParse from 'git-url-parse';
import { exec } from '../utils/processUtils';
import { Context, ExecOpts, RepoData } from '../types';
import { SSH_KEY_ERROR, KNOWN_HOSTS_ERROR } from '../utils/errorMessages';

class NoSuchBranchError extends Error {
  constructor(branch: string, repo: string) {
    super(`Failed to checkout branch "${branch}" from repository "${repo}"`);
  }
}

export type CheckoutProps = {
  context: Context;
  repoData?: RepoData;
  tmpFolder?: string;
  execOpts?: ExecOpts;
};

const clone = async ({ context, repoData, tmpFolder, execOpts }: CheckoutProps) => {
  const { log } = context;
  const repo = repoData?.sshPrivateKey
    ? repoData?.sshRepo || ''
    : `https://x-access-token:${repoData?.githubToken}@github.com/${repoData?.githubRepo}.git`;

  log.log(`##[info] Cloning the repo: git clone "${repo}" "${tmpFolder}"`);
  try {
    // check if "." is working same as "tempFolder"
    await exec(`git clone "${repo}" .`, {
      log,
      env: execOpts?.env,
    });
  } catch (err: any) {
    const s = err.toString();
    if (repoData?.sshPrivateKey) {
      if (s.indexOf('Host key verification failed') !== -1) {
        // remove lib usage for no reason
        const parsedUrl = gitUrlParse(repo);
        log.error(KNOWN_HOSTS_ERROR(parsedUrl?.resource || ''));
      } else if (s.indexOf('Permission denied (publickey') !== -1) {
        log.error(SSH_KEY_ERROR);
      }
    }
    throw err;
  }
};

interface SwitchToBranchProps {
  context: Context;
  branch?: string;
  folder?: string;
  execOpts: ExecOpts;
}

const switchToBranch = async ({ context, branch: gitBranch, folder, execOpts }: SwitchToBranchProps) => {
  const { log } = context;

  log.log(`##[info] Checkout branch "${gitBranch}"`);
  // Fetch branch if it exists
  try {
    // await exec(`git fetch -u origin ${branch}:${branch}`, {
    //   ...execOpts,
    //   cwd: folder,
    // });
    await checkoutBranch();
  } catch (err) {
    if (err instanceof NoSuchBranchError) {
      log.error(`##[warning] Failed to fetch a branch "${gitBranch}", probably doesn't exist`);
    }
    throw err;
  }

  // move to checkoutBranch
  // Checkout branch
  // await exec(`git checkout "${gitBranch}"`, {
  //   ...execOpts,
  //   cwd: folder,
  // });
};

interface SwitchOrCreateBranchProps extends SwitchToBranchProps {
  baseBranch?: string;
}

const switchOrCreateBranch = async ({
  context,
  branch,
  baseBranch,
  folder,
  execOpts,
}: SwitchOrCreateBranchProps) => {
  const { log } = context;

  log.log(`##[info] Checkout branch "${branch}"`);
  // Fetch branch if it exists
  try {
    // await exec(`git fetch -u origin ${branch}:${branch}`, {
    //   ...execOpts,
    //   cwd: folder,
    // });
    await checkoutBranch();
  } catch (err) {
    if (err instanceof NoSuchBranchError) {
      // create new branch flow
      await createNewBranch();
    } else {
      throw err;
    }
  }

  // use this check inside checkoutBranch
  // Check if branch already exists
  log.log(`##[info] Checking if branch ${branch} exists already`);
  const branchCheck = await exec(`git branch --list "${branch}"`, {
    ...execOpts,
    cwd: folder,
  });
  if (branchCheck.stdout.trim() === '') {
    // Branch does not exist yet, let's check it out from base branch
    log.log(`##[info] ${branch} does not exist, creating from ${baseBranch}`);
    await exec(`git checkout -b "${branch}" "${baseBranch}"`, {
      ...execOpts,
      cwd: folder,
    });
  }
};

export const checkoutSrc = async (context: Context) => {
  // Clone source repo
  await clone({
    context,
    repoData: context.config?.src,
    tmpFolder: context.temp.srcTempRepo,
    execOpts: context.exec.srcExecOpt,
  });

  // Switch to source branch or create new one if such doesn't exist
  await switchToBranch({
    context,
    branch: context.config?.src?.branch,
    folder: context.temp.srcTempRepo,
    execOpts: context.exec.srcExecOpt,
  });
};

export const checkoutTarget = async (context: Context) => {
  // Clone target repo
  await clone({
    context,
    repoData: context.config?.target,
    tmpFolder: context.temp.targetTempRepo,
    execOpts: context.exec.targetExecOpt,
  });

  // Switch to target branch or create new one if such doesn't exist
  await switchOrCreateBranch({
    context,
    branch: context.config?.target?.branch,
    baseBranch: context.config?.target?.baseBranch,
    folder: context.temp.targetTempRepo,
    execOpts: context.exec.targetExecOpt,
  });
};
