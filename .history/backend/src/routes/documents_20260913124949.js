// src/routes/documents.js
import { Router } from "express";
import upload from "../middleware/upload.js";
import {
  uploadDocument,
  listDocuments,
  askQuestionAboutDocument,
  listConversations,
} from "../controllers/documentController.js";

const router = Router();

router.post("/documents", upload.single("file"), uploadDocument);
router.get("/documents", listDocuments);
router.post("/documents/:id/ask", askQuestionAboutDocument);
router.get("/documents/:id/conversations", listConversations);

export default router;
