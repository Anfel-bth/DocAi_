// src/controllers/documentController.js
import {
  createDocument,
  getAllDocuments,
  getDocumentById,
  extractAndStoreText,
  deleteDocument,
} from "../services/documentService.js";
import { askQuestion } from "../services/llmService.js";
import {
  addConversation,
  getConversationsByDocumentId,
} from "../services/conversationService.js";

export function uploadDocument(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  const document = createDocument({
    name: req.file.originalname,
    filePath: req.file.path,
  });

  // Extraction runs right after upload, in the same request, for the MVP.
  // We don't await-block the response on it failing silently -- errors are
  // caught and stored as status = 'Failed' inside extractAndStoreText.
  extractAndStoreText(document.id, req.file.path).catch((err) => {
    console.error(
      `Extraction failed for document ${document.id}:`,
      err.message,
    );
  });

  res.status(201).json(document);
}

export function listDocuments(req, res) {
  res.json(getAllDocuments());
}

export async function askQuestionAboutDocument(req, res) {
  const { id } = req.params;
  const { question } = req.body;

  if (!question || typeof question !== "string" || question.trim() === "") {
    return res.status(400).json({ error: "Question is required." });
  }

  const document = getDocumentById(id);
  if (!document) {
    return res.status(404).json({ error: "Document not found." });
  }

  if (document.status !== "Completed") {
    return res.status(409).json({ error: "Document is still processing." });
  }

  try {
    const answer = await askQuestion(document.extracted_text, question);
    addConversation(document.id, question, answer);
    res.json({ question, answer });
  } catch (err) {
    console.error("LLM request failed:", err.message);
    res.status(502).json({ error: "Could not reach the LLM server." });
  }
}

export function deleteDocumentHandler(req, res) {
  const { id } = req.params;
  const document = getDocumentById(id);

  if (!document) {
    return res.status(404).json({ error: "Document not found." });
  }

  deleteDocument(id);
  res.status(204).send();
}

export function listConversations(req, res) {
  const { id } = req.params;
  res.json(getConversationsByDocumentId(id));
}
