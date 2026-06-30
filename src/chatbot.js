import { availableAlternatives, findProducts, formatDate, isStale } from "./inventory.js";

const stockWords = /\b(stock|available|availability|back|restock|return|delay|when|where|buy|alternative|similar)\b/i;
const ingredientWords = /\b(ingredient|allergen|allergy|contain|gluten|milk|nuts?|peanut|soya|safe|medical)\b/i;

function productFacts(product, inventory, now) {
  const alternatives = availableAlternatives(product, inventory);
  return {
    product,
    alternatives,
    stale: isStale(product, now),
    updated: formatDate(product.lastUpdatedAt)
  };
}

export function answerForProduct(product, inventory, input, now = new Date()) {
  const facts = productFacts(product, inventory, now);
  const { alternatives, stale, updated } = facts;

  if (stale) {
    return {
      text: `I can't confirm ${product.name}'s availability because its stock record needs review. Please contact ${inventory.supportEmail}.`,
      facts
    };
  }

  if (ingredientWords.test(input)) {
    return {
      text: `${product.name}: ${product.ingredients} ${product.allergens}\n\n${inventory.allergenDisclaimer}`,
      facts
    };
  }

  const alternativeText = alternatives.length
    ? ` Similar options currently available: ${alternatives.map((item) => item.name).join(" or ")}.`
    : "";

  if (product.status === "in_stock") {
    return { text: `${product.name} is currently in stock. Stock updated ${updated}.${alternativeText}`, facts };
  }
  if (product.status === "low_stock") {
    return { text: `${product.name} is available, but stock is running low. Stock updated ${updated}.${alternativeText}`, facts };
  }
  if (product.status === "discontinued") {
    return { text: `${product.name} is no longer in the current range.${alternativeText} Stock information updated ${updated}.`, facts };
  }

  let estimate = "We don't have an approved restock date yet.";
  if (product.restock) {
    const window = `${formatDate(product.restock.start)} to ${formatDate(product.restock.end)}`;
    estimate = `The ${product.restock.confidence} restock estimate is ${window}. This is an estimate and may change.`;
  }
  return {
    text: `${product.name} is currently out of stock. ${product.delayReason ?? ""} ${estimate} Stock updated ${updated}.${alternativeText}`.replace(/\s+/g, " "),
    facts
  };
}

export function routeMessage(input, inventory, session, now = new Date()) {
  const trimmed = input.trim();
  const lower = trimmed.toLowerCase();

  if (session.pendingAlertProduct) {
    if (/\b(yes|agree|consent|opt in)\b/i.test(trimmed)) {
      const name = session.pendingAlertProduct.name;
      session.pendingAlertProduct = null;
      return `Thanks—this prototype has simulated an alert request for ${name}. No email was stored and no real alert will be sent.`;
    }
    if (/\b(no|cancel|stop)\b/i.test(trimmed)) {
      session.pendingAlertProduct = null;
      return "No problem. I cancelled the simulated alert request.";
    }
    return "Please reply “yes” to consent to the simulated alert, or “no” to cancel. No contact details are needed.";
  }

  if (/\b(human|person|support|agent)\b/i.test(lower)) {
    return `You can contact ÉireFuel support at ${inventory.supportEmail}. This is a fictional prototype address.`;
  }

  let matches = findProducts(trimmed, inventory);
  if (matches.length === 0 && session.lastProduct && /\b(it|that|this|alert|notify|ingredients?|allergens?)\b/i.test(lower)) {
    matches = [session.lastProduct];
  }

  if (matches.length > 1) {
    return `I found a few possible flavours: ${matches.map((product) => product.name).join(", ")}. Which one did you mean?`;
  }

  if (matches.length === 0) {
    if (stockWords.test(trimmed) || ingredientWords.test(trimmed)) {
      return `Which flavour do you mean? Try ${inventory.products.slice(0, 4).map((product) => product.name).join(", ")}, or another ÉireFuel flavour.`;
    }
    return "I can check flavour availability, restock estimates, approved delay reasons, alternatives, ingredients, or simulate a restock alert. Which flavour are you interested in?";
  }

  const product = matches[0];
  session.lastProduct = product;

  if (/\b(alert|notify|notification|email me|let me know)\b/i.test(lower)) {
    session.pendingAlertProduct = product;
    return `I can simulate a back-in-stock alert for ${product.name}. This classroom prototype will not store an email or send a real message. Reply “yes” to consent to the simulation, or “no” to cancel.`;
  }

  return answerForProduct(product, inventory, trimmed, now).text;
}

