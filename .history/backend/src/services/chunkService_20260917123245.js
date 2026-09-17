// src/services/chunkService.js
import db from "../db/db.js";
import { embedText } from "./embeddingService.js";
import { cosineSimilarity } from "../utils/cosineSimilarity.js";

function getChunksByDocumentId(documentId) {
  return db
    .prepare(
      `
    SELECT id, chunk_index, content, embedding
    FROM chunks
    WHERE document_id = ?
  `,
    )
    .all(documentId);
}

// The core of retrieval: embed the question, compare it against every
// stored chunk for this document, return the top-k most similar chunks'
// text, joined together as the "document text" to inject into the prompt.
export async function findRelevantChunks(documentId, question, topK = 4) {
  const questionVector = await embedText(question);
  const chunks = getChunksByDocumentId(documentId);

  const scored = chunks.map((chunk) => ({
    content: chunk.content,
    score: cosineSimilarity(
      questionVector,
      JSON.parse(chunk.embedding)
    ),
  }));

  scored.sort((a, b) => b.score - a.score);

  const topChunks = scored.slice(0, topK);

  console.log(
    `Retrieved ${topChunks.length} chunks for document ${documentId}, ` +
      `top score: ${topChunks[0]?.score.toFixed(3)}`,
  );

  topChunks.forEach((chunk, index) => {
    console.log(`\n--- Retrieved chunk ${index + 1} ---`);
    console.log(`Score: ${chunk.score.toFixed(4)}`);
    console.log(chunk.content);
  });

  return topChunks.map((c) => c.content).join("\n\n---\n\n");
}