import requests
from typing import Dict, Any, Optional
from .exceptions import PayNexaError, AuthenticationError
from .resources import PaymentResource, CardResource, LedgerResource
from .crypto import verify_webhook_signature

class PayNexa:
    """Official Python Client for PayNexa Payment Platform."""
    def __init__(self, api_key: str, base_url: str = 'http://localhost:4000/api/v1', timeout: int = 30):
        if not api_key:
            raise AuthenticationError("API Key is required to initialize PayNexa client.")
        self.api_key = api_key
        self.base_url = base_url.rstrip('/')
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json',
            'User-Agent': 'PayNexa-Python-SDK/1.0.0'
        })

        self.payments = PaymentResource(self)
        self.cards = CardResource(self)
        self.ledger = LedgerResource(self)

    def _request(self, method: str, path: str, payload: Optional[Dict] = None, headers: Optional[Dict] = None) -> Any:
        url = f"{self.base_url}{path}"
        req_headers = headers or {}
        try:
            resp = self.session.request(method, url, json=payload, headers=req_headers, timeout=self.timeout)
            data = resp.json()
            if not resp.ok or not data.get('success', False):
                err = data.get('error', {})
                raise PayNexaError(
                    message=err.get('message', f'HTTP Error {resp.status_code}'),
                    status_code=resp.status_code,
                    code=err.get('code', 'request_failed'),
                    details=err.get('details')
                )
            return data.get('data')
        except requests.RequestException as e:
            raise PayNexaError(f"HTTP Request failed: {str(e)}")

    def get(self, path: str, headers: Optional[Dict] = None) -> Any:
        return self._request('GET', path, headers=headers)

    def post(self, path: str, payload: Optional[Dict] = None, headers: Optional[Dict] = None) -> Any:
        return self._request('POST', path, payload=payload, headers=headers)

    @staticmethod
    def verify_webhook(payload: str, signature_header: str, secret: str) -> bool:
        return verify_webhook_signature(payload, signature_header, secret)
