# ADR 0003: Webhook Delivery Reliability and HMAC Verification

## Status
Accepted

## Context
Merchants require real-time asynchronous notifications for payment confirmations, refunds, and dispute events with tamper-proof security.

## Decision
All webhook payloads are dispatched with an `HMAC-SHA256` signature header formatted as `t=timestamp,v1=signature`. The timestamp is verified within a 300-second tolerance window to prevent replay attacks. Deliveries employ exponential backoff retries ($2^n \times 1\text{s}$) up to 5 attempts, logging latency, response bodies, and HTTP status codes.

## Consequences
- **Positive**: Cryptographically secured event delivery.
- **Positive**: Complete audit logs and merchant self-serve replay capabilities.
