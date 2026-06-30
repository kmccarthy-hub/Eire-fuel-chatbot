# ÉireFuel Chatbot

A customer-service chatbot project for a fictional Irish protein-bar company. It includes:

- A polished, key-free web demo for GitHub Pages
- A Gemini-powered terminal prototype for local use
- Fictional structured inventory data
- Agent personas, project governance, and acceptance tests

## Web demo

The shareable site is in `docs/`. It runs entirely in the browser using sanitized fictional data, so classmates can try it without an API key.

Run it locally:

```powershell
node src/site-server.js
```

Then open `http://127.0.0.1:4174`.

### Publish with GitHub Pages

1. Create a GitHub repository and upload or push this project.
2. On GitHub, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the `main` branch and the `/docs` folder.
5. Select **Save**.
6. Wait for GitHub to show the public Pages URL, then test it in a private browser window.

The `.env` file is ignored and must never be uploaded. GitHub Pages cannot protect a Gemini key, so the published class demo deliberately makes no Gemini API request. A future live-AI site would call a separately hosted protected backend.

## Safety boundary

The local inventory file is authoritative. Application code resolves products, checks freshness, selects available alternatives, and controls alerts. Gemini is used only to make an already-approved response sound conversational; a deterministic reply remains available if the API fails.

The Gemini key stays in a local `.env` file. Never paste it into source code, browser JavaScript, screenshots, chat messages, or GitHub.

The published website is clearly labelled as an interactive class prototype. Its products, inventory, dates, and support address are fictional; alerts are simulated.

## Terminal prototype setup

1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env`.
4. Open `.env` locally and replace `replace_with_your_key` with your Gemini API key.
5. Run `npm start`.

Useful questions:

- `Is dark chocolate in stock?`
- `When will salted caramel be back?`
- `Why is mint chocolate delayed?`
- `What is similar to salted caramel?`
- `What allergens are in peanut butter power?`
- `Alert me when mint chocolate is back`

Commands:

- `/reset` clears conversation context.
- `/quit` closes the chatbot.

## Tests

Run `npm test`.

## Prototype limitations

- Inventory, products, support details, and dates are fictional.
- The stock snapshot is intentionally dated 30 June 2026 for the coursework scenario.
- Alert registration is simulated; no contact information is required, stored, or sent.
- There is no ordering, account, delivery, refund, or medical-advice functionality.
- GitHub Pages can eventually host the interface, but the Gemini API call must use a separate protected backend.

## Project map

- `docs/` — publishable GitHub Pages website
- `data/` — full fictional inventory for the Node prototype
- `src/` — terminal chatbot, Gemini adapter, and local site server
- `test/` — automated Node tests
- `personas/` — specialist agent definitions
- `PROJECT_CHARTER.md` — approved business scope and safety rules
- `PROJECT_PLAN.md` — phased delivery plan and status
- `TEST_SCENARIOS.md` — acceptance and risk scenarios
