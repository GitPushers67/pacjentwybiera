#!/usr/bin/env bash
set -euo pipefail

wait_for_mongo() {
  python - <<'PY'
import os
import sys
import time
from pymongo import MongoClient

url = os.environ.get("MONGO_URL")
if not url:
    print("MONGO_URL is not set", file=sys.stderr)
    sys.exit(1)

for _ in range(60):
    try:
        client = MongoClient(url, serverSelectionTimeoutMS=1000)
        client.admin.command("ping")
        sys.exit(0)
    except Exception:
        time.sleep(1)

print("Timeout waiting for MongoDB", file=sys.stderr)
sys.exit(1)
PY
}

wait_for_chroma() {
  python - <<'PY'
import os
import sys
import time
import urllib.error
import urllib.request

url = os.environ.get("CHROMA_HEALTH_URL")
if not url:
    print("CHROMA_HEALTH_URL is not set", file=sys.stderr)
    sys.exit(1)

for _ in range(60):
    try:
        urllib.request.urlopen(url, timeout=2)
        sys.exit(0)
    except urllib.error.HTTPError as exc:
        # Chroma heartbeat may respond with 410 on some versions; treat as healthy.
        if exc.code == 410:
            sys.exit(0)
        time.sleep(1)
    except Exception:
        time.sleep(1)

print("Timeout waiting for ChromaDB", file=sys.stderr)
sys.exit(1)
PY
}

wait_for_mongo
wait_for_chroma

exec "$@"
