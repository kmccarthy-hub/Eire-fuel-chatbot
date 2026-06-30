const messages = document.querySelector("#chat-messages");
const form = document.querySelector("#chat-form");
const input = document.querySelector("#chat-input");
const resetButton = document.querySelector("#reset-chat");
const suggestions = document.querySelector("#suggestions");
const flavourList = document.querySelector("#flavour-list");
const statusText = document.querySelector("#ai-status");

let inventory;
let history = [];
let sending = false;
const API_URL = window.EIREFUEL_API_URL || "";

const statusLabels = {
  in_stock: "In stock",
  low_stock: "Low stock",
  out_of_stock: "Out of stock",
  discontinued: "Unavailable",
  unknown: "Check status"
};

function addMessage(text, role) {
  const wrapper = document.createElement("div");
  wrapper.className = `message ${role}`;
  const content = document.createElement("div");
  const bubble = document.createElement("div");
  bubble.className = "message-bubble";
  bubble.textContent = text;
  const meta = document.createElement("div");
  meta.className = "message-meta";
  meta.textContent = role === "user" ? "You" : "ÉireFuel Assistant";
  content.append(bubble, meta);
  wrapper.append(content);
  messages.append(wrapper);
  messages.scrollTop = messages.scrollHeight;
}

async function sendMessage(text) {
  const clean = text.trim();
  if (!clean || sending) return;
  addMessage(clean, "user");
  const priorHistory = history.slice(-8);
  history.push({ role: "user", text: clean });
  sending = true;
  statusText.textContent = "Gemini is thinking…";
  form.querySelector("button").disabled = true;
  input.disabled = true;

  try {
    if (!API_URL) throw new Error("not-configured");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20_000);
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: clean, history: priorHistory }),
      signal: controller.signal
    });
    window.clearTimeout(timeout);
    const payload = await response.json();
    if (!response.ok || !payload.llmUsed || !payload.reply) {
      throw new Error(payload.error || "AI request failed");
    }
    addMessage(payload.reply, "assistant");
    history.push({ role: "assistant", text: payload.reply });
    statusText.textContent = `AI-powered · ${payload.model}`;
  } catch (error) {
    const detail = error.message === "not-configured"
      ? "The live AI backend has not been connected yet."
      : "The AI service is temporarily unavailable.";
    addMessage(`${detail} Please try again shortly.`, "assistant");
    statusText.textContent = "AI temporarily unavailable";
  } finally {
    sending = false;
    form.querySelector("button").disabled = false;
    input.disabled = false;
    input.focus();
  }
}

function resetChat() {
  history = [];
  messages.replaceChildren();
  addMessage("Hi! I’m the Gemini-powered ÉireFuel stock assistant. Ask me naturally about availability, delays, alternatives, ingredients, or a simulated alert.", "assistant");
  statusText.textContent = API_URL ? "AI ready" : "AI backend not connected";
  input.focus();
}

function renderFlavours() {
  flavourList.replaceChildren();
  inventory.products.forEach(product => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "flavour-item";
    button.setAttribute("aria-label", `Ask about ${product.name}, ${statusLabels[product.status]}`);
    button.innerHTML = `
      <span class="status-dot ${product.status}" aria-hidden="true"></span>
      <span>${product.name}</span>
      <span class="status-label">${statusLabels[product.status]}</span>
    `;
    button.addEventListener("click", () => sendMessage(`Is ${product.name} in stock?`));
    flavourList.append(button);
  });
}

form.addEventListener("submit", event => {
  event.preventDefault();
  sendMessage(input.value);
  form.reset();
  input.focus();
});
resetButton.addEventListener("click", resetChat);
suggestions.addEventListener("click", event => {
  const button = event.target.closest("[data-message]");
  if (button) sendMessage(button.dataset.message);
});

try {
  const response = await fetch("./data/inventory.json");
  if (!response.ok) throw new Error("Inventory unavailable");
  inventory = await response.json();
  renderFlavours();
  resetChat();
} catch {
  addMessage("The fictional inventory could not be loaded. Please refresh the page or try again later.", "assistant");
  form.querySelector("button").disabled = true;
}
