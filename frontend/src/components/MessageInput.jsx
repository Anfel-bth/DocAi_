// src/components/MessageInput.jsx
import { useState } from "react";

export default function MessageInput({ onSend, disabled }) {
  const [text, setText] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text);
    setText("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "6px 6px 6px 16px",
        background: "#fff",
      }}
    >
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ask a question about this document..."
        disabled={disabled}
        style={{
          flex: 1,
          border: "none",
          outline: "none",
          fontSize: "0.92rem",
          fontFamily: "var(--font-body)",
          background: "transparent",
          padding: "8px 0",
        }}
      />
      <button
        type="submit"
        disabled={disabled}
        style={{
          background: "var(--accent)",
          border: "none",
          borderRadius: "var(--radius-md)",
          padding: "9px 16px",
          fontWeight: 600,
          fontSize: "0.85rem",
          color: "var(--text-primary)",
          opacity: disabled ? 0.6 : 1,
        }}
      >
        {disabled ? "Thinking..." : "Send"}
      </button>
    </form>
  );
}
