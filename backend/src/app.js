// src/app.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from "fs";
import healthRoute from "./routes/health.js";
import documentsRoute from "./routes/documents.js";

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const app = express();

app.use(cors()); // allows requests from your React dev server (different port)
app.use(express.json());
app.use(healthRoute);
app.use(documentsRoute);

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(400).json({ error: err.message || "Something went wrong." });
});

export default app;
