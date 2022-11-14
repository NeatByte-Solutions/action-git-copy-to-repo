import { Context, EnvironmentVariables } from '../types';

export const config = async (env: EnvironmentVariables, context: Context): Promise<void> => {
  // TODO: Validation, use yup schema

  context.config = {
    src: {
      sshRepo: env.SRC_SSH_REPO,
      // sshPrivateKey: env.SRC_SSH_PRIVATE_KEY,
      sshPrivateKey: env.SRC_SSH_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      githubRepo: env.SRC_GITHUB_REPO,
      githubToken: env.SRC_GITHUB_TOKEN,
      branch: env.SRC_BRANCH,
    },
    target: {
      sshRepo: env.TARGET_SSH_REPO,
      // sshPrivateKey: env.TARGET_SSH_PRIVATE_KEY,
      sshPrivateKey: env.TARGET_SSH_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      githubRepo: env.TARGET_GITHUB_REPO,
      githubToken: env.TARGET_GITHUB_TOKEN,
      branch: env.TARGET_BRANCH,
    },
    commit: {
      message: env.COMMIT_MESSAGE,
      author: env.COMMIT_AUTHOR,
      authorEmail: env.COMMIT_AUTHOR_EMAIL,
    },
    knownHostsFile: env.KNOWN_HOSTS_FILE,
  };
};