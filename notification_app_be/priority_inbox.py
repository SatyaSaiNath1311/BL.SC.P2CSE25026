
import os
import sys
import json
import heapq
import urllib.request
import urllib.error
from datetime import datetime

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from logging_middleware import logger

NOTIFICATION_URL = "http://20.207.122.201/evaluation-service/notifications"

TYPE_WEIGHT = {
    "Placement": 3,
    "Result":    2,
    "Event":     1,
}



def parse_ts(ts_str: str) -> datetime:
    return datetime.strptime(ts_str, "%Y-%m-%d %H:%M:%S")


def compute_score(weight: int, ts: datetime, oldest: datetime, newest: datetime) -> float:
    span = (newest - oldest).total_seconds()
    recency = (ts - oldest).total_seconds() / span if span > 0 else 1.0
    return round(weight + recency, 6)



def get_top_n(notifications: list, n: int) -> list:
    if not notifications:
        return []

    parsed = []
    for item in notifications:
        ts = parse_ts(item["Timestamp"])
        parsed.append((ts, item))

    oldest = min(p[0] for p in parsed)
    newest = max(p[0] for p in parsed)

    heap = []

    for idx, (ts, item) in enumerate(parsed):
        weight = TYPE_WEIGHT.get(item["Type"], 0)
        score = compute_score(weight, ts, oldest, newest)

        if len(heap) < n:
            heapq.heappush(heap, (score, idx, item))
        elif score > heap[0][0]:
            heapq.heapreplace(heap, (score, idx, item))

    result = sorted(heap, key=lambda x: x[0], reverse=True)
    return [(score, item) for score, _, item in result]



def fetch_notifications(token: str) -> list:
    req = urllib.request.Request(
        url=NOTIFICATION_URL,
        method="GET",
        headers={"Authorization": f"Bearer {token}"},
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode())
            return data.get("notifications", [])
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        raise RuntimeError(f"HTTP {e.code}: {body}")
    except urllib.error.URLError as e:
        raise RuntimeError(f"Connection error: {e.reason}")



def load_env():
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_path):
        with open(env_path, "r") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    os.environ[k.strip()] = v.strip()

def main():
    load_env()
    token = os.environ.get("AUTH_TOKEN", "").strip()
    if not token:
        print("Error: AUTH_TOKEN is not set.\nAdd it to your .env file and run:\n  python3 priority_inbox.py")
        sys.exit(1)

    top_n = int(os.environ.get("TOP_N", "10"))

    print(f"\nFetching campus notifications...\n")
    logger.log("backend", "info", "service", "priority inbox run started")

    try:
        notifications = fetch_notifications(token)
    except RuntimeError as err:
        logger.log("backend", "error", "handler", str(err))
        print(f"Failed to fetch notifications: {err}")
        sys.exit(1)

    total = len(notifications)
    print(f"Total received : {total}")
    logger.log("backend", "info", "service", f"fetched {total} notifications from API")

    top = get_top_n(notifications, top_n)

    print(f"\n{'='*52}")
    print(f"  Priority Inbox — Top {top_n} Notifications")
    print(f"  Scoring: type weight + recency (0–1 scale)")
    print(f"{'='*52}\n")

    for rank, (score, item) in enumerate(top, start=1):
        label = item["Type"].ljust(9)
        print(f"  #{rank:02d}  [{label}]  {item['Message']}")
        print(f"        Timestamp : {item['Timestamp']}")
        print(f"        Score     : {score}")
        print(f"        ID        : {item['ID']}")
        print()

    logger.log("backend", "info", "service", f"top {top_n} priority notifications displayed")


if __name__ == "__main__":
    main()
