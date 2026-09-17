// src/components/ChatWindow.jsx
import { useEffect, useState } from "react";
import { getConversations, askQuestion } from "../api";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

export default function ChatWindow({ documentId }) {
  const [messages, setMessages] = useState([]);
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!documentId) return;
    getConversations(documentId)
      .then(setMessages)
      .catch((err) => setError(err.message));
  }, [documentId]);

  async function handleSend(question) {
    setAsking(true);
    setError(null);

    const tempId = `temp-${Date.now()}`;
    // Start with an empty answer -- tokens will fill it in live.
    setMessages((prev) => [...prev, { id: tempId, question, answer: "" }]);

    function appendToken(token) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId ? { ...m, answer: m.answer + token } : m,
        ),
      );
    }

    try {
      await askQuestion(documentId, question, appendToken);
    } catch (err) {
      setError(err.message);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setAsking(false);
    }
  }

  if (!documentId) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-secondary)",
        }}
      >
        <p>Select or upload a document to start asking questions.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        maxWidth: 760,
        margin: "0 auto",
        width: "100%",
        padding: "0 24px",
      }}
    >
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          paddingTop: 32,
          paddingBottom: 16,
        }}
      >
        <MessageList messages={messages} />
        {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
      </div>
      <div style={{ paddingBottom: 24 }}>
        <MessageInput onSend={handleSend} disabled={asking} />
      </div>
    </div>
  );
}
