import hmac
import hashlib
import time

def verify_webhook_signature(payload: str, signature_header: str, secret: str, tolerance_seconds: int = 300) -> bool:
    """
    Verifies HMAC-SHA256 signature on incoming PayNexa webhooks.
    Header format: t=1614555555,v1=5257a869e7eceeda32ab62f1a912f24190b1e2d699635c6b959fd6377e40d5c9
    """
    try:
        parts = dict(item.split('=', 1) for item in signature_header.split(','))
        timestamp = int(parts.get('t', '0'))
        sig = parts.get('v1', '')

        now = int(time.time())
        if abs(now - timestamp) > tolerance_seconds:
            return False

        signed_payload = f"{timestamp}.{payload}".encode('utf-8')
        expected_sig = hmac.new(secret.encode('utf-8'), signed_payload, hashlib.sha256).hexdigest()

        return hmac.compare_digest(sig, expected_sig)
    except Exception:
        return False
