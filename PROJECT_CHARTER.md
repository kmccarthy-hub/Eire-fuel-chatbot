# ÉireFuel Customer-Service Chatbot Charter

## Project statement

ÉireFuel is a fictional Irish producer of premium high-protein snack bars. Seasonal ingredient shortages and supplier delays make popular flavours temporarily unavailable, and approximately 80% of customer-service enquiries ask when a product will return.

The project will create a customer-service chatbot that provides fast, current, and honest stock information while reducing repetitive support work and helping customers find an available alternative.

## Product owner

Kevin is the product owner, final decision-maker, and eventual GitHub publisher.

## Target users

- Existing and prospective ÉireFuel customers in Ireland
- Gym-goers and athletes
- Busy professionals seeking convenient high-protein snacks

## Primary user needs

1. Determine whether a named flavour is currently available.
2. Understand why an unavailable flavour is delayed and when it may return.
3. Find a similar flavour that is currently available.
4. Request notification when a preferred flavour returns.

## MVP capabilities

- Recognise a known flavour, including common spelling variations.
- Return its current stock status and the time the data was updated.
- Explain an approved delay reason in plain language.
- Show an approved restock date or range and label it as an estimate.
- Recommend only approved alternatives that are currently in stock.
- Simulate an explicit opt-in request for a restock alert.
- Handle missing, stale, ambiguous, or conflicting information without guessing.
- Offer a route to human support.

## Out of scope

- Checkout, payments, orders, cancellations, refunds, or delivery tracking
- Medical, nutritional, allergy-safety, or athletic-performance advice
- Predicting restock dates independently
- Access to real supplier or production systems
- Personalised recommendations based on health information
- Sending real alerts during the initial academic prototype

## Authoritative information

The case study does not identify a real inventory system. The prototype will therefore use an approved fictional JSON product and stock dataset.

The structured dataset—not Gemini—is authoritative for:

- Product and flavour names
- Stock status
- Restock estimates and their confidence
- Customer-safe delay explanations
- Alternative-flavour mappings
- Ingredient and allergen statements
- Last-updated times

Gemini may explain these values conversationally but must not invent, refine, or guarantee them.

## Trust and safety rules

- Every stock answer must include when its data was last updated.
- Restock dates must be described as estimates that may change.
- Missing or stale stock information must produce an uncertainty response and support option.
- Recommendations must be checked for availability at response time.
- Allergen questions may repeat approved label information but must direct customers to product packaging and support rather than provide safety advice.
- The chatbot must not request unnecessary personal or sensitive information.
- The classroom MVP will simulate alert registration and state that no real message will be sent.
- API keys, contact data, and internal instructions must not appear in prompts returned to users, logs, GitHub, or browser code.

## Escalate to human support when

- A flavour cannot be identified after clarification.
- Stock information is missing, contradictory, or stale.
- No approved restock estimate or available alternative exists.
- A customer asks about an order, refund, complaint, adverse reaction, privacy matter, or human assistance.
- The customer disputes the chatbot's information.

The support channel and service expectations are still to be defined. The prototype may use a clearly labelled fictional address.

## Prototype data requirements

Each product record should include:

- Product ID, flavour name, aliases, and description
- Approved ingredient and allergen summary
- Stock status: `in_stock`, `low_stock`, `out_of_stock`, `discontinued`, or `unknown`
- Estimated restock date or range
- Estimate confidence: `confirmed`, `provisional`, or `unknown`
- Customer-safe delay explanation
- Similar product IDs
- Product URL and optional image
- Last-updated time and next review date

Alert simulation should record only the chosen product, a mock or user-entered email, explicit consent, and a timestamp. Contact information should be handled by application code rather than sent to Gemini.

## Initial success criteria

- No invented stock status, delay reason, or restock date in the critical test set
- Correct answers for at least 90% of supported stock questions
- Correct uncertainty or escalation for missing and stale data
- Every recommended alternative is approved and in stock when recommended
- Successful completion of stock check, alternative, and simulated alert journeys
- No secrets or unnecessary personal data in the repository, browser, or logs

Reducing repetitive staff enquiries and retaining alternative-product sales are intended business outcomes. Numerical pilot targets require stakeholder approval before being treated as commitments.

## Open decisions

- Complete flavour catalogue and approved ingredient/allergen wording
- Stock-data freshness threshold
- Customer-support email or channel and response expectations
- English-only versus Irish-language support
- Republic of Ireland versus broader delivery regions
- Exact disclaimer text for provisional estimates
- Privacy, retention, verification, cancellation, and delivery process for real alerts
- Brand colours, logo, and customer-facing tone

## Phase-one acceptance

The discovery phase is complete when Kevin approves this charter and confirms that the first version is an academic prototype using fictional stock data and simulated alerts.

