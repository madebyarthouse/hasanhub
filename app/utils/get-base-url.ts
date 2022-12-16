export const getBaseUrl = () => {
  return typeof process !== "undefined"
    ? `https://${process.env.VERCEL_URL}` || "http://localhost:3000"
    : "";
};
