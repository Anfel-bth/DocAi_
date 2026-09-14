// src/routes/health.js
// Exercise 1: a minimal route to confirm the server is alive at all.
import { Router } from "express";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

export default router;
