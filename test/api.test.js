import test from "node:test";
import assert from "node:assert/strict";
import handler from "../api/chat.js";

function createResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: undefined,
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(value) {
      this.body = value;
      return this;
    },
    end() {
      return this;
    }
  };
}

test("API accepts a GitHub Pages preflight request", async () => {
  const request = {
    method: "OPTIONS",
    headers: { origin: "https://kmccarthy-hub.github.io" },
    socket: { remoteAddress: "test-preflight" }
  };
  const response = createResponse();
  await handler(request, response);
  assert.equal(response.statusCode, 204);
  assert.equal(response.headers["Access-Control-Allow-Origin"], "https://kmccarthy-hub.github.io");
});

test("API rejects an unapproved browser origin", async () => {
  const request = {
    method: "POST",
    headers: { origin: "https://example.com" },
    body: { message: "Is caramel in stock?" },
    socket: { remoteAddress: "test-origin" }
  };
  const response = createResponse();
  await handler(request, response);
  assert.equal(response.statusCode, 403);
});

test("API rejects an empty message", async () => {
  const request = {
    method: "POST",
    headers: { origin: "https://kmccarthy-hub.github.io" },
    body: { message: " " },
    socket: { remoteAddress: "test-empty" }
  };
  const response = createResponse();
  await handler(request, response);
  assert.equal(response.statusCode, 400);
});

test("API returns a safe configuration error without a key", async () => {
  const previous = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  const request = {
    method: "POST",
    headers: { origin: "https://kmccarthy-hub.github.io" },
    body: { message: "When is salted caramel back?", history: [] },
    socket: { remoteAddress: "test-no-key" }
  };
  const response = createResponse();
  await handler(request, response);
  if (previous) process.env.GEMINI_API_KEY = previous;
  assert.equal(response.statusCode, 503);
  assert.deepEqual(response.body, { error: "The AI service is not configured." });
});

