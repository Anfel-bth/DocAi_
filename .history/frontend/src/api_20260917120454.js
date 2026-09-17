// src/api.js
const BASE_URL = import.meta.env.VITE_API_URL;

export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BASE_URL}/documents`, {
    method: "POST",
    body: formData
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Upload failed.");
  }
  return res.json();
}

export async function getDocuments() {
  const res = await fetch(`${BASE_URL}/documents`);
  if (!res.ok) throw new Error("Failed to load documents.");
  return res.json();
}

export async function deleteDocument(documentId) {
  const res = await fetch(`${BASE_URL}/documents/${documentId}`, {
    method: "DELETE"
  });
  if (!res.ok) throw new Error("Failed to delete document.");
}

export async function getConversations(documentId) {
  const res = await fetch(`${BASE_URL}/documents/${documentId}/conversations`);
  if (!res.ok) throw new Error("Failed to load conversation history.");
  return res.json();
}

export async function askQuestion(documentId, question, onToken) {
  const res = await fetch(`${BASE_URL}/documents/${documentId}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Could not get an answer.");
  }

  // The backend now streams plain text chunks instead of one JSON blob --
  // read the body as a stream and call onToken as each piece arrives.
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let fullAnswer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    fullAnswer += chunk;
    onToken(chunk);
  }

  return fullAnswer;
}