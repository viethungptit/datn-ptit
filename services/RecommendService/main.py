from contextlib import asynccontextmanager
from api import controller
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from rabbitmq import start_rabbit_listener
import uvicorn
import logging
from dotenv import load_dotenv
from middleware.header_auth_middeware import HeaderAuthMiddleware
from fastapi.openapi.utils import get_openapi
import asyncio
import logging
from db import get_pool, close_pool
import os
load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("recommend_server")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await get_pool()
    asyncio.create_task(start_rabbit_listener())
    logger.info("[🚀] Match Service started")

    yield 

    # Shutdown
    await close_pool()
    logger.info("[🛑] Match Service stopped")

app = FastAPI(
    title="Recommend Service API",
    redoc_url=None,
    lifespan=lifespan,
    openapi_url="/v3/api-docs",
)

# Thêm middleware (giống Filter)
app.add_middleware(HeaderAuthMiddleware)

# Include routers
app.include_router(controller.router)

@app.get("/")
def root():
    return {
        # OpenAI
        "OPENAI_API_KEY": os.getenv("OPENAI_API_KEY"),

        # PostgreSQL
        "POSTGRES_HOST": os.getenv("POSTGRES_HOST"),
        "POSTGRES_PORT": os.getenv("POSTGRES_PORT"),
        "POSTGRES_DB": os.getenv("POSTGRES_DB"),
        "POSTGRES_USER": os.getenv("POSTGRES_USER"),
        "POSTGRES_PASSWORD": os.getenv("POSTGRES_PASSWORD"),

        # RabbitMQ
        "RABBITMQ_URL": os.getenv("RABBITMQ_URL"),
        "EMBEDDING_EXCHANGE": os.getenv("EMBEDDING_EXCHANGE"),
        "EMBEDDING_CV_QUEUE": os.getenv("EMBEDDING_CV_QUEUE"),
        "EMBEDDING_CV_ROUTING_KEY": os.getenv("EMBEDDING_CV_ROUTING_KEY"),
        "EMBEDDING_JD_QUEUE": os.getenv("EMBEDDING_JD_QUEUE"),
        "EMBEDDING_JD_ROUTING_KEY": os.getenv("EMBEDDING_JD_ROUTING_KEY"),
        "EMBEDDING_APPLICATION_QUEUE": os.getenv("EMBEDDING_APPLICATION_QUEUE"),
        "EMBEDDING_APPLICATION_ROUTING_KEY": os.getenv("EMBEDDING_APPLICATION_ROUTING_KEY"),
        "EMBEDDING_DELETE_APPLICATION_ROUTING_KEY": os.getenv("EMBEDDING_DELETE_APPLICATION_ROUTING_KEY"),
        "EMBEDDING_DELETE_QUEUE": os.getenv("EMBEDDING_DELETE_QUEUE"),
        "EMBEDDING_DELETE_CV_ROUTING_KEY": os.getenv("EMBEDDING_DELETE_CV_ROUTING_KEY"),
        "EMBEDDING_DELETE_JD_ROUTING_KEY": os.getenv("EMBEDDING_DELETE_JD_ROUTING_KEY"),

        # Other services
        "RECRUIT_SERVICE_URL": os.getenv("RECRUIT_SERVICE_URL"), 
        "INTERNAL_SECRET": os.getenv("INTERNAL_SECRET"),
        "MINIO_URL": os.getenv("MINIO_URL"),
    }

# Tùy chỉnh OpenAPI để thêm header X-User-Id và X-User-Role vào tất cả các endpoint
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
