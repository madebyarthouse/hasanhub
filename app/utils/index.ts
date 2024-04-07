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
