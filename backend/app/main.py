from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from .db.database import engine, Base
from .db.seed import seed_database
from .api import auth, patients, exercises, plans, sessions, chat, reports, progress, notifications

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("rehabai-backend")

# Create database tables and seed sample data on startup
try:
    Base.metadata.create_all(bind=engine)
    seed_database()
except Exception as e:
    logger.warning(f"Database auto-init notice: {e}")

app = FastAPI(
    title="RehabAI Pro API",
    description="AI-Powered Rehabilitation Intelligence Platform API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(auth.router, prefix="/api")
app.include_router(patients.router, prefix="/api")
app.include_router(exercises.router, prefix="/api")
app.include_router(plans.router, prefix="/api")
app.include_router(sessions.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(progress.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "RehabAI Pro Backend Engine",
        "version": "1.0.0",
        "ai_engine": "Nova v2.4 (Gemini / Kinematic Inference)",
        "database": "Connected"
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global error on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please verify parameters or contact support."}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
