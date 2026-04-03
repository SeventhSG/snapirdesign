#!/usr/bin/env bash
set -euo pipefail

SITE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT=8080
TUNNEL_NAME="snapir-design"
DOMAIN="snapirdesignbg.com"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Snapir Design — Deploy"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── Kill anything already on the port ───────────────────────
fuser -k ${PORT}/tcp 2>/dev/null || true
pkill -f "cloudflared tunnel" 2>/dev/null || true
sleep 1

# ── Get tunnel UUID ──────────────────────────────────────────
TUNNEL_ID=$(cloudflared tunnel list --output json 2>/dev/null \
  | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$TUNNEL_ID" ]; then
  echo "No tunnel found. Creating one..."
  cloudflared tunnel create "$TUNNEL_NAME"
  cloudflared tunnel route dns "$TUNNEL_NAME" "$DOMAIN"
  cloudflared tunnel route dns "$TUNNEL_NAME" "www.$DOMAIN"
  TUNNEL_ID=$(cloudflared tunnel list --output json 2>/dev/null \
    | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
fi

CREDS_FILE="$HOME/.cloudflared/${TUNNEL_ID}.json"
echo "  Tunnel ID : $TUNNEL_ID"
echo "  Creds     : $CREDS_FILE"

# ── Write cloudflared config ─────────────────────────────────
cat > "$SITE_DIR/cloudflared.yml" <<EOF
tunnel: ${TUNNEL_ID}
credentials-file: ${CREDS_FILE}

ingress:
  - hostname: ${DOMAIN}
    service: http://localhost:${PORT}
  - hostname: www.${DOMAIN}
    service: http://localhost:${PORT}
  - service: http_status:404
EOF

# ── Start HTTP server ────────────────────────────────────────
echo "  Starting server on port $PORT..."
npx --yes serve "$SITE_DIR" -p "$PORT" --no-clipboard &>/tmp/snapir-serve.log &
sleep 2

if ! curl -sf "http://localhost:$PORT" >/dev/null; then
  echo "ERROR: Server failed to start. Check /tmp/snapir-serve.log"
  exit 1
fi
echo "  Server OK → http://localhost:$PORT"

# ── Start tunnel ─────────────────────────────────────────────
echo "  Starting Cloudflare Tunnel..."
cloudflared tunnel --config "$SITE_DIR/cloudflared.yml" run &>/tmp/snapir-tunnel.log &
sleep 3

echo ""
echo "  ✓ Live at https://$DOMAIN"
echo ""
echo "  Logs:"
echo "    Server  → /tmp/snapir-serve.log"
echo "    Tunnel  → /tmp/snapir-tunnel.log"
echo ""
echo "  Press Ctrl+C to stop."

trap 'pkill -f "npx.*serve"; pkill -f "cloudflared tunnel"; echo "Stopped."; exit 0' SIGINT SIGTERM
wait
