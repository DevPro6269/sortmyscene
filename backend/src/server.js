require("dotenv").config();

for (const key of ["MONGO_URI", "JWT_SECRET"]) {
  if (!process.env[key]) {
    console.error(`Missing required env var: ${key}`);
    process.exit(1);
  }
}

const { createApp } = require("./app");
const { connectDB } = require("./config/db");
const { startSweeper } = require("./jobs/sweeper");

async function main() {
  await connectDB(process.env.MONGO_URI);
  startSweeper();
  const app = createApp();
  const port = process.env.PORT || 4000;
  app.listen(port, () => console.log(`API listening on :${port}`));
}

main().catch((e) => {
  console.error("Failed to start", e);
  process.exit(1);
});
