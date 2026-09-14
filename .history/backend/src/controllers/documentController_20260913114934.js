// src/controllers/documentController.js
// Controllers know about req/res. They do NOT contain business logic --
// that lives in services/documentService.js.
import {
  createDocument,
  getAllDocuments,
} from "../services/documentService.js";

export function uploadDocument(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  // Exercise 1 (from Phase 7) was just: log the filename. This mini-project
  // goes further: save metadata to the database too.
  const document = createDocument({
    name: req.file.originalname,
    filePath: req.file.path,
  });

  console.log(
    `Uploaded: ${req.file.originalname} -> stored as ${req.file.filename}`,
  );

  res.status(201).json(document);
}

export function listDocuments(req, res) {
  const documents = getAllDocuments();
  res.json(documents);
}
