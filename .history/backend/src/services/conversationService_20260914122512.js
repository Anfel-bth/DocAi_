// src/services/documentService.js
import fs from "fs";
import path from "path";
import { createRequire } from "module";
import db from "../db/db.js";
import { PDFParse } from "pdf-parse";
import { truncateForContext } from "../utils/truncateForContext.js";

// pdf-parse is a CommonJS package. Node's ESM loader can be unreliable at
// auto-detecting its default export, so we load it with createRequire
// instead of a plain `import` -- this is the standard, robust fix for
// this exact issue.
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

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

  // Delete conversation history first (the FK points at documents,
  // so children go before the parent).
  db.prepare("DELETE FROM conversations WHERE document_id = ?").run(id);
  db.prepare("DELETE FROM documents WHERE id = ?").run(id);

  // Best-effort cleanup of the actual uploaded file on disk.
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
    const data = await pdfParse(buffer);
    if (!data.text || data.text.trim().length === 0) {
      throw new Error(
        "No extractable text found -- this PDF may be a scanned image.",
      );
    }
    return data.text;
  }

  throw new Error(`Unsupported file type: ${ext}`);
}

export async function extractAndStoreText(documentId, filePath) {
  updateDocumentStatus(documentId, "Processing");

  try {
    const rawText = await extractRawText(filePath);
    const { text } = truncateForContext(rawText);

    db.prepare(
      `
      UPDATE documents SET extracted_text = ?, status = 'Completed' WHERE id = ?
    `,
    ).run(text, documentId);

    return getDocumentById(documentId);
  } catch (err) {
    updateDocumentStatus(documentId, "Failed", err.message);
    throw err;
  }
}
