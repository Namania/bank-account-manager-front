#!/bin/sh
# Runs when the container starts, before nginx: checks the settings and writes
# them where the application reads them.
set -eu

if [ -z "${API_URL:-}" ]; then
  echo "API_URL is required: the address of the API as the browser sees it, for example https://api.example.org" >&2
  exit 1
fi

# These values end up in a JavaScript file and in an HTTP header: refuse
# anything that is not a plain address or a plain key.
case "$API_URL" in
  http://*|https://*) ;;
  *) echo "API_URL must start with http:// or https://" >&2; exit 1 ;;
esac
if printf '%s' "$API_URL" | grep -q '[^A-Za-z0-9._~:/-]'; then
  echo "API_URL contains characters that are not allowed in an address" >&2
  exit 1
fi
if printf '%s' "${LOCAL_KEY:-}" | grep -q '[^A-Za-z0-9._-]'; then
  echo "LOCAL_KEY may only contain letters, digits, dots, dashes and underscores" >&2
  exit 1
fi

# No trailing slash: the application appends its own paths.
API_URL="${API_URL%/}"

cat > /usr/share/nginx/html/config.js <<EOF
window.__APP_CONFIG__ = { API_URL: "${API_URL}", LOCAL_KEY: "${LOCAL_KEY:-bank_account_manager}" };
EOF

# The browser may only call this application and the API: scheme, host and port.
API_ORIGIN=$(printf '%s' "$API_URL" | sed -E 's#^(https?://[^/]+).*#\1#')

# 'unsafe-inline' is for styles only: the UI components write inline styles.
cat > /etc/nginx/conf.d/security-headers.inc <<EOF
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; connect-src 'self' ${API_ORIGIN}; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; manifest-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), camera=(), microphone=()" always;
EOF
