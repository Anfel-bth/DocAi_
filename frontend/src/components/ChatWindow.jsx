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

    // Show the question immediately for responsiveness, before the
    // answer comes back.
    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [...prev, { id: tempId, question, answer: "..." }]);

    try {
      const result = await askQuestion(documentId, question);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId ? { ...m, answer: result.answer } : m,
        ),
      );
    } catch (err) {
      setError(err.message);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setAsking(false);
    }
  }

  if (!documentId) {
    return (
      <p style={{ color: "#777" }}>
        Select a document to start asking questions.
      </p>
    );
  }

  return (
    <div>
      <MessageList messages={messages} />
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      <MessageInput onSend={handleSend} disabled={asking} />
    </div>
  );
}
