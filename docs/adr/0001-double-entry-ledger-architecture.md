# ADR 0001: Immutable Double-Entry Ledger Bookkeeping Architecture

## Status
Accepted

## Context
Payment processing platforms handling money transfers, multi-currency conversions, and refunds must maintain absolute financial integrity without IEEE-754 precision drift or silent balance inconsistencies.

## Decision
We enforce immutable, append-only double-entry bookkeeping across all accounts. Every transaction must be represented as a `JournalEntry` containing at least two `Posting` records where total debits strictly equal total credits. Balances are derived from normal account classifications (`ASSET`, `LIABILITY`, `EQUITY`, `REVENUE`, `EXPENSE`) and stored as integer minor units (cents/satoshis).

## Consequences
- **Positive**: Impossible to create or destroy money without balancing journal entries.
- **Positive**: Full auditability and compliance with financial regulations (SOC 2, ISO 20022).
- **Negative**: Higher storage requirements due to append-only postings, mitigated by index compaction.
