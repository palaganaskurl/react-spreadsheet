export const getOperationCount = (s: string) => {
  const regex = /[+-]/g;
  const found = s.match(regex);

  return found?.length || 0;
};
