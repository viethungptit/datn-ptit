from fastapi import Depends, HTTPException, status, Request
from .models import CurrentUser

def get_current_user(request: Request) -> CurrentUser:
    """
    Lấy user từ request.state (do middleware set).
    Nếu không có -> raise 401.
    """
    cu = getattr(request.state, "current_user", None)
    if not cu:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication headers (X-User-Id and X-User-Role(s))",
        )
    return CurrentUser(user_id=cu["user_id"], roles=cu["roles"])


def require_roles(*roles: str):
    """
    Dependency để kiểm tra quyền user dựa vào roles được chỉ định.
    """
    def checker(request: Request):
        user = get_current_user(request)
        user_roles = [r.upper() for r in user.roles]

        # Không có quyền phù hợp → 403
        if not any(role.upper() in user_roles for role in roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Forbidden: required roles {roles}, got {user_roles}",
            )
        return user

    return checker
