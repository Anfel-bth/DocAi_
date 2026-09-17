import db from "./src/db/db.js";

const documentId = 9;

const chunks = db
  .prepare(`
    SELECT chunk_index, content
    FROM chunks
    WHERE document_id = ?
    AND content LIKE ?
  `)
  .all(documentId, "%September 2024%");

console.log(`Found ${chunks.length} matching chunk(s).`);

for (const chunk of chunks) {
  console.log("\n--- Chunk", chunk.chunk_index, "---");
  console.log(chunk.content);
}