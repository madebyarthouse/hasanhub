export const chunkAndMergePromises = async <T>(
  promises: Promise<T>[],
  chunkSize: number
): Promise<T[]> => {
  const results: T[] = [];

  for (let i = 0; i < promises.length; i += chunkSize) {
    const chunk = promises.slice(i, i + chunkSize);
    const chunkResults = await Promise.allSettled(chunk);
    chunkResults.forEach((result) => {
      if (result.status === "fulfilled") {
        results.push(result.value);
      } else {
        console.log(result.reason);
      }
    });
  }

  return results;
};

const DEFAULT_D1_MAX_PARAMS = 100;

export const chunkByParams = <T extends Record<string, unknown>>(
  rows: T[],
  maxParams = DEFAULT_D1_MAX_PARAMS
): T[][] => {
  if (rows.length === 0) return [];

  const columns = Object.keys(rows[0]).length;
  const paramsPerRow = Math.max(1, columns);
  const maxRows = Math.max(1, Math.floor(maxParams / paramsPerRow));

  const chunks: T[][] = [];
  for (let i = 0; i < rows.length; i += maxRows) {
    chunks.push(rows.slice(i, i + maxRows));
  }

  return chunks;
};
