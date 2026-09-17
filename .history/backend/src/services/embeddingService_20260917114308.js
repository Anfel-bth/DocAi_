// src/services/embeddingService.js
// Talks to the embedding llama-server (port 8081). Same shape as
// llmService.js, different job: turns text into a vector, not an answer.

const EMBEDDING_URL = process.env.EMBEDDING_SERVER_URL;

export async function embedText(text) {
  const response = await fetch(EMBEDDING_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "nomic-embed-text",
      input: text,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Embedding server responded with status ${response.status}`,
    );
  }

  const data = await response.json();
  // OpenAI-compatible embeddings response shape:
  // { data: [ { embedding: [0.01, -0.02, ...] } ] }
  return data.data[0].embedding;
}
