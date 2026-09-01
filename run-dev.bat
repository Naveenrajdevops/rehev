@echo off
echo ===================================================
echo   REHABAI PRO - AI Rehabilitation Intelligence
echo ===================================================
echo.

echo [*] Starting Frontend (Vite) and Backend (FastAPI)...
echo.

start "RehabAI Backend API" cmd /k "cd backend && python -m uvicorn app.main:app --reload --port 8000"
start "RehabAI Frontend UI" cmd /k "npm run dev"

echo [✓] Development servers launched!
echo     - Frontend UI: http://localhost:5173
echo     - Backend API: http://localhost:8000/api/docs
echo.
