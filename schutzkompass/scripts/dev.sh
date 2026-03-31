#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────
# SchutzKompass — Single-command development startup
#
# Usage:  pnpm start:dev   (or  bash scripts/dev.sh)
#
# What it does:
#   1. Starts Docker services (PostgreSQL, Redis, MinIO)
#   2. Waits until PostgreSQL and Redis are healthy
#   3. Pushes the Drizzle schema to the database (idempotent)
#   4. Starts the Turborepo dev server (Next.js + Worker)
# ─────────────────────────────────────────────────────────────────────

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/docker/docker-compose.yml"

# ── Colors ──────────────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

info()  { echo -e "${CYAN}[SchutzKompass]${NC} $1"; }
ok()    { echo -e "${GREEN}[SchutzKompass]${NC} ✔ $1"; }
warn()  { echo -e "${YELLOW}[SchutzKompass]${NC} ⚠ $1"; }
fail()  { echo -e "${RED}[SchutzKompass]${NC} ✖ $1"; exit 1; }

# ── Detect docker-compose command ──────────────────────────────────
if command -v docker-compose &>/dev/null; then
  DC_BIN="docker-compose"
elif docker compose version &>/dev/null 2>&1; then
  DC_BIN="docker compose"
else
  fail "Neither 'docker-compose' nor 'docker compose' found. Please install Docker Compose."
fi

# ── Detect whether sudo is needed for Docker ──────────────────────
SUDO=""
if ! docker info &>/dev/null 2>&1; then
  if sudo docker info &>/dev/null 2>&1; then
    SUDO="sudo"
    warn "Docker requires sudo. Consider adding your user to the 'docker' group:"
    warn "  sudo usermod -aG docker \$USER  (then log out & back in)"
  else
    fail "Cannot connect to Docker daemon. Is Docker running?"
  fi
fi

DC="$SUDO $DC_BIN"
DOCKER="$SUDO docker"

info "Using compose command: $DC"

# ── 1. Start Docker services ──────────────────────────────────────
info "Starting Docker services (PostgreSQL, Redis, MinIO)..."
$DC -f "$COMPOSE_FILE" up -d

# ── 2. Wait for PostgreSQL ────────────────────────────────────────
info "Waiting for PostgreSQL to be ready..."
MAX_WAIT=30
WAITED=0
DB_CONTAINER=$($DC -f "$COMPOSE_FILE" ps -q db)
until $DOCKER exec "$DB_CONTAINER" pg_isready -U schutzkompass &>/dev/null 2>&1; do
  WAITED=$((WAITED + 1))
  if [ $WAITED -ge $MAX_WAIT ]; then
    fail "PostgreSQL did not become ready within ${MAX_WAIT}s"
  fi
  sleep 1
done
ok "PostgreSQL is ready (${WAITED}s)"

# ── 3. Wait for Redis ────────────────────────────────────────────
info "Waiting for Redis to be ready..."
WAITED=0
REDIS_CONTAINER=$($DC -f "$COMPOSE_FILE" ps -q redis)
until $DOCKER exec "$REDIS_CONTAINER" redis-cli ping &>/dev/null 2>&1; do
  WAITED=$((WAITED + 1))
  if [ $WAITED -ge $MAX_WAIT ]; then
    warn "Redis did not become ready within ${MAX_WAIT}s — worker may not function"
    break
  fi
  sleep 1
done
if [ $WAITED -lt $MAX_WAIT ]; then
  ok "Redis is ready (${WAITED}s)"
fi

# ── 4. Push database schema ──────────────────────────────────────
info "Pushing database schema (drizzle-kit push)..."
cd "$ROOT_DIR"

# Export .env so DATABASE_URL is available to turbo child processes
if [ -f "$ROOT_DIR/.env" ]; then
  export $(grep -v '^\s*#' "$ROOT_DIR/.env" | grep -v '^\s*$' | xargs)
fi

pnpm db:push 2>&1 | tail -5
ok "Database schema is up to date"

# ── 5. Start dev servers ─────────────────────────────────────────
echo ""
info "Starting development servers..."
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  SchutzKompass is starting at http://localhost:3000${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

exec pnpm dev
