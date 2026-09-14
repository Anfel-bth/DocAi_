// src/api.js

const BASE_URL = import.meta.env.VITE_API_URL;

console.log("VITE_API_URL =", BASE_URL);

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

  if (!res.ok) {
    throw new Error("Failed to load documents.");
  }

  return res.json();
}

export async function deleteDocument(documentId) {
  const res = await fetch(`${BASE_URL}/documents/${documentId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete document.");
  }
}

export async function getConversations(documentId) {
  const res = await fetch(`${BASE_URL}/documents/${documentId}/conversations`);

  if (!res.ok) {
    throw new Error("Failed to load conversation history.");
  }

  return res.json();
}

export async function clearConversations(documentId) {
  const res = await fetch(`${BASE_URL}/documents/${documentId}/conversations`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to clear chat.");
  }
}

export async function deleteConversation(documentId, conversationId) {
  const res = await fetch(
    `${BASE_URL}/documents/${documentId}/conversations/${conversationId}`,
    { method: "DELETE" },
  );

  if (!res.ok) {
    throw new Error("Failed to delete message.");
  }
}

export async function askQuestionStream(documentId, question, onToken) {
  const res = await fetch(`${BASE_URL}/documents/${documentId}/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Could not get an answer.");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let answer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";

    for (const event of events) {
      const line = event.split("\n").find((l) => l.startsWith("data:"));
      if (!line) continue;

      const payload = JSON.parse(line.slice(5).trim());
      if (payload.error) {
        throw new Error(payload.error);
      }
      if (payload.token) {
        answer += payload.token;
        onToken(answer);
      }
    }
  }

  if (!answer) {
    throw new Error("Could not get an answer.");
  }

  return answer;
}
