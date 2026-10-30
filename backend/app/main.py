from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db
from app.api.procurement import router as procurement_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database schemas on startup
    init_db()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="UK Wind Generation Forecast Intelligence Platform (GB Power Market Day-Ahead Procurement)",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(procurement_router)

@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION
    }

@app.get("/")
def root():
    return {
        "project": "AEROVANTA",
        "description": "UK Wind Generation Forecast Intelligence Platform",
        "docs": "/docs",
        "health": "/api/health"
    }

