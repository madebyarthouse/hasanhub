export const debug = (message: any) => {
  const mode =
    typeof import.meta !== "undefined" && import.meta.env
      ? import.meta.env.MODE
      : "production";
  if (mode === "development") {
    console.log(message);
  }
};
