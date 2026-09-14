// src/components/ChatWindow.jsx
import { useEffect, useState } from "react";
import {
  getConversations,
  askQuestionStream,
  clearConversations,
  deleteConversation,
  deleteDocument,
} from "../api";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

export default function ChatWindow({ documentId, onDocumentDeleted }) {
  const [messages, setMessages] = useState([]);
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!documentId) return;
    setError(null);
    getConversations(documentId)
      .then(setMessages)
      .catch((err) => setError(err.message));
  }, [documentId]);

  async function handleSend(question) {
    setAsking(true);
    setError(null);

    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: tempId, question, answer: "", streaming: true },
    ]);

    try {
      const answer = await askQuestionStream(documentId, question, (partial) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId ? { ...m, answer: partial } : m,
          ),
        );
      });

      try {
        setMessages(await getConversations(documentId));
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId ? { ...m, answer, streaming: false } : m,
          ),
        );
      }
    } catch (err) {
      setError(err.message);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setAsking(false);
    }
  }

  async function handleDeleteDocument() {
    if (
      !window.confirm(
        "Delete this document, its file, and all chat history?",
      )
    ) {
      return;
    }
    try {
      await deleteDocument(documentId);
      onDocumentDeleted?.();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleClearChat() {
    if (!window.confirm("Delete this chat history? The document will be kept.")) {
      return;
    }
    try {
      await clearConversations(documentId);
      setMessages([]);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteMessage(conversationId) {
    try {
      await deleteConversation(documentId, conversationId);
      setMessages((prev) => prev.filter((m) => m.id !== conversationId));
    } catch (err) {
      setError(err.message);
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
          display: "flex",
          justifyContent: "flex-end",
          gap: 8,
          paddingTop: 16,
        }}
      >
        <button
          type="button"
          onClick={handleClearChat}
          disabled={asking || messages.length === 0}
          style={{
            background: "none",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: "6px 12px",
            fontSize: "0.8rem",
            color: "var(--text-secondary)",
            opacity: asking || messages.length === 0 ? 0.45 : 1,
          }}
        >
          Delete chat
        </button>
        <button
          type="button"
          onClick={handleDeleteDocument}
          disabled={asking}
          style={{
            background: "none",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: "6px 12px",
            fontSize: "0.8rem",
            color: "var(--danger)",
            opacity: asking ? 0.45 : 1,
          }}
        >
          Delete document
        </button>
      </div>
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          paddingTop: 16,
          paddingBottom: 16,
        }}
      >
        <MessageList messages={messages} onDelete={handleDeleteMessage} />
        {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
      </div>
      <div style={{ paddingBottom: 24 }}>
        <MessageInput onSend={handleSend} disabled={asking} />
      </div>
    </div>
  );
}
