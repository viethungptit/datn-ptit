from fastapi import APIRouter, Depends
from models.request_model import CVRequest
from services.ai_service import suggest_cv_content
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

    ai_result = suggest_cv_content(
        language, req.position, req.section, req.content, req.styles or "professional"
    )

    return {
        "user_id": current_user.user_id,
        "roles": current_user.roles,
        "original_content": req.content,
        "ai_result": ai_result,
    }


@router.get("/health")
async def health(current_user=Depends(require_roles("CANDIDATE", "EMPLOYER", "ADMIN"))):
    return {
        "status": "ok",
        "user_id": current_user.user_id,
        "roles": current_user.roles,
    }
