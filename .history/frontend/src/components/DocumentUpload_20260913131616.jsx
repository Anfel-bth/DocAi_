// src/components/DocumentUpload.jsx
import { useState } from "react";
import { uploadDocument } from "../api";

export default function DocumentUpload({ onUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      await uploadDocument(file);
      onUploaded(); // tell App to refresh the document list
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = ""; // allow re-uploading the same file name later
    }
  }

  return (
    <div style={{ marginBottom: "1rem" }}>
      <label style={{ display: "inline-block" }}>
        <input
          type="file"
          accept=".pdf,.txt"
          onChange={handleFileChange}
          disabled={uploading}
          style={{ display: "none" }}
        />
        <span
          style={{
            padding: "0.5rem 1rem",
            border: "1px solid #ccc",
            borderRadius: "6px",
            cursor: uploading ? "not-allowed" : "pointer",
            opacity: uploading ? 0.6 : 1,
          }}
        >
          {uploading ? "Uploading..." : "Upload document"}
        </span>
      </label>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
    </div>
  );
}
