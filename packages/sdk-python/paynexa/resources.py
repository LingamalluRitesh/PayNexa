from typing import Dict, Any, List, Optional

class Resource:
    def __init__(self, client):
        self.client = client

class PaymentResource(Resource):
    def create(self, amount_cents: int, currency: str, customer_id: Optional[str] = None, idempotency_key: Optional[str] = None, metadata: Optional[Dict] = None) -> Dict[str, Any]:
        headers = {'Idempotency-Key': idempotency_key} if idempotency_key else None
        return self.client.post('/payments/intents', {
            'amountCents': amount_cents,
            'currency': currency,
            'customerId': customer_id,
            'metadata': metadata or {}
        }, headers=headers)

    def retrieve(self, payment_intent_id: str) -> Dict[str, Any]:
        return self.client.get(f'/payments/intents/{payment_intent_id}')

    def confirm(self, payment_intent_id: str, payment_method_type: str, card: Optional[Dict] = None, upi: Optional[Dict] = None) -> Dict[str, Any]:
        return self.client.post(f'/payments/intents/{payment_intent_id}/confirm', {
            'paymentMethodType': payment_method_type,
            'card': card,
            'upi': upi
        })

    def refund(self, payment_intent_id: str, amount_cents: Optional[int] = None, reason: str = 'REQUESTED_BY_CUSTOMER') -> Dict[str, Any]:
        return self.client.post(f'/payments/intents/{payment_intent_id}/refund', {
            'amountCents': amount_cents,
            'reason': reason
        })

class CardResource(Resource):
    def create(self, cardholder_name: str, currency: str = 'USD', spending_limits: Optional[Dict] = None) -> Dict[str, Any]:
        return self.client.post('/cards', {
            'cardholderName': cardholder_name,
            'currency': currency,
            'spendingLimits': spending_limits
        })

    def list(self) -> List[Dict[str, Any]]:
        return self.client.get('/cards')

    def toggle_freeze(self, card_id: str) -> Dict[str, Any]:
        return self.client.post(f'/cards/{card_id}/toggle-freeze')

class LedgerResource(Resource):
    def list_accounts(self) -> List[Dict[str, Any]]:
        return self.client.get('/ledger/accounts')

    def transfer(self, source_account_id: str, destination_account_id: str, amount_cents: int, currency: str, description: str, idempotency_key: Optional[str] = None) -> Dict[str, Any]:
        headers = {'Idempotency-Key': idempotency_key} if idempotency_key else None
        return self.client.post('/ledger/transfer', {
            'sourceAccountId': source_account_id,
            'destinationAccountId': destination_account_id,
            'amountCents': amount_cents,
            'currency': currency,
            'description': description
        }, headers=headers)
