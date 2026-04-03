#!/usr/bin/env bash
# ============================================================
#  Snapir Design — Production Start Script
#  Ubuntu / Linux — serves site via Cloudflare Tunnel
#
#  Domain:  snapirdesignbg.com
#  Tunnel:  cloudflared (https://developers.cloudflare.com/cloudflare-one/connections/connect-apps)
#
#  FIRST-TIME SETUP (run once manually):
#    1. Install cloudflared:
#         curl -L https://pkg.cloudflare.com/cloudflare-main.gpg | sudo gpg --dearmor -o /usr/share/keyrings/cloudflare-main.gpg
#         echo 'deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared jammy main' | sudo tee /etc/apt/sources.list.d/cloudflared.list
#         sudo apt update && sudo apt install cloudflared -y
#    2. Login to Cloudflare:
#         cloudflared tunnel login
#    3. Create the tunnel:
#         cloudflared tunnel create snapir-design
#    4. Route your domain to the tunnel:
#         cloudflared tunnel route dns snapir-design snapirdesignbg.com
#         cloudflared tunnel route dns snapir-design www.snapirdesignbg.com
#    5. Copy the tunnel credentials UUID printed in step 3 and paste into TUNNEL_ID below.
#
#  AFTER SETUP: just run  ./start.sh
# ============================================================

set -euo pipefail

# ── CONFIG ──────────────────────────────────────────────────
PORT=8080
TUNNEL_NAME="snapir-design"
SITE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$SITE_DIR/logs"
TUNNEL_CONFIG="$SITE_DIR/cloudflared.yml"

# ── COLORS ──────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn()  { echo -e "${YELLOW}[!]${NC} $1"; }
error() { echo -e "${RED}[✗]${NC} $1"; exit 1; }

echo ""
echo "  ┌─────────────────────────────────────────┐"
echo "  │   SNAPIR DESIGN — Starting up...        │"
echo "  │   snapirdesignbg.com                    │"
echo "  └─────────────────────────────────────────┘"
echo ""

# ── PREREQUISITE CHECKS ─────────────────────────────────────
command -v node       >/dev/null 2>&1 || error "Node.js not found. Install: sudo apt install nodejs"
command -v npx        >/dev/null 2>&1 || error "npx not found. Install: sudo apt install npm"
command -v cloudflared >/dev/null 2>&1 || error "cloudflared not found. See setup instructions in this file."

info "Node $(node --version) detected"
info "cloudflared $(cloudflared --version | head -1) detected"

# ── CREATE LOG DIR ───────────────────────────────────────────
mkdir -p "$LOG_DIR"

# ── WRITE CLOUDFLARE TUNNEL CONFIG ──────────────────────────
cat > "$TUNNEL_CONFIG" <<EOF
tunnel: ${TUNNEL_NAME}
credentials-file: ${HOME}/.cloudflared/$(cloudflared tunnel list 2>/dev/null | awk "/$TUNNEL_NAME/{print \$1}").json

ingress:
  - hostname: snapirdesignbg.com
    service: http://localhost:${PORT}
  - hostname: www.snapirdesignbg.com
    service: http://localhost:${PORT}
  - service: http_status:404
EOF

# ── START HTTP SERVER ─────────────────────────────────────────
info "Starting HTTP server on port $PORT..."
npx --yes serve "$SITE_DIR" -p "$PORT" --no-clipboard > "$LOG_DIR/server.log" 2>&1 &
SERVER_PID=$!
echo "$SERVER_PID" > "$LOG_DIR/server.pid"

# Wait for server to be ready
for i in $(seq 1 10); do
  if curl -sf "http://localhost:$PORT" >/dev/null 2>&1; then
    info "HTTP server ready at http://localhost:$PORT"
    break
  fi
  sleep 0.5
done

# ── START CLOUDFLARE TUNNEL ────────────────────────────────
info "Starting Cloudflare Tunnel → snapirdesignbg.com..."
cloudflared tunnel --config "$TUNNEL_CONFIG" run "$TUNNEL_NAME" > "$LOG_DIR/cloudflared.log" 2>&1 &
CF_PID=$!
echo "$CF_PID" > "$LOG_DIR/cloudflared.pid"

sleep 2

# Check both processes started
if kill -0 "$SERVER_PID" 2>/dev/null && kill -0 "$CF_PID" 2>/dev/null; then
  info "All services running"
  echo ""
  echo "  🌐  Live at: https://snapirdesignbg.com"
  echo "  📁  Serving: $SITE_DIR"
  echo "  📋  Logs:    $LOG_DIR/"
  echo ""
  echo "  Press Ctrl+C to stop all services."
  echo ""
else
  warn "One or more services failed to start. Check logs in $LOG_DIR/"
fi

# ── GRACEFUL SHUTDOWN ─────────────────────────────────────────
cleanup() {
  echo ""
  warn "Shutting down..."
  kill "$SERVER_PID" 2>/dev/null && info "HTTP server stopped"
  kill "$CF_PID"     2>/dev/null && info "Cloudflare Tunnel stopped"
  rm -f "$LOG_DIR/server.pid" "$LOG_DIR/cloudflared.pid"
  echo ""
  info "Shutdown complete."
  exit 0
}
trap cleanup SIGINT SIGTERM

# ── KEEP ALIVE ────────────────────────────────────────────────
wait "$SERVER_PID" "$CF_PID"
