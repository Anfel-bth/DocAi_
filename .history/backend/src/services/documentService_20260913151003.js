// src/services/documentService.js
import fs from "fs";
import path from "path";
import { PDFParse } from "pdf-parse";
import db from "../db/db.js";
import { truncateForContext } from "../utils/truncateForContext.js";

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
