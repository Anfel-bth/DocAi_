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
