# PayNexa REST API Specification (v1.0.0)

Base URL: `http://localhost:4000/api/v1`

---

## Authentication

All private endpoints require Bearer authentication:
```http
Authorization: Bearer sk_live_demo_acme_master_secret_2026
```

---

## Endpoints Summary

### 1. Payment Intents & Charges

#### `POST /payments/intents`
Creates a new payment intent.

**Request Body**:
```json
{
  "amountCents": 5000,
  "currency": "USD",
  "customerId": "usr_sarah_connor",
  "description": "Premium Subscription",
  "metadata": { "orderId": "ORD-101" }
}
```

#### `POST /payments/intents/:id/confirm`
Confirms a payment intent with payment method details.

**Request Body (Card)**:
```json
{
  "paymentMethodType": "CARD",
  "card": {
    "cardNumber": "4532000000000000",
    "expMonth": 12,
    "expYear": 28,
    "cvv": "123",
    "holderName": "Sarah Connor"
  }
}
```

#### `POST /payments/intents/:id/verify-3ds`
Verifies a 3D Secure SMS/ACS OTP challenge.

**Request Body**:
```json
{
  "otpCode": "123456"
}
```

#### `POST /payments/intents/:id/refund`
Processes a partial or full refund.

**Request Body**:
```json
{
  "amountCents": 5000,
  "reason": "REQUESTED_BY_CUSTOMER"
}
```

---

### 2. Virtual Cards

#### `POST /cards`
Issues a new virtual card.

**Request Body**:
```json
{
  "cardholderName": "Alex Chen",
  "brand": "VISA",
  "formFactor": "GENERAL_PURPOSE",
  "spendingLimits": {
    "monthlyMaxCents": 500000
  }
}
```

#### `POST /cards/:id/toggle-freeze`
Toggles freeze state of virtual card.

---

### 3. Ledger & Double-Entry Transfers

#### `POST /ledger/transfer`
Executes an atomic P2P fund transfer.

**Request Body**:
```json
{
  "sourceAccountId": "acc_01",
  "destinationAccountId": "acc_02",
  "amountCents": 2500,
  "currency": "USD",
  "description": "Dinner split"
}
```

#### `GET /ledger/audit`
Returns mathematical audit of ledger integrity ($\sum D \equiv \sum C$).

---

### 4. Fraud & Risk Rules

#### `GET /fraud/rules`
Lists all active risk scoring rules.

#### `POST /fraud/rules/:id/toggle`
Toggles status of a fraud rule.

---

### 5. Webhooks

#### `POST /webhooks/endpoints`
Registers a merchant webhook URL.

**Request Body**:
```json
{
  "url": "https://merchant.example.com/webhooks",
  "subscribedEvents": ["*"]
}
```
