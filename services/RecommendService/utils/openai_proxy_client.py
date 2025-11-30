import os
import logging
from typing import Any, Dict, Optional
import httpx
import requests

logger = logging.getLogger("openai-proxy-client")

OPENAI_KEY = os.getenv("OPENAI_API_KEY")
PROXY_URL = os.getenv("PROXY_URL") 
PROXY_TOKEN = os.getenv("PROXY_TOKEN")
DEFAULT_TIMEOUT = float(os.getenv("DEFAULT_TIMEOUT", "60.0"))


def _build_headers_sync(extra_headers: Optional[Dict[str, str]] = None) -> Dict[str, str]:
    headers = {"Content-Type": "application/json"}
    if PROXY_URL:
        # proxy auth via x-proxy-token
        if PROXY_TOKEN:
            headers["x-proxy-token"] = PROXY_TOKEN
    else:
        if not OPENAI_KEY:
            raise RuntimeError("OPENAI_API_KEY not configured")
        headers["Authorization"] = f"Bearer {OPENAI_KEY}"
    if extra_headers:
        headers.update(extra_headers)
    return headers


def _build_headers_async(extra_headers: Optional[Dict[str, str]] = None) -> Dict[str, str]:
    # same logic, separate function for clarity
    return _build_headers_sync(extra_headers)


def send_openai_request_sync(
    path: str,
    json_body: Dict[str, Any],
    method: str = "POST",
    extra_headers: Optional[Dict[str, str]] = None,
    timeout: Optional[float] = None,
) -> requests.Response:
    """
    Sync request helper. `path` is the path under /v1, e.g. "chat/completions" or "embeddings".
    Returns requests.Response (raise_for_status not called here).
    """
    timeout = timeout or DEFAULT_TIMEOUT
    if PROXY_URL:
        url = PROXY_URL.rstrip("/") + f"/v1/{path.lstrip('/')}"
    else:
        url = f"https://api.openai.com/v1/{path.lstrip('/')}"
    headers = _build_headers_sync(extra_headers)
    logger.debug("Sending sync request to %s (proxy=%s)", url, bool(PROXY_URL))
    resp = requests.request(method=method, url=url, json=json_body, headers=headers, timeout=timeout)
    return resp


async def send_openai_request_async(
    path: str,
    json_body: Dict[str, Any],
    method: str = "POST",
    extra_headers: Optional[Dict[str, str]] = None,
    timeout: Optional[float] = None,
) -> httpx.Response:
    """
    Async request helper using httpx.AsyncClient
    Returns httpx.Response.
    """
    timeout = timeout or DEFAULT_TIMEOUT
    if PROXY_URL:
        url = PROXY_URL.rstrip("/") + f"/v1/{path.lstrip('/')}"
    else:
        url = f"https://api.openai.com/v1/{path.lstrip('/')}"
    headers = _build_headers_async(extra_headers)
    logger.debug("Sending async request to %s (proxy=%s)", url, bool(PROXY_URL))
    async with httpx.AsyncClient(timeout=httpx.Timeout(timeout)) as client:
        resp = await client.request(method=method, url=url, json=json_body, headers=headers)
        return resp