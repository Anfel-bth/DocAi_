// src/components/MessageList.jsx
export default function MessageList({ messages }) {
  if (messages.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          marginTop: "3rem",
          color: "var(--text-secondary)",
        }}
      >
        <p style={{ fontSize: "0.95rem" }}>Ask anything about this document.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {messages.map((m) => (
        <div key={m.id}>
          <div
            style={{
              alignSelf: "flex-end",
              background: "var(--bg-hover)",
              borderRadius:
                "var(--radius-lg) var(--radius-lg) 4px var(--radius-lg)",
              padding: "10px 14px",
              marginLeft: "auto",
              maxWidth: "75%",
              width: "fit-content",
              fontSize: "0.92rem",
            }}
          >
            {m.question}
          </div>
          <div
            style={{
              background: "transparent",
              padding: "10px 2px",
              maxWidth: "85%",
              fontSize: "0.92rem",
              lineHeight: 1.55,
              color: "var(--text-primary)",
            }}
          >
            {m.answer}
          </div>
        </div>
      ))}
    </div>
  );
}
