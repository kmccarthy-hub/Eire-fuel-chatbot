const messages = document.querySelector("#chat-messages");
const form = document.querySelector("#chat-form");
const input = document.querySelector("#chat-input");
const resetButton = document.querySelector("#reset-chat");
const suggestions = document.querySelector("#suggestions");
const flavourList = document.querySelector("#flavour-list");

let inventory;
let lastProduct = null;
let pendingAlert = null;

const statusLabels = {
  in_stock: "In stock",
  low_stock: "Low stock",
  out_of_stock: "Out of stock",
  discontinued: "Unavailable",
  unknown: "Check status"
};

const date = (value, withTime = false) =>
  new Intl.DateTimeFormat("en-IE", {
    dateStyle: "medium",
    ...(withTime ? { timeStyle: "short" } : {}),
    timeZone: "Europe/Dublin"
  }).format(new Date(value));

function normalize(value) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function findProducts(query) {
  const normalized = normalize(query);
  const exact = inventory.products.filter(product =>
    [product.name, ...product.aliases].some(name => normalize(name) === normalized)
  );
  if (exact.length) return exact;

  const contained = inventory.products.filter(product =>
    [product.name, ...product.aliases].some(name => {
      const candidate = normalize(name);
      return normalized.includes(candidate) || candidate.includes(normalized);
    })
  );
  if (contained.length) return contained;

  const ignored = new Set(["what", "when", "where", "which", "bars", "stock", "available", "about", "similar"]);
  const words = normalized.split(" ").filter(word => word.length >= 4 && !ignored.has(word));
  return inventory.products.filter(product => {
    const searchable = normalize([product.name, ...product.aliases].join(" "));
    return words.some(word => searchable.includes(word));
  });
}

function alternatives(product) {
  return product.alternativeIds
    .map(id => inventory.products.find(candidate => candidate.id === id))
    .filter(candidate => candidate && ["in_stock", "low_stock"].includes(candidate.status));
}

function productReply(product, userMessage) {
  const lower = userMessage.toLowerCase();
  const updated = date(product.lastUpdatedAt, true);
  const suggestions = alternatives(product);
  const alternativeText = suggestions.length
    ? `\n\nYou could try ${suggestions.map(item => item.name).join(" or ")}—both are available in this demo.`
    : "";

  if (/\b(ingredient|allergen|allergy|contain|gluten|milk|nuts?|peanut|soya|safe)\b/i.test(lower)) {
    return `${product.name} contains: ${product.ingredients}\n\nAllergen statement: ${product.allergens}\n\n${inventory.allergenDisclaimer}`;
  }
  if (product.status === "in_stock") {
    return `${product.name} is in stock. Stock data was updated ${updated}.${alternativeText}`;
  }
  if (product.status === "low_stock") {
    return `${product.name} is available, but running low. Stock data was updated ${updated}.${alternativeText}`;
  }
  if (product.status === "discontinued") {
    return `${product.name} is no longer in the current range.${alternativeText}`;
  }

  const estimate = product.restock
    ? `The ${product.restock.confidence} restock window is ${date(product.restock.start)} to ${date(product.restock.end)}. It is an estimate and may change.`
    : "There is no approved restock date yet.";
  return `${product.name} is currently out of stock. ${product.delayReason || ""}\n\n${estimate}\n\nLast updated ${updated}.${alternativeText}`;
}

function routeMessage(userMessage) {
  const lower = userMessage.toLowerCase();

  if (pendingAlert) {
    if (/\b(yes|agree|consent|opt in)\b/i.test(lower)) {
      const productName = pendingAlert.name;
      pendingAlert = null;
      return `Thanks—an alert request for ${productName} has been simulated. No email was collected and no message will be sent.`;
    }
    if (/\b(no|cancel|stop)\b/i.test(lower)) {
      pendingAlert = null;
      return "No problem. The simulated alert request has been cancelled.";
    }
    return "Please reply “yes” to consent to the simulation, or “no” to cancel. No contact details are required.";
  }

  if (/\b(human|person|support|agent)\b/i.test(lower)) {
    return `For this prototype, human support is represented by ${inventory.supportEmail}. This is a fictional address and does not receive messages.`;
  }

  let matches = findProducts(userMessage);
  if (!matches.length && lastProduct && /\b(it|that|this|alert|notify|ingredients?|allergens?)\b/i.test(lower)) {
    matches = [lastProduct];
  }

  if (matches.length > 1) {
    return `I found a few possible flavours: ${matches.map(product => product.name).join(", ")}. Which one did you mean?`;
  }
  if (!matches.length) {
    return "I can check stock, explain a delay, suggest an available flavour, share approved label information, or simulate a restock alert. Which flavour are you interested in?";
  }

  lastProduct = matches[0];
  if (/\b(alert|notify|notification|email me|let me know)\b/i.test(lower)) {
    pendingAlert = lastProduct;
    return `I can simulate a back-in-stock alert for ${lastProduct.name}. This demo will not collect your email or send a real message. Reply “yes” to consent to the simulation, or “no” to cancel.`;
  }
  return productReply(lastProduct, userMessage);
}

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

function sendMessage(text) {
  const clean = text.trim();
  if (!clean) return;
  addMessage(clean, "user");
  window.setTimeout(() => addMessage(routeMessage(clean), "assistant"), 260);
}

function resetChat() {
  lastProduct = null;
  pendingAlert = null;
  messages.replaceChildren();
  addMessage("Hi! I’m the ÉireFuel stock assistant. Ask me what’s available, when a flavour may return, or what you could try instead.", "assistant");
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
  const response = await fetch("../data/inventory.json");
  if (!response.ok) throw new Error("Inventory unavailable");
  inventory = await response.json();
  renderFlavours();
  resetChat();
} catch {
  addMessage("The fictional inventory could not be loaded. Please refresh the page or try again later.", "assistant");
  form.querySelector("button").disabled = true;
}
