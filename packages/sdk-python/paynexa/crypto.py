import hmac
import hashlib
import time

from .exceptions import SignatureVerificationError

def generate_webhook_signature(payload: str, secret: str, timestamp: int = None) -> str:
    """
    Generates HMAC-SHA256 signature header for PayNexa webhooks.
    """
    t = timestamp if timestamp is not None else int(time.time())
    signed_payload = f"{t}.{payload}".encode('utf-8')
    sig = hmac.new(secret.encode('utf-8'), signed_payload, hashlib.sha256).hexdigest()
    return f"t={t},v1={sig}"

def verify_webhook_signature(payload: str, signature_header: str, secret: str, tolerance_seconds: int = 300) -> bool:
    """
    Verifies HMAC-SHA256 signature on incoming PayNexa webhooks.
    Header format: t=1614555555,v1=5257a869e7eceeda32ab62f1a912f24190b1e2d699635c6b959fd6377e40d5c9
    """
    try:
        parts = dict(item.split('=', 1) for item in signature_header.split(','))
        timestamp = int(parts.get('t', '0'))
        sig = parts.get('v1', '')

        if not sig or not timestamp:
            raise SignatureVerificationError("Malformed signature header format.")

        now = int(time.time())
        if abs(now - timestamp) > tolerance_seconds:
            raise SignatureVerificationError("Webhook timestamp expired tolerance window.")

        signed_payload = f"{timestamp}.{payload}".encode('utf-8')
        expected_sig = hmac.new(secret.encode('utf-8'), signed_payload, hashlib.sha256).hexdigest()

        if not hmac.compare_digest(sig, expected_sig):
            raise SignatureVerificationError("Signature mismatch.")

        return True
    except SignatureVerificationError:
        raise
    except Exception as e:
        raise SignatureVerificationError(f"Signature verification failed: {str(e)}")
