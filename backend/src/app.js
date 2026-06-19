const express = require("express");
const cors = require("cors");

function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (req, res) => res.json({ ok: true }));

  app.use("/api/auth", require("./routes/auth"));
  app.use("/api/events", require("./routes/events"));
  app.use("/api/reserve", require("./routes/reserve"));
  app.use("/api/bookings", require("./routes/bookings"));

  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}

module.exports = { createApp };
