from fastapi import APIRouter, Depends, Query, HTTPException, Header
from typing import Optional, List
import os
import datetime

from models.request_model import CVRequest
from services.ai_service import (
    suggest_cv_content,
    match_and_store,
    match_jobs_for_cvs,
    get_recommend_batches_for_user,
    get_recommend_batch_detail,
    JobNotFound,
    DBError,
)
from utils.lang_utils import detect_language
from auth.dependencies import require_roles

router = APIRouter(prefix="/api/recommend-service", tags=["Recommend Service"])

try:
    import psutil
except Exception:
    psutil = None

@router.post("/suggest")
async def suggest_route(
    req: CVRequest,
    current_user=Depends(require_roles("CANDIDATE"))
):
    language = req.language or "auto"
    if language == "auto":
        language = detect_language(req.content)
    ai_result = await suggest_cv_content(
        language, req.position, req.section, req.content, req.styles, current_user.user_id
    )
    return ai_result

@router.get("/match/{job_id}")
async def match(job_id: str, top_k: int = Query(10, ge=1, le=50), current_user=Depends(require_roles("EMPLOYER"))):
    try:
        result = await match_and_store(job_id, current_user.user_id, top_k)
        return result
    except JobNotFound:
        raise HTTPException(status_code=404, detail="Job embedding not found")
    except DBError:
        raise HTTPException(status_code=500, detail="Database query failed")
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/recommend_batches/{job_id}")
async def list_recommend_batches(
    job_id: str,
    limit: int = Query(10, ge=1, le=200),
    current_user = Depends(require_roles("EMPLOYER", "ADMIN"))
):
    try:
        user_id = None if "admin" in current_user.roles else current_user.user_id
        batches = await get_recommend_batches_for_user(user_id, job_id=job_id, limit=limit)
        return batches
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/recommend_batches/{batch_id}/detail")
async def recommend_batch_detail(
    batch_id: str,
    current_user = Depends(require_roles("EMPLOYER", "ADMIN")),
):
    try:
        batch = await get_recommend_batch_detail(batch_id)
        # Permission: non-admins may only view their own batches
        if "admin" not in current_user.roles and batch.get("user_id") != current_user.user_id:
            raise HTTPException(status_code=403, detail="Bạn không có quyền truy cập tài nguyên này.")
        return batch
    except ValueError:
        raise HTTPException(status_code=404, detail="Batch not found")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/suggest_jobs")
async def suggest_jobs_for_cvs(
    cv_ids: List[str],
    top_k: int = Query(20, ge=1, le=200),
    current_user=Depends(require_roles("CANDIDATE")),
):
    try:
        results = await match_jobs_for_cvs(cv_ids, top_k=top_k)
        return results
    except DBError:
        raise HTTPException(status_code=500, detail="Database query failed")
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/health")
async def health(x_internal_secret: Optional[str] = Header(None, alias="X-Internal-Secret")):
    internal_secret = os.environ.get("INTERNAL_SECRET")
    if internal_secret is None or x_internal_secret != internal_secret:
        raise HTTPException(status_code=403, detail="Bạn không có quyền truy cập tài nguyên này.")

    status = "UP"
    if psutil:
        process = psutil.Process(os.getpid())
        try:
            cpu = process.cpu_percent(interval=0.1)
        except Exception:
            cpu = 0.0

        try:
            mem_bytes = process.memory_info().rss
            memory = round(mem_bytes / (1024 * 1024))  # MB
        except Exception:
            memory = 0
    else:
        cpu = 0.0
        memory = 0

    return {
        "service": os.environ.get("SERVICE_NAME", "recommend-service"),
        "status": status,
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "cpu": round(cpu, 1),
        "memory": memory,
    }
