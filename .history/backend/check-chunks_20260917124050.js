import db from "./src/db/db.js";

const documentId = 9;

const chunks = db
  .prepare(
    `
    SELECT chunk_index, content
    FROM chunks
    WHERE document_id = ?
    ORDER BY chunk_index
  `,
  )
  .all(documentId);

console.log(`Found ${chunks.length} chunks.`);

for (const chunk of chunks) {
  console.log(`\n========== CHUNK ${chunk.chunk_index} ==========`);

  if (
    chunk.content.toLowerCase().includes("september") ||
    chunk.content.includes("2024")
  ) {
    console.log(">>> POSSIBLE MATCH <<<");
  }

  console.log(chunk.content);
}
