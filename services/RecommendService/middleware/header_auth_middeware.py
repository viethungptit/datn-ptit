from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from fastapi import Response

class HeaderAuthMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, skip_paths=None):
        super().__init__(app)
        self.skip_paths = skip_paths or []

    async def dispatch(self, request: Request, call_next):
        user_id = request.headers.get("X-User-Id")
        user_role = request.headers.get("X-User-Role")
        print(f"HeaderAuthMiddleware: X-User-Id={user_id}, X-User-Role={user_role}")
        
        if user_id and user_role:
            request.state.current_user = {
                "user_id": user_id,
                "roles": [user_role]
            }
        else:
            request.state.current_user = None

        response: Response = await call_next(request)
        return response
