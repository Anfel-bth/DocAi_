// src/App.jsx
import { useState } from "react";
import DocumentUpload from "./components/DocumentUpload";
import DocumentList from "./components/DocumentList";
import ChatWindow from "./components/ChatWindow";

export default function App() {
  const [selectedId, setSelectedId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  function handleUploaded() {
    // Bump refreshKey so DocumentList's effect re-runs and fetches
    // the new document right away, instead of waiting for the next poll.
    setRefreshKey((k) => k + 1);
  }

  return (
    <div
      style={{
        display: "flex",
        gap: "2rem",
        padding: "2rem",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ width: "300px" }}>
        <h2>Documents</h2>
        <DocumentUpload onUploaded={handleUploaded} />
        <DocumentList
          selectedId={selectedId}
          onSelect={setSelectedId}
          refreshKey={refreshKey}
        />
      </div>

      <div style={{ flex: 1 }}>
        <h2>Chat</h2>
        <ChatWindow documentId={selectedId} />
      </div>
    </div>
  );
}
