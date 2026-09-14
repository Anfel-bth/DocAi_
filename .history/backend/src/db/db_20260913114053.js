// src/db/init.js
// Run once with: npm run db:init
import db from "./db.js";

db.exec(`
  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    extracted_text TEXT,
    status TEXT NOT NULL DEFAULT 'Pending',
    uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    error_message TEXT
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_id INTEGER NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id)
  );
`);

console.log(
  "Database ready: app.sqlite (documents, conversations tables created)",
);
