"""
PayNexa Python SDK: SwiftResource
Description: SWIFT MT103 and MT940 wire transfers
"""

from typing import Dict, Any, Optional, List
import json
import urllib.request
import urllib.error

class SwiftResource:
    def __init__(self, base_url: str, api_key: str, timeout: int = 30):
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key
        self.timeout = timeout

    def _request(self, method: str, endpoint: str, data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        url = f"{self.base_url}{endpoint}"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "User-Agent": "PayNexa-Python-SDK/1.0.0",
        }

        body_bytes = json.dumps(data).encode('utf-8') if data else None
        req = urllib.request.Request(url, data=body_bytes, headers=headers, method=method)

        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                resp_text = resp.read().decode('utf-8')
                return json.loads(resp_text)
        except urllib.error.HTTPError as e:
            error_body = e.read().decode('utf-8')
            try:
                err_json = json.loads(error_body)
                raise RuntimeError(f"PayNexa API Error {e.code}: {err_json.get('error', error_body)}")
            except Exception:
                raise RuntimeError(f"PayNexa API Error {e.code}: {error_body}")
        except Exception as e:
            raise RuntimeError(f"PayNexa Request Failed: {e}")

    def list(self, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        query = f"?{urllib.parse.urlencode(params)}" if params else ""
        return self._request("GET", f"/swift{query}")

    def get(self, resource_id: str) -> Dict[str, Any]:
        return self._request("GET", f"/swift/{resource_id}")

    def create(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return self._request("POST", f"/swift", payload)
