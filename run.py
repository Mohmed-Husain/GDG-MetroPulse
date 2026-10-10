"""
MetroPulse: Stadium Surge Planner - Unified Single-Command Runner
==================================================================
Starts the MetroPulse simulation platform and dashboard.

Features:
- Auto-detects if MetroPulse is already running and opens browser
- Finds available port if default port is in use
- Auto-opens web browser to simulation dashboard
- Auto-verifies and generates simulation cache if missing
- Supports CLI headless simulation mode via: python run.py --cli
"""

import os
import sys
import time
import socket
import argparse
import threading
import webbrowser
import urllib.request
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass


def is_port_in_use(port: int, host: str = "127.0.0.1") -> bool:
    """Checks if a TCP port is currently open and bound."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        return s.connect_ex((host, port)) == 0


def check_existing_metropulse(port: int) -> bool:
    """Checks if MetroPulse is already running on the given port."""
    try:
        url = f"http://127.0.0.1:{port}/api/health"
        req = urllib.request.Request(url, headers={"User-Agent": "MetroPulse-Launcher"})
        with urllib.request.urlopen(req, timeout=1.5) as resp:
            return resp.status == 200
    except Exception:
        return False


def find_available_port(start_port: int, max_attempts: int = 10) -> int:
    """Finds the first available port starting from start_port."""
    for p in range(start_port, start_port + max_attempts):
        if not is_port_in_use(p):
            return p
    return start_port


def open_browser_delayed(url: str, delay: float = 1.2):
    """Opens default browser after server initializes."""
    def _open():
        time.sleep(delay)
        try:
            print(f"[MetroPulse] Launching web browser at: {url}")
            webbrowser.open(url)
        except Exception:
            pass
    t = threading.Thread(target=_open, daemon=True)
    t.start()


def ensure_cache():
    """Ensures cached presets exist so demo runs with 0ms latency."""
    cache_dir = BASE_DIR / "cache"
    p1_cache = cache_dir / "P1.json"
    if not p1_cache.exists():
        try:
            print("[MetroPulse] Generating baseline and AI simulation caches...")
            from backend.precompute_cache import main as run_cache
            run_cache()
        except Exception as e:
            print(f"[MetroPulse] Cache note: {e}")


def main():
    parser = argparse.ArgumentParser(
        description="MetroPulse Stadium Surge Planner (GMRC / GDG Metro Hackathon)",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=int(os.getenv("PORT", 8000)),
        help="Port to serve on (default: 8000 or $PORT)",
    )
    parser.add_argument(
        "--cli",
        "-c",
        action="store_true",
        help="Run simulation directly in terminal without starting web server",
    )
    parser.add_argument(
        "--all",
        action="store_true",
        help="Run all presets (P1, P2, P3) in CLI mode",
    )
    parser.add_argument(
        "--no-browser",
        action="store_true",
        help="Do not automatically open default browser",
    )

    args, unknown = parser.parse_known_args()

    # If --cli or --all specified, delegate to simulate.py
    if args.cli or args.all:
        import simulate
        # Pass remaining arguments to simulate
        sys.argv = [sys.argv[0]] + unknown + (["--all"] if args.all else [])
        simulate.main()
        return

    # 1. Verify / generate cache
    ensure_cache()

    target_port = args.port
    app_url = f"http://localhost:{target_port}"

    # 2. Check if MetroPulse is already running on this port
    if is_port_in_use(target_port):
        if check_existing_metropulse(target_port):
            print(f"===========================================================")
            print(f"  MetroPulse Stadium Surge Planner (PS-05)")
            print(f"  Gujarat Metro Rail Corporation (GMRC)")
            print(f"===========================================================")
            print(f"  [STATUS] MetroPulse is ALREADY RUNNING and active at:")
            print(f"  -> {app_url}")
            print(f"===========================================================\n")
            if not args.no_browser:
                print(f"[MetroPulse] Opening dashboard in your default browser...")
                webbrowser.open(app_url)
            print("Server is active in background. Press Ctrl+C or close terminal to exit launcher.")
            try:
                # Keep process alive so running via batch/terminal behaves normally
                while True:
                    time.sleep(1)
            except KeyboardInterrupt:
                print("\n[MetroPulse] Exited launcher.")
                return
        else:
            # Port occupied by different application, find an alternative
            available_port = find_available_port(target_port + 1)
            print(f"[MetroPulse] Port {target_port} is occupied by another app. Switching to port {available_port}.")
            target_port = available_port
            app_url = f"http://localhost:{target_port}"

    # 3. Schedule auto browser launch
    if not args.no_browser:
        open_browser_delayed(app_url, delay=1.2)

    # 4. Start Uvicorn Server
    print(f"===========================================================")
    print(f"  MetroPulse Stadium Surge Planner (PS-05)")
    print(f"  Gujarat Metro Rail Corporation (GMRC)")
    print(f"===========================================================")
    print(f"  Offline-capable transit operations planner serving at:")
    print(f"  -> {app_url}")
    print(f"===========================================================\n")

    import uvicorn
    uvicorn.run("backend.api:app", host="0.0.0.0", port=target_port, reload=False)


if __name__ == "__main__":
    main()
