// src/api.js
const BASE_URL = "http://localhost:3000";
console.log("API base URL:", BASE_URL);
export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BASE_URL}/documents`, {
    method: "POST",
    body: formData,
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

export async function getConversations(documentId) {
  const res = await fetch(`${BASE_URL}/documents/${documentId}/conversations`);
  if (!res.ok) throw new Error("Failed to load conversation history.");
  return res.json();
}

export async function askQuestion(documentId, question) {
  const res = await fetch(`${BASE_URL}/documents/${documentId}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Could not get an answer.");
  }
  return res.json();
}
