// src/controllers/documentController.js
import {
  createDocument,
  getAllDocuments,
  getDocumentById,
  extractAndStoreText,
  deleteDocument
} from "../services/documentService.js";
import { streamQuestion } from "../services/llmService.js";
import { findRelevantChunks } from "../services/chunkService.js";
import { addConversation, getConversationsByDocumentId } from "../services/conversationService.js";

export function uploadDocument(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  const document = createDocument({
    name: req.file.originalname,
    filePath: req.file.path
  });

  extractAndStoreText(document.id, req.file.path).catch((err) => {
    console.error(`Extraction failed for document ${document.id}:`, err.message);
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

  let hasStartedStreaming = false;

  try {
    const relevantText = await findRelevantChunks(document.id, question);

    // Set up the response as a plain streaming body BEFORE we start
    // receiving tokens -- Node only actually sends these headers once we
    // call res.write() for the first time, so if something fails before
    // that first write, we can still send a normal JSON error response.
    res.setHeader("Content-Type", "text/plain; charset=utf-8");

    const fullAnswer = await streamQuestion(relevantText, question, (token) => {
      hasStartedStreaming = true;
      res.write(token);
    });

    addConversation(document.id, question, fullAnswer);
    res.end();
  } catch (err) {
    console.error("LLM request failed:", err.message);

    if (hasStartedStreaming) {
      // Headers are already sent and we're mid-stream -- we can't change
      // the status code anymore, so append a visible error marker and
      // close the stream instead of silently cutting off.
      res.write(`\n\n[Error: ${err.message}]`);
      res.end();
    } else {
      res.status(502).json({ error: "Could not reach the LLM server." });
    }
  }
}

export function listConversations(req, res) {
  const { id } = req.params;
  res.json(getConversationsByDocumentId(id));
}