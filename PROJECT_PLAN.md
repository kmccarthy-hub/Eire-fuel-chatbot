# Company Chatbot Project Plan

## Objective

Build a small, trustworthy company chatbot that answers a clearly defined set of questions from approved company sources, shows uncertainty appropriately, and can be demonstrated through a web interface.

Kevin remains the product owner, final decision-maker, and GitHub publisher.

## Agent team

| Agent | Owns | Required review |
|---|---|---|
| Raymond Holt — Delivery Lead | Plan, decisions, risks, phase gates | Kevin |
| Penelope Garcia — Chatbot Engineer | Gemini integration, backend, configuration | Data |
| Data — Knowledge and AI Quality Engineer | Grounding, citations, evaluations | Joan |
| Shuri — Web Experience and Release Engineer | UI, accessibility, deployment preparation | Joan and Penelope |
| Joan Watson — Business Domain Expert | Scope, approved truth, escalation, business acceptance | Kevin |

## Architecture direction

```text
GitHub Pages web interface
            |
            v
Protected backend or serverless endpoint
            |
            v
Gemini API + approved company knowledge
```

GitHub Pages is a static host. The Gemini API key must never be included in browser JavaScript, committed files, or the published site. A local terminal prototype comes first; the protected web architecture comes later.

## Delivery phases and gates

### 0. Project framing

Decide the sponsor, target users, business problem, intended channel, constraints, and owners.

Deliverable: one-page project charter and decision log.

Gate: Kevin agrees the objective and MVP boundary.

Status: **Ready for Kevin's approval.** The draft is recorded in `PROJECT_CHARTER.md`.

### 1. Discovery and scope

Identify the most frequent, valuable, and low-risk user questions. Define what is in scope, out of scope, and handed to a person.

Deliverables: prioritized use cases, representative questions, scope statement, escalation map, and initial risk register.

Gate: Joan approves the business scope.

Status: **Draft complete.** The case study supports stock checks, approved delay explanations, estimated restocking, available alternatives, simulated alerts, and human escalation. Open decisions remain listed in `PROJECT_CHARTER.md`.

### 2. Knowledge and governance

Inventory potential sources. For each source record its owner, intended audience, sensitivity, approval state, and review date.

Deliverables: source register, content policy, privacy rules, and prohibited topics.

Gate: only approved sources can enter the prototype.

Planned prototype source: a fictional structured JSON catalogue and inventory created for ÉireFuel. It will be replaceable by a real inventory API later.

### 3. Technical proof of concept

Build a minimal Node.js terminal chatbot using an environment-held API key, a stable model, system instructions, conversation history, and clear error and quota handling.

Deliverables: working terminal prototype, `.env.example`, `.gitignore`, and setup guide.

Gate: the bot handles the first approved test set and refuses or escalates out-of-scope questions.

Status: **Initial proof of concept complete on 30 June 2026.**

- Official Gemini Node.js SDK installed.
- API key loaded from the ignored local `.env` file.
- Eight-flavour fictional inventory implemented and validated.
- Deterministic stock, restock, alternative, allergen, escalation, and simulated-alert behaviour implemented.
- Eight automated tests passed.
- Live Gemini checks passed for an in-stock product, a provisional restock window with delay reason, and explicit simulated-alert consent.
- No contact information was requested or stored.

The remaining scenarios in `TEST_SCENARIOS.md` will be expanded before the Phase 5 release gate.

### 4. Grounded local MVP

Add retrieval from approved company material, source references, unknown-answer behaviour, conversation state, and human handoff. Add a local web interface.

Deliverables: grounded chatbot and local responsive interface.

Gate: critical test cases contain no unsupported answer and escalation works end to end.

Status: **Shareable static web MVP complete on 30 June 2026.**

- Responsive ÉireFuel-branded interface created in `docs/`.
- Interactive stock, restock, alternative, allergen, support, and simulated-alert journeys use sanitized fictional data.
- Published demo contains no API key and makes no direct Gemini request.
- Desktop and 360px mobile browser checks passed with no console errors or page overflow.
- GitHub Pages is configured by selecting the `main` branch and `/docs` folder.

The protected live-Gemini backend remains a future enhancement and is not required for the safe classroom demo.

### 5. Evaluation and business acceptance

Test groundedness, refusals, prompt injection, privacy leakage, accessibility, latency, and quota behaviour. Have source owners review representative answers.

Measures:

- Task-success rate
- Grounded-answer rate
- Correct-escalation rate
- Unsupported or harmful answer rate
- User satisfaction
- Response latency
- Estimated cost or quota use

Gate: Kevin and Joan approve the release checklist; critical safety tests pass.

### 6. Limited pilot

Use a small audience and low-risk questions. Provide feedback, incident reporting, corrections, monitoring, and rollback.

Gate: agreed quality and reliability thresholds are met during the pilot.

### 7. GitHub publication and deployment

Kevin creates or uploads the repository and enables GitHub Pages at the end.

Before publication:

- Remove secrets, customer data, and sensitive company material.
- Confirm `.env`, logs, and build output are excluded.
- Include `.env.example`, setup instructions, architecture, limitations, privacy note, test instructions, and license.
- Deploy the protected backend separately and configure only its public endpoint in the frontend.
- Restrict credentials and add server-side rate limiting and abuse controls.

Status: **LLM-enabled submission architecture deployed.**

- GitHub Pages remains the public classroom URL.
- Every chat message and bounded recent history is sent to a protected Vercel Function.
- Gemini receives the original user input plus approved fictional inventory facts.
- The Gemini key is stored only as a sensitive Vercel Production environment variable.
- The browser displays whether a reply was produced by Gemini and shows an honest service error when the backend is unavailable.

### 8. Operate and improve

Maintain a content-review schedule, stale-source checks, incident process, regression tests, and recorded model/prompt versions.

## First working session

Before coding, answer these questions:

1. What company or business function is the chatbot for?
2. Who are its first users?
3. What are the top three questions it should answer?
4. Which existing documents or web pages contain the approved answers?
5. What must it never answer or collect?
6. Who should receive a conversation when the chatbot cannot help?
