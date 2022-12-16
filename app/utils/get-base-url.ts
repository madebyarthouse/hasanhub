export const getBaseUrl = () => {
  return typeof process !== "undefined"
    ? process.env.VERCEL_URL || "http://localhost:3000"
    : "";
};
