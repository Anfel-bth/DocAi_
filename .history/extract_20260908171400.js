import path from "path";
import { readFileSync } from "fs";
// import pdfParse from "pdf-parse";
import { PDFParse } from "pdf-parse";
// TXT extraction
function extractTxt(filePath) {
  const text = readFileSync(filePath, "utf-8");
  return text;
}

// PDF extraction
async function extractPdf(filePath) {
  const buffer = readFileSync(filePath);
  const data = await pdfParse(buffer);

  if (!data.text || data.text.trim().length < 20) {
    throw new Error(
      "No extractable text found — this may be a scanned/image-only PDF (OCR not supported in this MVP).",
    );
  }

  return data.text;
}

function truncateForContext(text, maxChars = 12000) {
  if (text.length <= maxChars) {
    return {
      text,
      truncated: false,
    };
  }

  const cut = text.slice(0, maxChars);

  return {
    text: cut + "\n\n...[truncated, document too long for MVP context window]",
    truncated: true,
  };
}

export async function extractText(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  let rawText;

  if (ext === ".txt") {
    rawText = extractTxt(filePath);
  } else if (ext === ".pdf") {
    rawText = await extractPdf(filePath);
  } else {
    throw new Error(`Unsupported file type: ${ext}`);
  }

  const { text, truncated } = truncateForContext(rawText);

  return {
    text,
    truncated,
    charCount: rawText.length,
  };
}
