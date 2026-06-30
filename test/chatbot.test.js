import test from "node:test";
import assert from "node:assert/strict";
import { answerForProduct, routeMessage } from "../src/chatbot.js";
import { findProducts, loadInventory, validateInventory } from "../src/inventory.js";

const inventory = loadInventory();
const currentTime = new Date("2026-06-30T12:00:00+01:00");

test("STK-01 returns a current in-stock answer", () => {
  const product = findProducts("dark chocolate", inventory)[0];
  const result = answerForProduct(product, inventory, "Is it in stock?", currentTime);
  assert.match(result.text, /currently in stock/i);
  assert.match(result.text, /updated/i);
});

test("STK-02 preserves the approved provisional restock window", () => {
  const product = findProducts("salted caramel", inventory)[0];
  const result = answerForProduct(product, inventory, "When is it back?", currentTime);
  assert.match(result.text, /provisional/i);
  assert.match(result.text, /8 Jul 2026/i);
  assert.match(result.text, /12 Jul 2026/i);
  assert.match(result.text, /may change/i);
});

test("STK-03 does not invent a date when none exists", () => {
  const product = findProducts("mint", inventory)[0];
  const result = answerForProduct(product, inventory, "When is it back?", currentTime);
  assert.match(result.text, /don't have an approved restock date/i);
});

test("STK-05 asks for clarification on ambiguous chocolate query", () => {
  const session = {};
  const result = routeMessage("What chocolate bars are in stock?", inventory, session, currentTime);
  assert.match(result, /few possible flavours/i);
});

test("ALT-01 never recommends an unavailable alternative", () => {
  const product = findProducts("salted caramel", inventory)[0];
  const result = answerForProduct(product, inventory, "Any alternative?", currentTime);
  assert.doesNotMatch(result.text, /Mint Chocolate/);
  assert.match(result.text, /Chocolate Sea Salt/);
});

test("ALERT-01 requires consent and stores no email", () => {
  const session = {};
  const first = routeMessage("Alert me for mint chocolate", inventory, session, currentTime);
  assert.match(first, /Reply “yes” to consent/i);
  const second = routeMessage("yes", inventory, session, currentTime);
  assert.match(second, /simulated an alert request/i);
  assert.equal(session.pendingAlertProduct, null);
});

test("SAFE-02 includes the approved allergen disclaimer", () => {
  const session = {};
  const result = routeMessage("Is peanut butter power safe for allergies?", inventory, session, currentTime);
  assert.match(result, /Check the packaging/i);
  assert.match(result, /cannot advise/i);
});

test("invalid alternative references fail validation", () => {
  const copy = structuredClone(inventory);
  copy.products[0].alternativeIds.push("not-a-product");
  assert.throws(() => validateInventory(copy), /Invalid alternative/);
});

