import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { routeMessage } from "./chatbot.js";
import { createGemini, polishReply } from "./gemini.js";
import { loadInventory } from "./inventory.js";

const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

if (!apiKey || apiKey === "replace_with_your_key") {
  console.error("ÉireFuel setup: add your GEMINI_API_KEY to the local .env file, then run npm start.");
  process.exit(1);
}

const inventory = loadInventory();
const ai = createGemini(apiKey);
const session = { lastProduct: null, pendingAlertProduct: null };
const terminal = readline.createInterface({ input, output });

console.log("ÉireFuel Assistant");
console.log("Ask about stock, restock estimates, alternatives, ingredients, or alerts.");
console.log("Type /reset to clear context or /quit to leave.\n");

while (true) {
  const message = await terminal.question("You: ");
  if (message.trim().toLowerCase() === "/quit") break;
  if (message.trim().toLowerCase() === "/reset") {
    session.lastProduct = null;
    session.pendingAlertProduct = null;
    console.log("Bot: Conversation context cleared.\n");
    continue;
  }

  const safeReply = routeMessage(message, inventory, session);
  const reply = await polishReply(ai, model, safeReply, message);
  console.log(`Bot: ${reply}\n`);
}

terminal.close();
console.log("Goodbye.");
