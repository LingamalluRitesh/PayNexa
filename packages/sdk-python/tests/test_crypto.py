import unittest
import json
import time
from paynexa.crypto import generate_webhook_signature, verify_webhook_signature
from paynexa.exceptions import SignatureVerificationError

class TestPayNexaCrypto(unittest.TestCase):
    def setUp(self):
        self.secret = "whsec_test_secret_python_suite_2026"
        self.payload = json.dumps({"event": "payment_intent.succeeded", "amount": 5000})

    def test_signature_generation_and_verification(self):
        sig_header = generate_webhook_signature(self.payload, self.secret)
        self.assertTrue(sig_header.startswith("t="))
        self.assertIn(",v1=", sig_header)

        is_valid = verify_webhook_signature(self.payload, sig_header, self.secret)
        self.assertTrue(is_valid)

    def test_tampered_payload_rejection(self):
        sig_header = generate_webhook_signature(self.payload, self.secret)
        tampered_payload = json.dumps({"event": "payment_intent.succeeded", "amount": 999999})

        with self.assertRaises(SignatureVerificationError):
            verify_webhook_signature(tampered_payload, sig_header, self.secret)

    def test_expired_timestamp_rejection(self):
        past_time = int(time.time()) - 400  # 400s ago (> 300s tolerance)
        sig_header = generate_webhook_signature(self.payload, self.secret, timestamp=past_time)

        with self.assertRaises(SignatureVerificationError):
            verify_webhook_signature(self.payload, sig_header, self.secret, tolerance_seconds=300)

if __name__ == '__main__':
    unittest.main()
