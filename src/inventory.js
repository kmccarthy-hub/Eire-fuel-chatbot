import fs from "node:fs";

const allowedStatuses = new Set([
  "in_stock",
  "low_stock",
  "out_of_stock",
  "discontinued",
  "unknown"
]);

export function loadInventory(path = new URL("../data/inventory.json", import.meta.url)) {
  const inventory = JSON.parse(fs.readFileSync(path, "utf8"));
  validateInventory(inventory);
  return inventory;
}

export function validateInventory(inventory) {
  if (!Array.isArray(inventory.products) || inventory.products.length === 0) {
    throw new Error("Inventory must contain products.");
  }

  const ids = new Set(inventory.products.map((product) => product.id));
  if (ids.size !== inventory.products.length) {
    throw new Error("Product IDs must be unique.");
  }

  for (const product of inventory.products) {
    if (!product.id || !product.name || !allowedStatuses.has(product.status)) {
      throw new Error(`Invalid product record: ${product.id ?? "unknown"}`);
    }
    if (Number.isNaN(Date.parse(product.lastUpdatedAt)) || Number.isNaN(Date.parse(product.nextReviewAt))) {
      throw new Error(`Invalid inventory date for ${product.id}.`);
    }
    if (Date.parse(product.nextReviewAt) <= Date.parse(product.lastUpdatedAt)) {
      throw new Error(`Review time must follow update time for ${product.id}.`);
    }
    for (const alternativeId of product.alternativeIds) {
      if (!ids.has(alternativeId) || alternativeId === product.id) {
        throw new Error(`Invalid alternative ${alternativeId} for ${product.id}.`);
      }
    }
    if (product.restock && product.restock.end < product.restock.start) {
      throw new Error(`Invalid restock window for ${product.id}.`);
    }
  }
}

function normalize(value) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

export function findProducts(input, inventory) {
  const query = normalize(input);
  if (!query) return [];

  const exact = inventory.products.filter((product) =>
    [product.name, ...product.aliases].some((name) => normalize(name) === query)
  );
  if (exact.length) return exact;

  const contained = inventory.products.filter((product) =>
    [product.name, ...product.aliases].some((name) => {
      const candidate = normalize(name);
      return query.includes(candidate) || candidate.includes(query);
    })
  );
  if (contained.length) return contained;

  const ignored = new Set(["what", "when", "where", "which", "bars", "stock", "available", "about"]);
  const usefulWords = query.split(" ").filter((word) => word.length >= 4 && !ignored.has(word));
  if (usefulWords.length === 0) return [];

  return inventory.products.filter((product) => {
    const searchable = normalize([product.name, ...product.aliases].join(" "));
    return usefulWords.some((word) => searchable.includes(word));
  });
}

export function availableAlternatives(product, inventory) {
  return product.alternativeIds
    .map((id) => inventory.products.find((candidate) => candidate.id === id))
    .filter((candidate) => candidate && ["in_stock", "low_stock"].includes(candidate.status));
}

export function isStale(product, now = new Date()) {
  return now > new Date(product.nextReviewAt);
}

export function formatDate(date) {
  return new Intl.DateTimeFormat("en-IE", {
    dateStyle: "medium",
    timeStyle: date.includes("T") ? "short" : undefined,
    timeZone: "Europe/Dublin"
  }).format(new Date(date));
}
