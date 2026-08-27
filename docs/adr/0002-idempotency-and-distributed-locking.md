# ADR 0002: Idempotency Key Handling and Deduplication

## Status
Accepted

## Context
Network timeouts, packet loss, or aggressive retry policies from merchant servers can cause duplicate charges if a client retries a payment creation request.

## Decision
We implement mandatory idempotency keys via the `Idempotency-Key` HTTP header on mutating endpoints (`POST`, `PUT`, `PATCH`). The server stores a cryptographic hash of the payload alongside the first generated response for 24 hours. Subsequent identical requests return the cached response with `Idempotent-Replay: true`. Requests with the same key but conflicting payloads are rejected with `HTTP 409 Conflict`.

## Consequences
- **Positive**: Zero risk of duplicate customer debits or double payouts.
- **Positive**: Complies with Stripe/Adyen API standard conventions.
