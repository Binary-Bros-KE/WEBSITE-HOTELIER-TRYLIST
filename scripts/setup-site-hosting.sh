#!/usr/bin/env bash
# One-time (re-runnable) server setup for tenant public websites. Run as root:
#
#   sudo bash ~/WEBSITE-HOTELIER/scripts/setup-site-hosting.sh
#
# It asks for a Cloudflare API token (or reads CF_API_TOKEN) with, on the
# hoteliermanagement.app zone:  DNS Write  and  SSL and Certificates Write
# (older dashboard wording: Zone > DNS > Edit, Zone > SSL and Certificates > Edit).
#
# What it does (each step is idempotent — safe to run again):
#   1. Verifies the token and finds the zone.
#   2. DNS: *.site  -> this server, DNS only (grey cloud)  — <slug>.site.hoteliermanagement.app
#           sites   -> this server, proxied (orange)       — target clients' own domains CNAME to
#   3. Installs certbot's Cloudflare plugin and issues one wildcard certificate for
#      *.site.hoteliermanagement.app via DNS validation (auto-renews; nginx reloads on renewal).
#   4. Adds an nginx site sending every website host to the app on 127.0.0.1:3100, with the
#      visitor's real IP restored (Cloudflare ranges) for rate limiting. It is the default
#      server on 443, so clients' custom domains (arriving via Cloudflare for SaaS) reach it.
#   5. Saves the token, zone id and SITE_DOMAIN in the API's .env and restarts the API.
#   6. Tries to set the Cloudflare for SaaS fallback origin (needs SaaS enabled on the zone).
set -euo pipefail

ZONE_NAME="hoteliermanagement.app"
SITE_DOMAIN="site.${ZONE_NAME}"
SAAS_TARGET="sites.${ZONE_NAME}"
APP_USER="evans"
APP_HOME="/home/${APP_USER}"
API_ENV="${APP_HOME}/NODE-HOTELIER/.env"
WEB_PORT=3100
SECRETS_DIR="/root/.secrets"
CF_INI="${SECRETS_DIR}/cloudflare-hotelier.ini"
NGINX_SITE="/etc/nginx/sites-available/hotelier-sites"
CF="https://api.cloudflare.com/client/v4"

[ "$(id -u)" = "0" ] || { echo "Run with sudo."; exit 1; }
command -v jq >/dev/null || apt-get install -y -q jq >/dev/null

if [ -z "${CF_API_TOKEN:-}" ] && [ -f "$CF_INI" ]; then
  CF_API_TOKEN="$(sed -n 's/^dns_cloudflare_api_token *= *//p' "$CF_INI")"
fi
if [ -z "${CF_API_TOKEN:-}" ]; then
  read -r -s -p "Cloudflare API token: " CF_API_TOKEN; echo
fi

cf() { curl -fsS -H "Authorization: Bearer ${CF_API_TOKEN}" -H "Content-Type: application/json" "$@"; }

echo "==> 1. Checking the token"
# Checked by looking the zone up — works for both user and account-owned tokens
# (/user/tokens/verify rejects account tokens).
ZONE_ID="$(cf "$CF/zones?name=${ZONE_NAME}" 2>/dev/null | jq -r '.result[0].id // empty' || true)"
[ -n "$ZONE_ID" ] || { echo "Token rejected, or it can't see the ${ZONE_NAME} zone — check its zone resources."; exit 1; }
SERVER_IP="$(curl -fsS -4 https://ifconfig.me)"
echo "    zone ${ZONE_ID}, server ${SERVER_IP}"
# Blank when the token can't read zone settings — harmless.
echo "    zone SSL mode: $(cf "$CF/zones/${ZONE_ID}/settings/ssl" 2>/dev/null | jq -r '.result.value // empty' || true)"

upsert_a() { # name proxied
  local name="$1" proxied="$2" id body
  body="$(jq -nc --arg n "$name" --arg ip "$SERVER_IP" --argjson p "$proxied" '{type:"A",name:$n,content:$ip,proxied:$p,ttl:1}')"
  id="$(cf "$CF/zones/${ZONE_ID}/dns_records?type=A&name=${name}" | jq -r '.result[0].id // empty')"
  if [ -n "$id" ]; then cf -X PUT "$CF/zones/${ZONE_ID}/dns_records/${id}" --data "$body" >/dev/null; echo "    updated ${name}"
  else cf -X POST "$CF/zones/${ZONE_ID}/dns_records" --data "$body" >/dev/null; echo "    created ${name}"; fi
}

echo "==> 2. DNS records"
upsert_a "*.${SITE_DOMAIN}" false
upsert_a "${SAAS_TARGET}" true

