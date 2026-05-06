import os
import json
import urllib.request
import urllib.error

LOG_URL = "http://20.207.122.201/evaluation-service/logs"

VALID_LEVELS = {"debug", "info", "warn", "error", "fatal"}
VALID_STACKS = {"backend", "frontend"}

BACKEND_PACKAGES = {
    "cache", "controller", "cron_job", "db", "domain",
    "handler", "repository", "route", "service"
}
FRONTEND_PACKAGES = {"api", "component", "hook", "page", "state", "style"}
SHARED_PACKAGES   = {"auth", "config", "middleware", "utils"}


def _is_valid_package(stack: str, package: str) -> bool:
    if package in SHARED_PACKAGES:
        return True
    if stack == "backend":
        return package in BACKEND_PACKAGES
    if stack == "frontend":
        return package in FRONTEND_PACKAGES
    return False


def log(stack: str, level: str, package: str, message: str) -> None:
    if stack not in VALID_STACKS:
        print(f"[logger] skipped — invalid stack: '{stack}'")
        return

    if level not in VALID_LEVELS:
        print(f"[logger] skipped — invalid level: '{level}'")
        return

    if not _is_valid_package(stack, package):
        print(f"[logger] skipped — '{package}' not allowed for stack '{stack}'")
        return

    token = os.environ.get("AUTH_TOKEN", "")
    if not token:
        print("[logger] AUTH_TOKEN not set — skipping remote log")
        return

    payload = json.dumps({
        "stack":   stack,
        "level":   level,
        "package": package,
        "message": message,
    }).encode("utf-8")

    req = urllib.request.Request(
        url=LOG_URL,
        data=payload,
        method="POST",
        headers={
            "Content-Type":  "application/json",
            "Authorization": f"Bearer {token}",
        },
    )

    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            result = json.loads(resp.read().decode())
            if "logID" in result:
                print(f"[logger] sent ({level}) → logID: {result['logID']}")
    except urllib.error.URLError as e:
        print(f"[logger] request failed: {e.reason}")
    except Exception as e:
        print(f"[logger] unexpected error: {e}")
