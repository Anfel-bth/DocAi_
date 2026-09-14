// src/services/conversationService.js
import db from "../db/db.js";

export function addConversation(documentId, question, answer) {
  db.prepare(
    `
    INSERT INTO conversations (document_id, question, answer)
    VALUES (?, ?, ?)
  `,
  ).run(documentId, question, answer);
}

export function getConversationsByDocumentId(documentId) {
  return db
    .prepare(
      `
    SELECT id, question, answer, created_at
    FROM conversations
    WHERE document_id = ?
    ORDER BY created_at ASC
  `,
    )
    .all(documentId);
}

export function deleteConversationsByDocumentId(documentId) {
  db.prepare("DELETE FROM conversations WHERE document_id = ?").run(
    documentId,
  );
}

export function deleteConversation(documentId, conversationId) {
  const result = db
    .prepare(
      "DELETE FROM conversations WHERE id = ? AND document_id = ?",
    )
    .run(conversationId, documentId);
  return result.changes > 0;
}
