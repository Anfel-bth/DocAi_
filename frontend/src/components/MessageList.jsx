// src/components/MessageList.jsx
export default function MessageList({ messages }) {
  if (messages.length === 0) {
    return <p style={{ color: "#777" }}>No questions asked yet.</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {messages.map((m) => (
        <div key={m.id}>
          <div style={{ fontWeight: "bold" }}>You: {m.question}</div>
          <div style={{ marginTop: "0.25rem" }}>Assistant: {m.answer}</div>
        </div>
      ))}
    </div>
  );
}
