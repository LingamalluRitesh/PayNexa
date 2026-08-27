# ADR 0004: Synchronous Rule-Based Risk and Fraud Engine

## Status
Accepted

## Context
High-velocity card testing bots and cross-border fraud rings require sub-millisecond risk evaluation prior to card scheme authorization to minimize dispute ratios.

## Decision
We evaluate each payment intent through a scoring pipeline combining velocity sliding windows, blacklist matching, cross-border geo checks, and customizable threshold rules. The resulting score (0-100) dictates the authorization path: frictionless approval, step-up 3D Secure challenge, compliance review, or hard decline.

## Consequences
- **Positive**: Prevents chargeback loss and keeps dispute ratios below the Visa/Mastercard 0.9% threshold.
- **Positive**: Step-up 3D Secure shifts chargeback liability to the issuing bank.
