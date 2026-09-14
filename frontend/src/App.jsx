// src/App.jsx
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";

export default function App() {
  const [selectedId, setSelectedId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  function handleUploaded() {
    setRefreshKey((k) => k + 1);
  }

  return (
    <div style={{ display: "flex", background: "var(--bg-main)" }}>
      <Sidebar
        selectedId={selectedId}
        onSelect={setSelectedId}
        refreshKey={refreshKey}
        onUploaded={handleUploaded}
      />
      <main style={{ flex: 1 }}>
        <ChatWindow documentId={selectedId} />
      </main>
    </div>
  );
}
