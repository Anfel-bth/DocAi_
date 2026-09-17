// src/utils/chunkText.js
//
// Splits text into overlapping chunks so each piece can be embedded
// separately later. Overlap matters: without it, a sentence that falls
// exactly on a chunk boundary gets cut in half and neither chunk alone
// contains the full idea.
export function chunkText(text, chunkSize = 500, overlap = 50) {
  const chunks = [];
  const step = chunkSize - overlap;

  for (let start = 0; start < text.length; start += step) {
    const piece = text.slice(start, start + chunkSize).trim();
    if (piece.length > 0) {
      chunks.push(piece);
    }
    // Stop once we've reached the end of the text.
    if (start + chunkSize >= text.length) break;
  }

  return chunks;
}
