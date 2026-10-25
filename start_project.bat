@echo off
title CareerAI - Startup Launcher
echo ===================================================
echo   CareerAI - AI Resume Screening & Recommendation
echo ===================================================
echo.
echo [1/2] Starting FastAPI Backend on port 8000...
start "CareerAI - Backend (Port 8000)" cmd /k "cd backend && python run.py"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Vite React Frontend on port 5173...
start "CareerAI - Frontend (Port 5173)" cmd /k "cd frontend && npm.cmd run dev"

echo.
echo ===================================================
echo   CareerAI services are launching in separate windows!
echo   - Frontend: http://localhost:5173
echo   - Backend:  http://localhost:8000
echo   - API Docs: http://localhost:8000/docs
echo ===================================================
echo.
pause
