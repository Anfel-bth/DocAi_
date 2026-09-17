// src/controllers/documentController.js
import {
  createDocument,
  getAllDocuments,
  getDocumentById,
  extractAndStoreText,
  deleteDocument,
} from "../services/documentService.js";
import { askQuestion } from "../services/llmService.js";
import { findRelevantChunks } from "../services/chunkService.js";
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

export function deleteDocumentHandler(req, res) {
  const { id } = req.params;
  const document = getDocumentById(id);

  if (!document) {
    return res.status(404).json({ error: "Document not found." });
  }

  deleteDocument(id);
  res.status(204).send();
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
    // RAG: retrieve only the chunks relevant to this specific question,
    // instead of sending the whole (truncated) document every time.
    const relevantText = await findRelevantChunks(document.id, question);
    const answer = await askQuestion(relevantText, question);
    addConversation(document.id, question, answer);
    res.json({ question, answer });
  } catch (err) {
    console.error("LLM request failed:", err.message);
    res.status(502).json({ error: "Could not reach the LLM server." });
  }
}

export function listConversations(req, res) {
  const { id } = req.params;
  res.json(getConversationsByDocumentId(id));
}
