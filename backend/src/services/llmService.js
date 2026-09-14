// src/services/llmService.js
// Talks to llama-server. Streams tokens as they arrive, then returns
// the full answer string.

const LLM_TIMEOUT_MS = Number(process.env.LLM_TIMEOUT_MS) || 15 * 60 * 1000;
const LLM_MAX_TOKENS = Number(process.env.LLM_MAX_TOKENS) || 256;

const LLAMA_URL = (process.env.LLAMA_SERVER_URL ||
  "http://127.0.0.1:8080/v1/chat/completions"
).replace("://localhost", "://127.0.0.1");

function buildMessages(documentText, question) {
  return [
    {
      role: "system",
      content:
        "You are a document assistant. You must answer the user's question " +
        "using ONLY the information in the document text provided below. " +
        "If the answer is not present in the document, respond exactly with: " +
        '"I don\'t know based on the provided document." Do not use outside knowledge. ' +
        "Be concise and cite the relevant part of the document when possible.\n\n" +
        `DOCUMENT:\n"""\n${documentText}\n"""`,
    },
    {
      role: "user",
      content: question,
    },
  ];
}

function tokenFromSseLine(line) {
  const trimmed = line.trim();
  if (!trimmed.startsWith("data:")) return "";

  const payload = trimmed.slice(5).trim();
  if (!payload || payload === "[DONE]") return "";

  try {
    const chunk = JSON.parse(payload);
    return (
      chunk.choices?.[0]?.delta?.content ||
      chunk.choices?.[0]?.message?.content ||
      ""
    );
  } catch {
    return "";
  }
}

export async function streamQuestion(documentText, question, onToken) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LLM_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(LLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: "mistral",
        messages: buildMessages(documentText, question),
        temperature: 0.5,
        max_tokens: LLM_MAX_TOKENS,
        stream: true,
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(
        `LLM server responded with status ${response.status}${detail ? `: ${detail.slice(0, 300)}` : ""}`,
      );
    }

    if (!response.body) {
      throw new Error("LLM server did not return a stream.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let answer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const token = tokenFromSseLine(line);
        if (!token) continue;
        answer += token;
        onToken(token);
      }
    }

    const trailing = tokenFromSseLine(buffer);
    if (trailing) {
      answer += trailing;
      onToken(trailing);
    }

    if (!answer) {
      throw new Error("LLM server returned an empty answer.");
    }
    return answer;
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error(
        `The LLM timed out after ${Math.round(LLM_TIMEOUT_MS / 1000)}s. ` +
          "The model is running but this request is too slow for the current timeout.",
      );
    }
    if (err.message?.startsWith("LLM server") || err.message?.startsWith("Could not")) {
      throw err;
    }
    throw new Error(
      `Could not connect to the LLM at ${LLAMA_URL}: ${err.cause?.message || err.message}`,
    );
  } finally {
    clearTimeout(timer);
  }
}
