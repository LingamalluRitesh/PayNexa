# PayNexa Python SDK

The official Python client library for integrating with PayNexa's Next-Generation Payment Platform.

## Installation

```bash
pip install paynexa
```

## Quickstart

```python
from paynexa import PayNexa

# Initialize with secret API key
client = PayNexa(api_key="sk_live_demo_key_123")

# Create a Payment Intent
intent = client.payments.create(
    amount_cents=5000, # $50.00
    currency="USD",
    idempotency_key="unique_tx_12345"
)
print("Created intent:", intent["id"], "Client secret:", intent["clientSecret"])

# Issue a Virtual Card
card = client.cards.create(
    cardholder_name="Alex Morgan",
    currency="USD",
    spending_limits={"perTransactionMaxCents": 10000, "dailyMaxCents": 50000, "monthlyMaxCents": 200000}
)
print("Issued card:", card["panMasked"], "Status:", card["status"])
```

## Webhook Verification

```python
from paynexa import verify_webhook_signature

is_valid = verify_webhook_signature(raw_payload, signature_header, secret="whsec_...")
if is_valid:
    print("Webhook verified successfully")
```
