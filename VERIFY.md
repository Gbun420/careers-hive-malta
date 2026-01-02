# Verification Report

## Repo build verification
- Command: `npm run review`
- Expected: PASS (lint, typecheck, build)

## Dev billing proof routes verification
Never paste secrets into chat; set env locally.

### Status route
- Command: `curl -i http://localhost:3005/api/dev/billing/status`
- Expected (dev): `200` JSON with:
  - `billingConfigured` boolean
  - `hasSecretKey` boolean
  - `hasFeaturedPriceId` boolean
  - `featuredDurationDays` number
  - `priceLabel` string|null
  - `featuredPriceId` string|null
  - `featuredPriceValid` boolean|null
- Expected (prod): `404` JSON `{ "error": { "code": "NOT_FOUND" } }`

### Stripe price validity check
- Command: `curl -i http://localhost:3005/api/dev/billing/validate-price -H "x-dev-secret: $DEV_TOOLS_SECRET"`
- Expected (valid): `200` JSON with `priceId`, `currency`, `unit_amount`, `product`, `livemode`.
- Expected (invalid): `400` `STRIPE_PRICE_INVALID` with Stripe details.

### Create checkout route
- Wrong secret:
  - Command: `curl -i -X POST http://localhost:3005/api/dev/billing/create-checkout \
  -H "content-type: application/json" \
  -H "x-dev-secret: wrong" \
  -d '{"job_id":"demo"}'`
  - Expected: `401` JSON `{ "error": { "code": "UNAUTHORIZED" } }`
- Correct secret, Stripe missing:
  - Command: `curl -i -X POST http://localhost:3005/api/dev/billing/create-checkout \
  -H "content-type: application/json" \
  -H "x-dev-secret: $DEV_TOOLS_SECRET" \
  -d '{"job_id":"<job-id>"}'`
  - Expected: `503` JSON `{ "error": { "code": "STRIPE_NOT_CONFIGURED" } }`
- Stripe present (optional):
  - Expected: `200` JSON `{ "url": "https://checkout.stripe.com/...", "session_id": "cs_test_..." }`

### Troubleshooting matrix
- `STRIPE_PRICE_INVALID`: confirm `STRIPE_FEATURED_PRICE_ID` exists and matches secret key mode (test vs live).
- `STRIPE_AUTH_ERROR`: rotate Stripe secret key; confirm mode matches price id.
- `STRIPE_ERROR`: check `error.details.stripe_type` / `stripe_message`.
- `DB_INSERT_FAILED`: apply `0004_billing.sql`, confirm purchases table exists.

## Regression checklist
- Login page loads (no prerender crash).
- Signup page loads.
- Employer jobs page loads.
- Pricing page loads.
- /jobs list loads with Meili on/off.
- Feature CTA disabled when Stripe missing.

## Dev routes presence
- `app/api/dev/billing/status/route.ts`
- `app/api/dev/billing/create-checkout/route.ts`

## Secret-handling hygiene
- No docs instruct pasting secrets into chat.
