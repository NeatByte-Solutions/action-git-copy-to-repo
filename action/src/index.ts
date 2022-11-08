export type Console = {
  readonly log: (...msg: unknown[]) => void;
  readonly error: (...msg: unknown[]) => void;
  readonly warn: (...msg: unknown[]) => void;
};

export interface EnvironmentVariables {
  SRC_REPO?: any;
  TARGET_REPO?: any;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends EnvironmentVariables {}
  }
}

export const main = async ({
  env = process.env,
  log,
}: {
  env?: EnvironmentVariables;
  log: Console;
}) => {
  log.log(`env`, env);
};
