import app from "./app";

const PORT = process.env.PORT || 3000;

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down...");
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});