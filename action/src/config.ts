import gitUrlParse from 'git-url-parse';

export type ConfigType = {
  mode: 'ssh' | 'github';
  parsedUrl?: gitUrlParse.GitUrl;
  privateKey?: string;
  knownHostsFile?: string;
  branch: string;
  // folder: string;
  repo: string;
  // squashHistory: boolean;
  // skipEmptyCommits: boolean;
  // message: string;
  // tag?: string;
};

type GenConfigProps = {
  repo: string;
  branch: string;
  githubToken?: string;
  privateKey?: string;
  knownHostsFile?: string;
};

const genConfig: (props: GenConfigProps) => ConfigType = ({
  repo,
  branch,
  githubToken,
  privateKey,
  knownHostsFile,
}) => {
  if (!repo) throw new Error('REPO must be specified');
  if (!branch) throw new Error('BRANCH must be specified');
  //if (!env.FOLDER) throw new Error('FOLDER must be specified');

  // const folder = env.FOLDER;
  // const squashHistory = env.SQUASH_HISTORY === 'true';
  // const skipEmptyCommits = env.SKIP_EMPTY_COMMITS === 'true';
  // const message = env.MESSAGE || DEFAULT_MESSAGE;
  // const tag = env.TAG;

  // Determine the type of URL
  if (githubToken) {
    const url = `https://x-access-token:${githubToken}@github.com/${repo}.git`;
    const config: ConfigType = {
      repo: url,
      branch,
      mode: 'github',
    };
    return config;
  }
  const parsedUrl = gitUrlParse(repo);

  if (parsedUrl.protocol === 'ssh') {
    if (!privateKey)
      throw new Error('SSH_PRIVATE_KEY must be specified when REPO uses ssh');
    const config: ConfigType = {
      repo,
      branch,
      mode: 'ssh',
      parsedUrl,
      privateKey,
      knownHostsFile,
    };
    return config;
  }
  throw new Error('Unsupported REPO URL');
};

export default genConfig;
