// src/services/documentService.js
import fs from "fs";
import path from "path";
import { PDFParse } from "pdf-parse";
import db from "../db/db.js";
import { truncateForContext } from "../utils/truncateForContext.js";
import { chunkText } from "../utils/chunkText.js";
import { embedText } from "./embeddingService.js";

export function createDocument({ name, filePath }) {
  const stmt = db.prepare(`
    INSERT INTO documents (name, file_path, status)
    VALUES (?, ?, 'Pending')
  `);
  const result = stmt.run(name, filePath);
  return getDocumentById(result.lastInsertRowid);
}

export function getDocumentById(id) {
  return db.prepare("SELECT * FROM documents WHERE id = ?").get(id);
}

export function getAllDocuments() {
  return db.prepare("SELECT * FROM documents ORDER BY uploaded_at DESC").all();
}

export function updateDocumentStatus(id, status, errorMessage = null) {
  db.prepare(
    `
    UPDATE documents SET status = ?, error_message = ? WHERE id = ?
  `,
  ).run(status, errorMessage, id);
  return getDocumentById(id);
}

export function deleteDocument(id) {
  const document = getDocumentById(id);
  if (!document) return false;

  db.prepare("DELETE FROM chunks WHERE document_id = ?").run(id);
  db.prepare("DELETE FROM conversations WHERE document_id = ?").run(id);
  db.prepare("DELETE FROM documents WHERE id = ?").run(id);

  if (document.file_path && fs.existsSync(document.file_path)) {
    fs.unlinkSync(document.file_path);
  }

  return true;
}

async function extractRawText(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".txt") {
    return fs.readFileSync(filePath, "utf-8");
  }

  if (ext === ".pdf") {
    const buffer = fs.readFileSync(filePath);
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();

    if (!result.text || result.text.trim().length === 0) {
      throw new Error(
        "No extractable text found -- this PDF may be a scanned image.",
      );
    }
    return result.text;
  }

  throw new Error(`Unsupported file type: ${ext}`);
}

async function chunkAndEmbedDocument(documentId, rawText) {
  const chunks = chunkText(rawText, 500, 50);

  for (let i = 0; i < chunks.length; i++) {
    const embedding = await embedText(chunks[i]);
    db.prepare(
      `
      INSERT INTO chunks (document_id, chunk_index, content, embedding)
      VALUES (?, ?, ?, ?)
    `,
    ).run(documentId, i, chunks[i], JSON.stringify(embedding));
  }

  return chunks.length;
}

export async function extractAndStoreText(documentId, filePath) {
  updateDocumentStatus(documentId, "Processing");

  try {
    const rawText = await extractRawText(filePath);

    const { text: previewText } = truncateForContext(rawText);

    db.prepare(
      `
      UPDATE documents SET extracted_text = ? WHERE id = ?
    `,
    ).run(previewText, documentId);

    const chunkCount = await chunkAndEmbedDocument(documentId, rawText);
    console.log(`Document ${documentId}: created ${chunkCount} chunks`);

    updateDocumentStatus(documentId, "Completed");
    return getDocumentById(documentId);
  } catch (err) {
    updateDocumentStatus(documentId, "Failed", err.message);
    throw err;
  }
}
