export const API_BASE =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : import.meta.env.BASE_URL.replace(/\/$/, "");
