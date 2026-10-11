#!/usr/bin/env bash
# One command the Antigravity agent runs after every change. Non-zero exit = not done.
set -euo pipefail
cd "$(dirname "$0")"
echo "== backend tests =="; (cd backend && PYTHONPATH=. ${PYTHON:-python} -m pytest -q tests)
echo "== frontend typecheck + build =="; (cd frontend && npx tsc --noEmit && npx vite build >/dev/null)
echo "== secret scan =="
if grep -rIlE "BEGIN (RSA |EC )?PRIVATE KEY|AIza[0-9A-Za-z_-]{35}" --exclude-dir=node_modules --exclude-dir=dist --exclude=.env.example --exclude=verify.sh . ; then
  echo "Possible secret committed. Remove it and rotate the key."; exit 1; fi
echo "== dependency audit (prod) =="; (cd frontend && npm audit --omit=dev --audit-level=high)
echo "ALL CHECKS PASSED"
