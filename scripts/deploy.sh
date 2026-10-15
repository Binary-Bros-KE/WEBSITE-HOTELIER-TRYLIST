#!/usr/bin/env bash
# Deploys the public website app, run ON the VPS (from the GitHub Action or by
# hand). Same approach as the API's deploy: build in a staging checkout while
# the live site keeps serving, swap only after a complete build, then health-
# check and roll back automatically if the new version doesn't come up.
#
# DEPLOY_DRY_RUN=1 stops after the build.
set -euo pipefail

APP="$HOME/WEBSITE-HOTELIER"
STAGE="$HOME/WEBSITE-HOTELIER-stage"
PREV="$HOME/WEBSITE-HOTELIER-next.prev"
PM2_NAME="hotelier-website"
REPO="${WEBSITE_REPO:-https://github.com/Binary-Bros-KE/WEBSITE-HOTELIER-TRYLIST.git}"

# Shares the API's lock, so a website deploy and an API deploy never build at the same time.
if [ "${HOTELIER_DEPLOY_LOCKED:-0}" != "1" ]; then
  exec 9>"$HOME/.hotelier-deploy.lock"
  flock -w 1500 9 || { echo "Another deploy is still running after 25 minutes - giving up"; exit 1; }
fi

discard() {
  [ -e "$1" ] || return 0
  rm -rf "$1" 2>/dev/null || true
  if [ -e "$1" ]; then mv "$1" "$1.trash-$(date +%s)" 2>/dev/null || true; fi
}

if [ ! -d "$APP/.git" ]; then
  echo "==> First deploy: cloning $REPO"
  git clone --quiet "$REPO" "$APP"
fi
test -f "$APP/.env" || { echo "Missing $APP/.env (needs API_URL and PORT) - create it first"; exit 1; }

cd "$APP"
git update-ref -d refs/remotes/origin/main || true
git fetch --prune --force origin +refs/heads/main:refs/remotes/origin/main
SHA="$(git rev-parse origin/main)"
echo "==> Deploying $SHA"

echo "==> Building in staging (live site untouched)"
discard "$STAGE"
git clone --quiet --no-checkout "$APP" "$STAGE"
git -C "$STAGE" checkout --quiet "$SHA"
cp "$APP/.env" "$STAGE/.env"
cd "$STAGE"
npm ci --no-audit --no-fund
npm run build
test -f .next/standalone/server.js || { echo "Build produced no standalone server"; exit 1; }
# The standalone server serves static assets only if they sit beside it.
cp -r .next/static .next/standalone/.next/static
[ -d public ] && cp -r public .next/standalone/public

if [ "${DEPLOY_DRY_RUN:-0}" = "1" ]; then
  echo "==> Dry run OK (build succeeded)."
  cd "$HOME"; discard "$STAGE"; exit 0
fi

echo "==> Swapping in the new build"
PORT_NUM="$(grep -E '^PORT=' "$APP/.env" | tail -1 | cut -d= -f2 | tr -d '"[:space:]' || true)"
PORT_NUM="${PORT_NUM:-3100}"
cd "$APP"
discard "$PREV"
[ -d "$APP/.next" ] && mv "$APP/.next" "$PREV"
mv "$STAGE/.next" "$APP/.next"
git reset --hard "$SHA" --quiet

if pm2 describe "$PM2_NAME" >/dev/null 2>&1; then
  pm2 reload ecosystem.config.cjs --update-env
else
  pm2 start ecosystem.config.cjs && pm2 save
fi

healthy=0
for _ in $(seq 1 30); do
  sleep 2
  if curl -fsS -m 3 "http://127.0.0.1:${PORT_NUM}/healthz" >/dev/null 2>&1; then healthy=1; break; fi
done
if [ "$healthy" != "1" ]; then
  echo "!! New build failed its health check - restoring the previous version"
  if [ -d "$PREV" ]; then discard "$APP/.next"; mv "$PREV" "$APP/.next"; pm2 reload ecosystem.config.cjs --update-env || true; fi
  exit 1
fi
echo "==> Healthy on port ${PORT_NUM}. Deploy of $SHA complete."
cd "$HOME"; discard "$STAGE"
