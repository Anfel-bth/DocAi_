// src/utils/truncateForContext.js
// Keeps injected document text within a safe budget for the model's
// context window. ~1 token ~= ~4 characters, so 12,000 chars leaves
// comfortable room for the question + answer inside a 4096-token context.
export function truncateForContext(text, maxChars = 12000) {
  if (text.length <= maxChars) {
    return { text, truncated: false };
  }
  const cut = text.slice(0, maxChars);
  const note = "\n\n...[truncated: document too long for MVP context window]";
  return { text: cut + note, truncated: true };
}
