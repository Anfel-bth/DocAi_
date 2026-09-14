// src/routes/documents.js
// Routes only wire a URL+method to a controller function. No logic here.
import { Router } from "express";
import upload from "../middleware/upload.js";
import {
  uploadDocument,
  listDocuments,
} from "../controllers/documentController.js";

const router = Router();

router.post("/documents", upload.single("file"), uploadDocument);
router.get("/documents", listDocuments);

export default router;
