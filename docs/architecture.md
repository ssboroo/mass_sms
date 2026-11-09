# Mass SMS architecture

## Product shape

Mass SMS is an API-first product. The Next.js web application and future iOS/Android clients use the same versioned HTTP API. Provider credentials and all payment, credit, and dispatch decisions remain server-side.

- Web: Next.js App Router
- Mobile: Expo + React Native (planned; no separate business logic)
- API: versioned REST endpoints under `/api/v1`
- Database: Railway PostgreSQL via Prisma
- Payments: Wire hosted checkout; credit only after verified webhook
- SMS: WeSend bulk API; batch status reconciliation

## Core boundaries

1. Identity: registration, login, sessions, verification, account status.
2. Directory: Mongolian numbering-plan ranges and operator metadata, kept separate from customer address books.
3. Contacts: tenant-owned contacts, consent evidence, and suppression list.
4. Billing: immutable credit ledger, payment records, idempotent webhook processing.
5. Campaigns: estimate, validate, reserve credits, submit provider batches, reconcile statuses and refunds.
6. Reporting: tenant-scoped campaign and usage summaries.

## API contract direction

All clients use JSON over HTTPS and bearer session tokens. Every tenant-owned query must be scoped by the authenticated user ID on the server. API responses use stable resource IDs and ISO-8601 timestamps. Breaking changes require a new API version.

Initial endpoint map:
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/me`
- `GET /api/v1/credits`
- `GET /api/v1/credits/packages`
- `POST /api/v1/payments`
- `POST /api/v1/webhooks/wire`
- `GET|POST /api/v1/contacts`
- `POST /api/v1/contacts/import`
- `POST /api/v1/campaigns/estimate`
- `POST /api/v1/campaigns`
- `GET /api/v1/campaigns/:id`
- `GET /api/v1/reports/usage`

## Credit and dispatch invariants

- Store credits as integer MNT-equivalent units; never use floating-point arithmetic.
- Every credit mutation creates a unique ledger entry with an idempotency key.
- Verify Wire webhook signatures and persist provider event IDs before applying a top-up.
- Reserve campaign credits transactionally before contacting WeSend.
- Use provider idempotency where supported; persist provider batch IDs and reconcile status.
- Refund only confirmed failed/undelivered billable units according to the provider's final result.
- Never trust a client-supplied price, credit balance, user ID, or provider status.

## Mongolian number directory

The national numbering directory is metadata, not a list of subscribers or personal phone numbers. Store prefix allocations with source name, source URL, verification timestamp, and validity period. Prefix matching is longest-prefix-first and must not be presented as proof of current operator after number portability. Unknown prefixes remain valid-format numbers but have an unknown operator.

Seed data must be imported from a current authoritative public numbering-plan source and reviewed before production use. Do not fabricate prefix-to-operator mappings. A customer's contact list is private, tenant-scoped data and requires a lawful basis/consent for campaign use.

## Deployment

Configure Railway PostgreSQL and set `DATABASE_URL` on the Railway service. Generate and apply Prisma migrations during controlled deployment. Do not run destructive schema resets against production.
