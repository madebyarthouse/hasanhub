export const summarizeItems = <T, U>(
  items: T[],
  map: (item: T) => U,
  limit = 20
) => ({
  count: items.length,
  sample: items.slice(0, limit).map(map),
  truncated: items.length > limit,
});
