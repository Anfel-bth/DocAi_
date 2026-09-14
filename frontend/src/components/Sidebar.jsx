// src/components/Sidebar.jsx
import { useEffect, useState, useCallback, useRef } from "react";
import { getDocuments, uploadDocument, deleteDocument } from "../api";
import Logo from "./Logo";

const STATUS_DOT = {
  Pending: "#c9c4b0",
  Processing: "#ffc94a",
  Completed: "#5fae72",
  Failed: "#d9534f",
};

export default function Sidebar({
  selectedId,
  onSelect,
  refreshKey,
  onUploaded,
}) {
  const [open, setOpen] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const docs = await getDocuments();
      setDocuments(docs);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [load, refreshKey]);

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const doc = await uploadDocument(file);
      onUploaded();
      onSelect(doc.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDelete(e, docId) {
    e.stopPropagation(); // don't trigger onSelect for the row underneath
    if (!window.confirm("Delete this document and its conversation?")) return;
    try {
      await deleteDocument(docId);
      if (selectedId === docId) onSelect(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <aside
      style={{
        width: open ? 260 : 64,
        transition: "width 0.18s ease",
        background: "var(--bg-sidebar)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        flexShrink: 0,
      }}
    >
      {/* Header: logo + collapse toggle */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: open ? "space-between" : "center",
          padding: "16px 14px",
        }}
      >
        {open && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Logo size={26} />
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: "1.15rem",
              }}
            >
              DocAi
            </span>
          </div>
        )}
        {!open && <Logo size={26} />}
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
          style={{
            background: "none",
            border: "none",
            padding: 6,
            borderRadius: "var(--radius-sm)",
            display: open ? "block" : "none",
          }}
        >
          <ChevronIcon direction={open ? "left" : "right"} />
        </button>
      </div>

      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Expand sidebar"
          style={{
            background: "none",
            border: "none",
            padding: "0 0 12px 0",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <ChevronIcon direction="right" />
        </button>
      )}

      {/* New document button */}
      <div style={{ padding: "0 12px 12px" }}>
        <input
          type="file"
          accept=".pdf,.txt"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <button
          onClick={() => fileInputRef.current.click()}
          disabled={uploading}
          title="New document"
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: open ? "flex-start" : "center",
            gap: 8,
            padding: "10px 12px",
            background: "var(--accent)",
            border: "none",
            borderRadius: "var(--radius-md)",
            fontWeight: 600,
            fontSize: "0.9rem",
            color: "var(--text-primary)",
            opacity: uploading ? 0.6 : 1,
          }}
        >
          <PlusIcon />
          {open && (uploading ? "Uploading..." : "New document")}
        </button>
      </div>

      {/* Document list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 8px" }}>
        {open &&
          documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => onSelect(doc.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "9px 10px",
                marginBottom: 2,
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                background:
                  doc.id === selectedId ? "var(--bg-hover)" : "transparent",
              }}
              className="doc-row"
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: STATUS_DOT[doc.status] || "#ccc",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  flex: 1,
                  fontSize: "0.87rem",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {doc.name}
              </span>
              <button
                onClick={(e) => handleDelete(e, doc.id)}
                aria-label={`Delete ${doc.name}`}
                className="delete-btn"
                title="Delete document"
                style={{
                  background: "none",
                  border: "none",
                  padding: 4,
                  borderRadius: 6,
                  color: "var(--text-secondary)",
                  opacity: 0.55,
                }}
              >
                <TrashIcon />
              </button>
            </div>
          ))}
        {open && documents.length === 0 && (
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.85rem",
              padding: "8px 10px",
            }}
          >
            No documents yet.
          </p>
        )}
      </div>

      {error && (
        <p
          style={{
            color: "var(--danger)",
            fontSize: "0.8rem",
            padding: "8px 12px",
          }}
        >
          {error}
        </p>
      )}

      <style>{`
        .doc-row:hover { background: var(--bg-hover); }
        .doc-row:hover .delete-btn { opacity: 1; color: var(--danger); }
        .delete-btn:hover { background: rgba(0,0,0,0.06); }
      `}</style>
    </aside>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M8 2v12M2 8h12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
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

function ChevronIcon({ direction }) {
  const rotate = direction === "left" ? "rotate(180deg)" : "rotate(0deg)";
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      style={{ transform: rotate }}
    >
      <path
        d="M6 3l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
