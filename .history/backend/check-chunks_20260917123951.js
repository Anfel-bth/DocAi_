import db from "./src/db/db.js";

const documentId = 9;

const result = db
  .prepare(
    `
    SELECT COUNT(*) AS count
    FROM chunks
    WHERE document_id = ?
  `,
  )
  .get(documentId);

console.log(`Document ${documentId} has ${result.count} chunks.`);
