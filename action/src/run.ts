import { main } from './';

main(
  process.env,
  console,
).catch((err) => {
  console.error(err);
  process.exit(1);
});
