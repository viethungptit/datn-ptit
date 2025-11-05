from fastapi import APIRouter, Depends, Query, HTTPException
from models.request_model import CVRequest
from services.ai_service import suggest_cv_content, match_and_store, JobNotFound, DBError
from utils.lang_utils import detect_language
from auth.dependencies import require_roles

router = APIRouter(prefix="/api/recommend-service", tags=["Recommend Service"])

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


@router.get("/health")
async def health(current_user=Depends(require_roles("CANDIDATE", "EMPLOYER", "ADMIN"))):
    return {
        "status": "ok",
        "user_id": current_user.user_id,
        "roles": current_user.roles,
    }
