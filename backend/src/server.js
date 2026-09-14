// src/server.js
import app from "./app.js";

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});

// Local llama.cpp completions can exceed Node's 5-minute request timeout.
server.timeout = 0;
server.requestTimeout = 0;
server.headersTimeout = 0;
