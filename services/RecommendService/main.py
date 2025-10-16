from api import controller
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging
from dotenv import load_dotenv
from middleware.header_auth_middeware import HeaderAuthMiddleware
from fastapi.openapi.utils import get_openapi
import os
load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("recommend_server")

app = FastAPI(
    title="Recommend Service API",
    redoc_url=None,
    openapi_url="/v3/api-docs"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Thêm middleware (giống Filter)
app.add_middleware(HeaderAuthMiddleware)

# Include routers
app.include_router(controller.router)

@app.get("/")
def root():
    return {
        "OPENAI_API_KEY": os.getenv("OPENAI_API_KEY"),
    }

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="Recommend Service API",
        version="1.0",
        description="Recommend Service that trusts Gateway to authenticate and passes X-User-Id / X-User-Role(s)",
        routes=app.routes,
    )

     # === Thêm phần Security (Bearer Auth) ===
    security_scheme = {
        "bearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }

    openapi_schema.setdefault("components", {}).setdefault("securitySchemes", {}).update(security_scheme)
    openapi_schema.setdefault("security", []).append({"bearerAuth": []})

    components = openapi_schema.setdefault("components", {})
    parameters = components.setdefault("parameters", {})
    parameters["X-User-Id"] = {
        "name": "X-User-Id",
        "in": "header",
        "required": False,
        "schema": {"type": "string"},
        "description": "User ID (UUID) provided by Gateway"
    }
    parameters["X-User-Role"] = {
        "name": "X-User-Role",
        "in": "header",
        "required": False,
        "schema": {"type": "string"},
        "description": "Single role (e.g. ADMIN, CANDIDATE, EMPLOYER) provided by Gateway"
    }

    for path_item in openapi_schema.get("paths", {}).values():
        for operation in path_item.values():
            operation.setdefault("parameters", [])
            refs = {p.get("$ref") for p in operation["parameters"] if isinstance(p, dict) and p.get("$ref")}
            if "#/components/parameters/X-User-Id" not in refs:
                operation["parameters"].append({"$ref": "#/components/parameters/X-User-Id"})
            if "#/components/parameters/X-User-Role" not in refs:
                operation["parameters"].append({"$ref": "#/components/parameters/X-User-Role"})
        
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=5002, reload=True)
