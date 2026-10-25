"""
CareerAI — Dual Server Launcher
Launches both FastAPI Backend (port 8000) and Vite React Frontend (port 5173).
"""

import os
import sys
import subprocess
import time
import webbrowser

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(BASE_DIR, "backend")
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")

def run():
    print("=" * 65)
    print("  CareerAI — AI Resume Screening & Job Recommendation System")
    print("  Starting Backend (FastAPI) & Frontend (Vite React)...")
    print("=" * 65)

    # Launch Backend
    print("\n[1/2] Starting FastAPI Backend on http://localhost:8000 ...")
    backend_proc = subprocess.Popen(
        [sys.executable, "run.py"],
        cwd=BACKEND_DIR,
        shell=True
    )

    time.sleep(2)

    # Launch Frontend
    print("\n[2/2] Starting Vite Frontend on http://localhost:5173 ...")
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
    frontend_proc = subprocess.Popen(
        [npm_cmd, "run", "dev"],
        cwd=FRONTEND_DIR,
        shell=True
    )

    print("\n" + "=" * 65)
    print("  SUCCESS: CareerAI Services are live!")
    print("  -> Frontend: http://localhost:5173")
    print("  -> Backend API: http://localhost:8000")
    print("  -> OpenAPI Docs: http://localhost:8000/docs")
    print("  -> Demo User: demo@example.com / Demo@123")
    print("  -> Demo Admin: admin@example.com / Admin@123")
    print("  Press Ctrl+C in this terminal to stop both servers.")
    print("=" * 65 + "\n")

    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\nShutting down CareerAI services...")
        backend_proc.terminate()
        frontend_proc.terminate()
        print("Done.")

if __name__ == "__main__":
    run()
