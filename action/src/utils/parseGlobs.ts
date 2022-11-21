export const parseGlobs = (configStr: string, defaultGlobs: string[]) => {
  const globList = configStr
    .toString()
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s !== '');

  return [...globList, ...defaultGlobs];
};
