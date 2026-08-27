import json
import urllib.request
import urllib.error
from typing import Dict, Any, Optional
from .exceptions import PayNexaError, AuthenticationError
from .resources import PaymentResource, CardResource, LedgerResource
from .crypto import verify_webhook_signature

class PayNexa:
    """Official Python Client for PayNexa Payment Platform (Zero-Dependency)."""
    def __init__(self, api_key: str, base_url: str = 'http://localhost:4000/api/v1', timeout: int = 30):
        if not api_key:
            raise AuthenticationError("API Key is required to initialize PayNexa client.")
        self.api_key = api_key
        self.base_url = base_url.rstrip('/')
        self.timeout = timeout
        self.payments = PaymentResource(self)
        self.cards = CardResource(self)
        self.ledger = LedgerResource(self)

    def _request(self, method: str, path: str, payload: Optional[Dict] = None, headers: Optional[Dict] = None) -> Any:
        url = f"{self.base_url}{path}"
        data_bytes = json.dumps(payload).encode('utf-8') if payload is not None else None
        
        req = urllib.request.Request(url, data=data_bytes, method=method)
        req.add_header('Authorization', f'Bearer {self.api_key}')
        req.add_header('Content-Type', 'application/json')
        req.add_header('User-Agent', 'PayNexa-Python-SDK/1.0.0')

        if headers:
            for k, v in headers.items():
                req.add_header(k, v)

        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                resp_text = resp.read().decode('utf-8')
                data = json.loads(resp_text)
                if not data.get('success', False):
                    err = data.get('error', {})
                    raise PayNexaError(
                        message=err.get('message', f'HTTP Error {resp.status}'),
                        status_code=resp.status,
                        code=err.get('code', 'request_failed'),
                        details=err.get('details')
                    )
                return data.get('data')
        except urllib.error.HTTPError as e:
            try:
                err_body = json.loads(e.read().decode('utf-8'))
                err = err_body.get('error', {})
                raise PayNexaError(
                    message=err.get('message', f'HTTP Error {e.code}'),
                    status_code=e.code,
                    code=err.get('code', 'request_failed'),
                    details=err.get('details')
                )
            except Exception:
                raise PayNexaError(f"HTTP Error {e.code}: {e.reason}", status_code=e.code)
        except Exception as e:
            raise PayNexaError(f"Request failed: {str(e)}")

    def get(self, path: str, headers: Optional[Dict] = None) -> Any:
        return self._request('GET', path, headers=headers)

    def post(self, path: str, payload: Optional[Dict] = None, headers: Optional[Dict] = None) -> Any:
        return self._request('POST', path, payload=payload, headers=headers)

    @staticmethod
    def verify_webhook(payload: str, signature_header: str, secret: str) -> bool:
        return verify_webhook_signature(payload, signature_header, secret)
