import logging
import httpx
from typing import Any, Optional
import os
from dotenv import load_dotenv
load_dotenv()

logger = logging.getLogger("service_client")
__all__ = ["update_status_embedding_job", "update_status_embedding_cv", "get_cv_detail", "get_user_detail"]

# Other services
RECRUIT_SERVICE_URL = os.getenv("RECRUIT_SERVICE_URL")
INTERNAL_SECRET = os.getenv("INTERNAL_SECRET")
USER_SERVICE_URL = os.getenv("USER_SERVICE_URL")


async def update_status_embedding_job(job_id: str, status: str) -> Any:
    logger.info("[DEBUG] INTERNAL_SECRET from env: %s", INTERNAL_SECRET)
    url = f"{RECRUIT_SERVICE_URL.rstrip('/')}/api/recruit-service/jobs/{job_id}/status-embedding"
    params = {"status": status}
    headers = {"X-Internal-Secret": INTERNAL_SECRET}
    logger.debug("Updating job embedding status: url=%s, params=%s", url, params)
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.put(url, params=params, headers=headers)
            resp.raise_for_status()
            try:
                return resp.json()
            except ValueError:
                return resp.text 
    except Exception:
        logger.exception("Failed to update job embedding status for job_id=%s", job_id)
        raise


async def update_status_embedding_cv(cv_id: str, status: str) -> Any:
    logger.info("[DEBUG] INTERNAL_SECRET from env: %s", INTERNAL_SECRET)
    url = f"{RECRUIT_SERVICE_URL.rstrip('/')}/api/recruit-service/cvs/{cv_id}/status-embedding"
    params = {"status": status}
    headers = {"X-Internal-Secret": INTERNAL_SECRET}
    logger.debug("Updating CV embedding status: url=%s, params=%s, RECRUIT_SERVICE_URL=%s", url, params, RECRUIT_SERVICE_URL)
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.put(url, params=params, headers=headers)
            resp.raise_for_status()
            try:
                return resp.json()
            except ValueError:
                return resp.text
    except Exception:
        logger.exception("Failed to update CV embedding status for cv_id=%s", cv_id)
        raise

async def get_cv_details_batch(cv_ids: list[str]) -> dict:
    url = f"{RECRUIT_SERVICE_URL.rstrip('/')}/api/recruit-service/cvs/by-cvIds"
    headers = {"X-Internal-Secret": INTERNAL_SECRET}
    logger.debug("Fetching batch CV details: url=%s", url)
    logger.info("[DEBUG] INTERNAL_SECRET from env: %s", INTERNAL_SECRET)

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, json=cv_ids, headers=headers)
            resp.raise_for_status()
            cv_list = resp.json()

            # Convert list → dict {cv_id: cv_data}
            return {cv["cvId"]: cv for cv in cv_list}

    except Exception:
        logger.exception("Failed to fetch batch CVs: %s", cv_ids)
        return {}