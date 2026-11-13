#!/usr/bin/env python3
"""Project Orchestrator: Launches both the FastAPI backend and Vite frontend showcase.

Usage:
    python run_project.py
"""

import os
import signal
import subprocess
import sys
import time
import urllib.request
import webbrowser
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = ROOT_DIR / "frontend"

def check_backend_health(url="http://127.0.0.1:8000/health", timeout=30):
    """Polls backend until it is ready to serve requests."""
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            with urllib.request.urlopen(url, timeout=1) as response:
                if response.status == 200:
                    return True
        except Exception:
            time.sleep(0.5)
    return False

def main():
    print("=" * 72)
    print("   PROJECT ERI 5 // HYBRID QUANTUM-CLASSICAL RETINAL CLASSIFIER   ")
    print("=" * 72)
    print("Starting full-stack deployment...")
    print(f"Working Directory: {ROOT_DIR}")

    # 1. Start FastAPI Backend Process
    print("\n[1/2] Launching FastAPI Backend on http://localhost:8000...")
    backend_cmd = [sys.executable, "-m", "uvicorn", "api.main:app", "--host", "127.0.0.1", "--port", "8000"]
    backend_proc = subprocess.Popen(
        backend_cmd,
        cwd=str(ROOT_DIR),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
    )

    # Wait for backend healthcheck
    print("Waiting for PyTorch and PennyLane quantum models to pre-warm in memory...")
    if check_backend_health():
        print("  -> FastAPI Backend is ONLINE and healthy! (http://localhost:8000/health)")
        print("  -> Interactive API Docs available at http://localhost:8000/docs")
    else:
        print("  [!] Backend did not respond within 30 seconds. Continuing to frontend...")

    # 2. Start Vite Frontend Process
    print("\n[2/2] Launching React + Vite Frontend on http://localhost:5173...")
    npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
    frontend_proc = subprocess.Popen(
        [npm_cmd, "run", "dev"],
        cwd=str(FRONTEND_DIR),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
    )

    time.sleep(2)
    print("\n" + "=" * 72)
    print("   DEPLOYMENT ACTIVE // BOTH ENGINES RUNNING")
    print("   -> Frontend Showcase: http://localhost:5173")
    print("   -> Backend REST API:  http://localhost:8000")
    print("   -> Swagger API Docs:  http://localhost:8000/docs")
    print("=" * 72)
    print("Press CTRL+C to terminate both servers cleanly.\n")

    def handle_exit(sig, frame):
        print("\nShutting down servers...")
        try:
            frontend_proc.terminate()
            backend_proc.terminate()
        except Exception:
            pass
        sys.exit(0)

    signal.signal(signal.SIGINT, handle_exit)
    signal.signal(signal.SIGTERM, handle_exit)

    # Stream outputs
    try:
        while True:
            time.sleep(1)
            if backend_proc.poll() is not None:
                print("\n[!] Backend process exited unexpectedly.")
                break
            if frontend_proc.poll() is not None:
                print("\n[!] Frontend process exited unexpectedly.")
                break
    except KeyboardInterrupt:
        handle_exit(None, None)

if __name__ == "__main__":
    main()

