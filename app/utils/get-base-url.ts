export const getBaseUrl = () => {
  console.log(
    typeof process !== "undefined"
      ? process.env.VERCEL_URL || "http://localhost:3000"
      : ""
  );
  return typeof process !== "undefined"
    ? process.env.VERCEL_URL || "http://localhost:3000"
    : "";
};
