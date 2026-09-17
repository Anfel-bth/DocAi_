import db from "./src/db/db.js";

const documentId = 9;

const document = db
  .prepare(
    `
    SELECT id, name, status, length(extracted_text) AS text_length
    FROM documents
    WHERE id = ?
  `,
  )
  .get(documentId);

console.log(document);
