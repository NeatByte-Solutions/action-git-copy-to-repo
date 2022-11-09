export type Console = {
  readonly log: (...msg: unknown[]) => void;
  readonly error: (...msg: unknown[]) => void;
  readonly warn: (...msg: unknown[]) => void;
};

export interface EnvironmentVariables {
  SRC_SSH_REPO?: string;
  SRC_SSH_PRIVATE_KEY?: string;
  SRC_GITHUB_REPO?: string;
  SRC_GITHUB_TOKEN?: string;
  SRC_BRANCH?: string;
  TARGET_SSH_REPO?: string;
  TARGET_SSH_PRIVATE_KEY?: string;
  TARGET_GITHUB_REPO?: string;
  TARGET_GITHUB_TOKEN?: string;
  TARGET_BRANCH?: string;
  DELETE_FROM_SRC?: string;
  DELETE_FROM_TARGET?: string;
  COMMIT_MESSAGE?: string;
  COMMIT_AUTHOR?: string;
  COMMIT_AUTHOR_EMAIL?: string;
  KNOWN_HOSTS_FILE?: string;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends EnvironmentVariables {}
  }
}

export type githubRepoData = {
  mode: 'github';
  repo: string;
  branch: string;
};

export type sshRepoData = {
  mode: 'ssh';
  repo: string;
  sshPrivateKey: string;
  branch: string;
};

export type CheckoutProps = {
  config: githubRepoData | sshRepoData;
  tmpFolder: string;
  childEnv: NodeJS.ProcessEnv & {
    SSH_AUTH_SOCK: string;
  };
  knownHostsFile?: string;
  log: Console;
};