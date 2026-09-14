// src/components/DocumentList.jsx
import { useEffect, useState, useCallback } from "react";
import { getDocuments } from "../api";

const STATUS_COLORS = {
  Pending: "#999",
  Processing: "#d9a441",
  Completed: "#2e8b57",
  Failed: "#c0392b",
};

export default function DocumentList({ selectedId, onSelect, refreshKey }) {
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const docs = await getDocuments();
      setDocuments(docs);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  // Load immediately, then poll every 3s so status transitions
  // (Pending -> Processing -> Completed) show up without a manual refresh.
  useEffect(() => {
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [load, refreshKey]);

  if (error) return <p style={{ color: "crimson" }}>{error}</p>;

  if (documents.length === 0) {
    return <p style={{ color: "#777" }}>No documents uploaded yet.</p>;
  }

  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {documents.map((doc) => (
        <li
          key={doc.id}
          onClick={() => onSelect(doc.id)}
          style={{
            padding: "0.5rem",
            marginBottom: "0.25rem",
            borderRadius: "6px",
            cursor: "pointer",
            background: doc.id === selectedId ? "#eef" : "transparent",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>{doc.name}</span>
          <span
            style={{
              color: STATUS_COLORS[doc.status] || "#333",
              fontSize: "0.85rem",
            }}
          >
            {doc.status}
          </span>
        </li>
      ))}
    </ul>
  );
}
