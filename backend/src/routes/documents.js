// src/routes/documents.js
import { Router } from "express";
import upload from "../middleware/upload.js";
import {
  uploadDocument,
  listDocuments,
  askQuestionAboutDocument,
  listConversations,
  clearConversationsHandler,
  deleteConversationHandler,
  deleteDocumentHandler,
} from "../controllers/documentController.js";

const router = Router();

router.post("/documents", upload.single("file"), uploadDocument);
router.get("/documents", listDocuments);
router.delete("/documents/:id", deleteDocumentHandler);
router.post("/documents/:id/ask", askQuestionAboutDocument);
router.get("/documents/:id/conversations", listConversations);
router.delete("/documents/:id/conversations/:conversationId", deleteConversationHandler);
router.delete("/documents/:id/conversations", clearConversationsHandler);

export default router;
