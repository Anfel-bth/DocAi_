// src/components/MessageList.jsx
export default function MessageList({ messages, onDelete }) {
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
        <div key={m.id} className="message-turn">
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "flex-start",
              gap: 8,
            }}
          >
            {!m.streaming && onDelete && (
              <button
                type="button"
                className="message-delete"
                aria-label="Delete this message"
                onClick={() => onDelete(m.id)}
                style={{
                  background: "none",
                  border: "none",
                  padding: 4,
                  borderRadius: 6,
                  color: "var(--text-secondary)",
                  marginTop: 6,
                }}
              >
                <TrashIcon />
              </button>
            )}
            <div
              style={{
                background: "var(--bg-hover)",
                borderRadius:
                  "var(--radius-lg) var(--radius-lg) 4px var(--radius-lg)",
                padding: "10px 14px",
                maxWidth: "75%",
                width: "fit-content",
                fontSize: "0.92rem",
              }}
            >
              {m.question}
            </div>
          </div>
          <div
            className={m.streaming ? "streaming-cursor" : undefined}
            style={{
              background: "transparent",
              padding: "10px 2px",
              maxWidth: "85%",
              fontSize: "0.92rem",
              lineHeight: 1.55,
              color: "var(--text-primary)",
              whiteSpace: "pre-wrap",
            }}
          >
            {m.streaming && !m.answer ? "Thinking…" : m.answer}
          </div>
        </div>
      ))}
    </div>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path
        d="M3 4.5h10M6.5 4.5V3a1 1 0 011-1h1a1 1 0 011 1v1.5M4.5 4.5l.5 8a1 1 0 001 1h4a1 1 0 001-1l.5-8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
