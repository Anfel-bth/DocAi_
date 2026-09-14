
import readline from "readline";

const LLAMA_URL = "http://localhost:8080/v1/chat/completions";
const RESET_EACH_TURN = false; // flip to true for Exercise 2

const systemMessage = {
  role: "system",
  content: "You are a helpful assistant. Keep answers short.",
};

let messages = [systemMessage];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log('Type a message and press Enter. Type "exit" to quit.\n');
askLoop();

function askLoop() {
  rl.question("You: ", async (input) => {
    if (input.trim().toLowerCase() === "exit") {
      rl.close();
      return;
    }

    // Add the new user turn to history
    messages.push({ role: "user", content: input });

    try {
      const res = await fetch(LLAMA_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "mistral",
          // Send the FULL history every time -- this is the whole trick.
          messages: messages,
          temperature: 0.3,
          max_tokens: 300,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server responded with status ${res.status}`);
      }

      const data = await res.json();
      const reply = data.choices[0].message.content;

      console.log(`Assistant: ${reply}\n`);

      // Add the assistant's reply to history too, so the NEXT turn
      // includes it as context.
      messages.push({ role: "assistant", content: reply });

      if (RESET_EACH_TURN) {
        // Exercise 2: throw away everything except the system message,
        // simulating an app that forgets to resend history.
        messages = [systemMessage];
      }
    } catch (err) {
      console.log(`\n[Error] Could not reach the model server: ${err.message}`);
      console.log("Is llama-server still running in its own window?\n");
    }

    askLoop();
  });
}
