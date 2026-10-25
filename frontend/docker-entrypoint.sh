#!/bin/sh
set -e

cat <<EOF > /usr/share/nginx/html/env.js
window.__ENV__ = {
  VITE_API_URL: "${VITE_API_URL:-}"
};
EOF

echo "[CareerAI] Generated env.js with VITE_API_URL: '${VITE_API_URL:-}'"

exec "$@"
