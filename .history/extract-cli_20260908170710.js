import { extractText } from "./extract.js";

const filePath = process.argv[2];

if (!filePath) {
  console.error("Usage: node extract-cli.js <file>");
  process.exit(1);
}

try {
  const result = await extractText(filePath);

  console.log("Characters extracted:", result.charCount);
  console.log("Truncated:", result.truncated);

  console.log("---- First 300 chars ----");
  console.log(result.text.slice(0, 300));
} catch (error) {
  console.error("Error:", error.message);
  process.exit(1);
}
