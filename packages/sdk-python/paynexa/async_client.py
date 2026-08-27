"""
Asynchronous PayNexa API Client for modern asyncio and FastAPI environments.
"""

from typing import Dict, Any, Optional
import aiohttp
from .exceptions import PayNexaAPIError, AuthenticationError, InvalidRequestError
from .resources import PaymentIntentResource, VirtualCardResource, LedgerResource, WebhookResource

class AsyncPayNexaClient:
    """Asynchronous client for the PayNexa Next-Generation Payment Platform."""

    def __init__(
        self,
        api_key: str,
        base_url: str = "http://localhost:4000/api/v1",
        timeout: float = 30.0,
    ):
        if not api_key:
            raise AuthenticationError("PayNexa API key cannot be empty.")

        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.timeout = aiohttp.ClientTimeout(total=timeout)
        self._session: Optional[aiohttp.ClientSession] = None

    async def _get_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "User-Agent": "PayNexa-Python-AsyncSDK/1.0.0",
            }
            self._session = aiohttp.ClientSession(
                headers=headers,
                timeout=self.timeout
            )
        return self._session

    async def close(self):
        """Closes the underlying aiohttp session."""
        if self._session and not self._session.closed:
            await self._session.close()

    async def request(
        self,
        method: str,
        path: str,
        params: Optional[Dict[str, Any]] = None,
        json_data: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None,
    ) -> Dict[str, Any]:
        """Executes an asynchronous HTTP request against PayNexa API."""
        session = await self._get_session()
        url = f"{self.base_url}{path}"

        req_headers = {}
        if headers:
            req_headers.update(headers)

        async with session.request(
            method=method,
            url=url,
            params=params,
            json=json_data,
            headers=req_headers
        ) as resp:
            text = await resp.text()
            try:
                payload = await resp.json()
            except Exception:
                raise PayNexaAPIError(
                    f"Invalid non-JSON response from server (Status {resp.status}): {text[:100]}",
                    status_code=resp.status
                )

            if not resp.ok or not payload.get("success", False):
                err = payload.get("error", {})
                msg = err.get("message", f"Request failed with status {resp.status}")
                code = err.get("code", "api_error")
                if resp.status == 401:
                    raise AuthenticationError(msg, status_code=resp.status, code=code)
                elif resp.status in (400, 422):
                    raise InvalidRequestError(msg, status_code=resp.status, code=code)
                raise PayNexaAPIError(msg, status_code=resp.status, code=code)

            return payload.get("data", {})
