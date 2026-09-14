
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
  return db
    .prepare("SELECT * FROM documents WHERE id = ?")
    .get(id);
}

export function getAllDocuments() {
  return db
    .prepare("SELECT * FROM documents ORDER BY uploaded_at DESC")
    .all();
}

export function updateDocumentStatus(
  id,
  status,
  errorMessage = null
) {
  db.prepare(`
    UPDATE documents
    SET status = ?, error_message = ?
    WHERE id = ?
  `).run(status, errorMessage, id);

  return getDocumentById(id);
}

export function deleteDocument(id) {
  const document = getDocumentById(id);

  if (!document) {
    return false;
  }

  // Delete conversation history first
  // because conversations reference documents.
  db.prepare(
    "DELETE FROM conversations WHERE document_id = ?"
  ).run(id);

  // Delete the document from the database.
  db.prepare(
    "DELETE FROM documents WHERE id = ?"
  ).run(id);

  // Delete the actual uploaded file from disk.
  if (
    document.file_path &&
    fs.existsSync(document.file_path)
  ) {
    fs.unlinkSync(document.file_path);
  }

  return true;
}

async function extractRawText(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  // TXT
  if (ext === ".txt") {
    return fs.readFileSync(filePath, "utf-8");
  }

  // PDF
  if (ext === ".pdf") {
    const buffer = fs.readFileSync(filePath);

    const parser = new PDFParse({
      data: buffer,
    });

    try {
      const result = await parser.getText();

      if (
        !result.text ||
        result.text.trim().length === 0
      ) {
        throw new Error(
          "No extractable text found -- this PDF may be a scanned image."
        );
      }

      return result.text;
    } finally {
      await parser.destroy();
    }
  }

  throw new Error(`Unsupported file type: ${ext}`);
}

export async function extractAndStoreText(
  documentId,
  filePath
) {
  updateDocumentStatus(
    documentId,
    "Processing"
  );

  try {
    // Extract text from the document
    const rawText = await extractRawText(filePath);

    // Limit text before sending it to the AI
    const { text } = truncateForContext(rawText);

    // Save extracted text
    db.prepare(`
      UPDATE documents
      SET extracted_text = ?, status = 'Completed'
      WHERE id = ?
    `).run(text, documentId);

    return getDocumentById(documentId);
  } catch (err) {
    // Save error if extraction fails
    updateDocumentStatus(
      documentId,
      "Failed",
      err.message
    );

    throw err;
  }
}
