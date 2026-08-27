class PayNexaError(Exception):
    """Base exception for all PayNexa SDK errors."""
    def __init__(self, message: str, status_code: int = None, code: str = None, details: dict = None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.code = code
        self.details = details or {}

class AuthenticationError(PayNexaError):
    """Raised when API key is missing or invalid."""
    pass

class IdempotencyError(PayNexaError):
    """Raised when an idempotency key conflict occurs."""
    pass

class FraudBlockedError(PayNexaError):
    """Raised when high-risk payment is declined by fraud engine."""
    pass
