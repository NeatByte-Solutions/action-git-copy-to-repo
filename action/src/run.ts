import { main, targetRepoRevert } from './';

const run = process.env.TARGET_REPO_REVERT ? targetRepoRevert : main;

run(process.env, console).catch((err) => {
  console.error(err);
  process.exit(1);
});
