// src/middleware/upload.js
// Handles file uploads safely: allowed types only, size-limited,
// and NEVER trusts the original filename as a storage path.
import multer from "multer";
import { randomUUID } from "crypto";
import path from "path";

const ALLOWED_EXTENSIONS = [".txt", ".pdf"];
const ALLOWED_MIMETYPES = ["text/plain", "application/pdf"];
const MAX_UPLOAD_SIZE_MB = Number(process.env.MAX_UPLOAD_SIZE_MB || 10);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Generate our own safe filename -- never use file.originalname
    // directly as a path (prevents path traversal attacks).
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  const extOk = ALLOWED_EXTENSIONS.includes(ext);
  const mimeOk = ALLOWED_MIMETYPES.includes(file.mimetype);

  if (!extOk || !mimeOk) {
    return cb(new Error("Only .txt and .pdf files are allowed."));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_UPLOAD_SIZE_MB * 1024 * 1024 },
});

export default upload;
