import { Context, Console } from './types';

export const createContext = async (log: Console): Promise<Context> => {
  const context = {
    log,
    temp: {},
    exec: {
      srcExecOpt: { log, env: process.env },
      targetExecOpt: { log, env: process.env },
    },
  };

  return context;
};
