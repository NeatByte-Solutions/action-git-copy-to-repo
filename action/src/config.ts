import gitUrlParse from 'git-url-parse';
import { EnvironmentVariables, githubRepoData, sshRepoData } from './types';

type getRepoDataProps = {
  repo: string;
  sshPrivateKey?: string;
  githubToken?: string;
  branch: string;
};

const getRepoData = ({
  repo,
  sshPrivateKey,
  githubToken,
  branch,
}: getRepoDataProps) => {
  // Determine the type of URL
  if (githubToken) {
    const url = `https://x-access-token:${githubToken}@github.com/${repo}.git`;
    const config: githubRepoData = {
      mode: 'github',
      repo: url,
      branch,
    };
    return config;
  }
  const parsedUrl = gitUrlParse(repo);

  if (parsedUrl.protocol === 'ssh') {
    if (!sshPrivateKey)
      throw new Error('SSH_PRIVATE_KEY must be specified when REPO uses ssh');
    const config: sshRepoData = {
      repo,
      branch,
      mode: 'ssh',
      sshPrivateKey,
    };
    return config;
  }
  throw new Error('Unsupported REPO URL');
};

export type ConfigType = {
  src: githubRepoData | sshRepoData;
  target: githubRepoData | sshRepoData;
  commit: {
    message?: string;
    author?: string;
    authorEmail?: string;
  };
  knownHostsFile?: string;
};

const genConfig: (env: EnvironmentVariables) => ConfigType = (
  env = process.env
) => {
  // TODO Validation

  return {
    src: getRepoData({
      repo: env.SRC_SSH_REPO || env.SRC_GITHUB_REPO || '',
      sshPrivateKey: env.SRC_SSH_PRIVATE_KEY,
      // sshPrivateKey: env.SRC_SSH_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      githubToken: env.SRC_GITHUB_TOKEN,
      branch: env.SRC_BRANCH || '',
    }),
    target: getRepoData({
      repo: env.TARGET_SSH_REPO || env.TARGET_GITHUB_REPO || '',
      sshPrivateKey: env.TARGET_SSH_PRIVATE_KEY,
      // sshPrivateKey: env.TARGET_SSH_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      githubToken: env.TARGET_GITHUB_TOKEN,
      branch: env.TARGET_BRANCH || '',
    }),
    commit: {
      message: env.COMMIT_MESSAGE,
      author: env.COMMIT_AUTHOR,
      authorEmail: env.COMMIT_AUTHOR_EMAIL,
    },
    knownHostsFile: env.KNOWN_HOSTS_FILE,
  };
};

export default genConfig;
