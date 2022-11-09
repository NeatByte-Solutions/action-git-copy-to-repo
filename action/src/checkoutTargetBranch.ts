import exec from './utils/exec';
import { CheckoutProps } from './types';

const checkoutTargetBranch = async ({
  config,
  tmpFolder,
  childEnv,
  log,
}: CheckoutProps) => {
  // Check if branch already exists
  log.log(`##[info] Checking if branch ${config.branch} exists already`);
  const branchCheck = await exec(`git branch --list "${config.branch}"`, {
    log,
    env: childEnv,
    cwd: tmpFolder,
  });

  if (branchCheck.stdout.trim() === '') {
    // Branch does not exist yet, let's check it out as an orphan
    log.log(`##[info] ${config.branch} does not exist, creating as orphan`);
    await exec(`git checkout -b "${config.branch}"`, {
      log,
      env: childEnv,
      cwd: tmpFolder,
    });
  } else {
    await exec(`git checkout "${config.branch}"`, {
      log,
      env: childEnv,
      cwd: tmpFolder,
    });
  }
};

export default checkoutTargetBranch;
