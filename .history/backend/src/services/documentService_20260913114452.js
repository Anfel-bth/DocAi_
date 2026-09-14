// src/services/documentService.js
// Business logic only -- no req/res here. This is what makes it
// independently testable (see Phase 12).
import db from "../db/db.js";

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
