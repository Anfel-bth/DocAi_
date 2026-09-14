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
      style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}
    >
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ask a question about this document..."
        disabled={disabled}
        style={{ flex: 1, padding: "0.5rem" }}
      />
      <button type="submit" disabled={disabled}>
        {disabled ? "Thinking..." : "Send"}
      </button>
    </form>
  );
}
