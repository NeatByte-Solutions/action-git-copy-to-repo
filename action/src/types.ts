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
  TARGET_BASE_BRANCH?: string;
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

export type RepoData = {
  sshRepo?: string;
  sshPrivateKey?: string;
  githubRepo?: string;
  githubToken?: string;
  branch?: string;
  baseBranch?: string;
};

export type ConfigType = {
  src: RepoData;
  target: RepoData;
  commit: {
    message?: string;
    author?: string;
    authorEmail?: string;
  };
  knownHostsFile?: string;
};

export type ExecOpts = {
  env?: any;
  cwd?: string;
  log: Console;
};

export type Context = {
  log: Console;
  config?: ConfigType;
  temp: {
    srcTempFolder?: string;
    targetTempFolder?: string;
    srcTempRepo?: string;
    targetTempRepo?: string;
    srcSSHAuthSock?: string;
    targetSSHAuthSock?: string;
  };
  exec: {
    srcExecOpt: ExecOpts;
    targetExecOpt: ExecOpts;
  };
};
