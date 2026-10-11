const express = require("express");
const config = require("./config");

const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Accept");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.get("/api/health", (req, res) => {
  res.json({ service: "notification-service", status: "ok" });
});

function startServer() {
  return new Promise((resolve) => {
    app.listen(config.port, () => {
      console.log(`Health endpoint running on port ${config.port}`);
      resolve();
    });
  });
}

module.exports = { startServer };
