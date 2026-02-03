export const toIsoStringOrNull = (value: Date | null | undefined) => {
  if (!(value instanceof Date)) return null;
  const time = value.getTime();
  return Number.isNaN(time) ? null : value.toISOString();
};
