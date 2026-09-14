// src/services/llmService.js
// Talks to llama-server. No req/res here -- just "given document text and
// a question, return the model's answer as a string."

const LLAMA_URL = process.env.LLAMA_SERVER_URL;

function buildMessages(documentText, question) {
  return [
    {
      role: "system",
      content:
        "You are a document assistant. You must answer the user's question " +
        "using ONLY the information in the document text provided below. " +
        "If the answer is not present in the document, respond exactly with: " +
        '"I don\'t know based on the provided document." Do not use outside knowledge. ' +
        "Be concise and cite the relevant part of the document when possible.\n\n" +
        `DOCUMENT:\n"""\n${documentText}\n"""`,
    },
    {
      role: "user",
      content: question,
    },
  ];
}

export async function askQuestion(documentText, question) {
  const response = await fetch(LLAMA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "mistral",
      messages: buildMessages(documentText, question),
      temperature: 0.2,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    throw new Error(`LLM server responded with status ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