echo "==> 3. Wildcard certificate"
apt-get install -y -q python3-certbot-dns-cloudflare >/dev/null
install -d -m 700 "$SECRETS_DIR"
printf 'dns_cloudflare_api_token = %s\n' "$CF_API_TOKEN" > "$CF_INI"
chmod 600 "$CF_INI"
certbot certonly --non-interactive --agree-tos --keep-until-expiring \
  --dns-cloudflare --dns-cloudflare-credentials "$CF_INI" --dns-cloudflare-propagation-seconds 30 \
  --cert-name "$SITE_DOMAIN" -d "*.${SITE_DOMAIN}" -d "$SITE_DOMAIN" \
  --deploy-hook "systemctl reload nginx"

echo "==> 4. nginx"
# Fetched separately with a newline after each: ips-v4 has no trailing newline,
# which once glued its last range onto the first IPv6 range.
REAL_IP_LINES="$( { curl -fsS https://www.cloudflare.com/ips-v4; echo; curl -fsS https://www.cloudflare.com/ips-v6; echo; } | tr -d '\r' | sed '/^\s*$/d; s/^/    set_real_ip_from /; s/$/;/')"
# Every entry must be a CIDR — anything else would break nginx for every site.
if echo "$REAL_IP_LINES" | grep -vqE '^    set_real_ip_from [0-9a-f:.]+/[0-9]+;$'; then
  echo "Unexpected Cloudflare IP list — stopping before touching nginx."; exit 1
fi
cat > "$NGINX_SITE" <<NGINX
# Tenant public websites -> hotelier-website (pm2) on 127.0.0.1:${WEB_PORT}.
# Managed by WEBSITE-HOTELIER/scripts/setup-site-hosting.sh — edit there, not here.

server {
    listen 80;
    listen [::]:80;
    server_name .${SITE_DOMAIN};
    return 301 https://\$host\$request_uri;
}

server {
    # default_server: clients' own domains arrive here via Cloudflare for SaaS.
    listen 443 ssl default_server;
    listen [::]:443 ssl default_server;
    server_name .${SITE_DOMAIN};

    ssl_certificate /etc/letsencrypt/live/${SITE_DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${SITE_DOMAIN}/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;

    # Restore the visitor's IP for traffic that came through Cloudflare.
${REAL_IP_LINES}
    real_ip_header CF-Connecting-IP;

    client_max_body_size 1m;

    location / {
        proxy_pass http://127.0.0.1:${WEB_PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Forwarded-Proto https;
        # Overwritten, not appended: visitors can't spoof their IP past the rate limiter.
        proxy_set_header X-Forwarded-For \$remote_addr;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_read_timeout 60s;
    }
}
NGINX
ln -sf "$NGINX_SITE" /etc/nginx/sites-enabled/hotelier-sites
# Never leave a config behind that nginx rejects: it would block every later
# reload (certificate renewals for all sites included).
if ! nginx -t; then
  rm -f /etc/nginx/sites-enabled/hotelier-sites
  echo "nginx rejected the new site — removed it again; your other sites are untouched."
  exit 1
fi
systemctl reload nginx

echo "==> 5. API settings"
set_env() { # key value
  if grep -qE "^$1=" "$API_ENV"; then sed -i "s|^$1=.*|$1=$2|" "$API_ENV"; else printf '%s=%s\n' "$1" "$2" >> "$API_ENV"; fi
}
set_env SITE_DOMAIN "$SITE_DOMAIN"
set_env CLOUDFLARE_API_TOKEN "$CF_API_TOKEN"
set_env CLOUDFLARE_ZONE_ID "$ZONE_ID"
set_env SITE_CNAME_TARGET "$SAAS_TARGET"
chown "$APP_USER:$APP_USER" "$API_ENV"; chmod 600 "$API_ENV"
sudo -u "$APP_USER" bash -lc "pm2 restart hotelier-server --update-env >/dev/null && echo '    API restarted'"

echo "==> 6. Cloudflare for SaaS fallback origin"
if cf -X PUT "$CF/zones/${ZONE_ID}/custom_hostnames/fallback_origin" --data "{\"origin\":\"${SAAS_TARGET}\"}" >/dev/null 2>&1; then
  echo "    fallback origin set to ${SAAS_TARGET}"
else
  echo "    Not set: enable SSL/TLS > Custom Hostnames for ${ZONE_NAME} in the Cloudflare dashboard, then run this script again."
fi

echo
echo "Done. Check:  curl -sI https://omega.${SITE_DOMAIN}/healthz"
