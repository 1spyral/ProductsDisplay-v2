#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.test.yml}"
SERVICE_NAME="${SERVICE_NAME:-postgres}"
TEST_DB_HOST="${TEST_DB_HOST:-localhost}"
TEST_DB_PORT="${TEST_DB_PORT:-5433}"
TEST_DB_NAME="${TEST_DB_NAME:-productsdisplay_test}"
TEST_DB_USER="${TEST_DB_USER:-postgres}"
TEST_DB_PASSWORD="${TEST_DB_PASSWORD:-postgres}"
KEEP_TEST_DB_RUNNING="${KEEP_TEST_DB_RUNNING:-0}"

if ! command -v docker >/dev/null 2>&1; then
    echo "Docker is required to run local e2e tests." >&2
    exit 1
fi

cleanup() {
    if [[ "${KEEP_TEST_DB_RUNNING}" == "1" ]]; then
        return
    fi

    docker compose -f "${COMPOSE_FILE}" down -v >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "Starting test Postgres container..."
docker compose -f "${COMPOSE_FILE}" up -d "${SERVICE_NAME}"

echo "Waiting for Postgres to become ready..."
for _ in {1..40}; do
    if docker compose -f "${COMPOSE_FILE}" exec -T "${SERVICE_NAME}" \
        pg_isready -U "${TEST_DB_USER}" -d "${TEST_DB_NAME}" >/dev/null 2>&1; then
        break
    fi

    sleep 1
done

if ! docker compose -f "${COMPOSE_FILE}" exec -T "${SERVICE_NAME}" \
    pg_isready -U "${TEST_DB_USER}" -d "${TEST_DB_NAME}" >/dev/null 2>&1; then
    echo "Postgres did not become ready in time." >&2
    exit 1
fi

export DATABASE_URL="postgresql://${TEST_DB_USER}:${TEST_DB_PASSWORD}@${TEST_DB_HOST}:${TEST_DB_PORT}/${TEST_DB_NAME}"
export DB_HOST="${TEST_DB_HOST}"
export DB_PORT="${TEST_DB_PORT}"
export DB_DATABASE="${TEST_DB_NAME}"
export DB_USER="${TEST_DB_USER}"
export DB_PASSWORD="${TEST_DB_PASSWORD}"

# Test-safe defaults for runtime env checks
export NEXT_PUBLIC_IMAGE_PATH="${NEXT_PUBLIC_IMAGE_PATH:-}"
export NEXT_ALLOWED_IMAGE_REMOTE_PATTERNS="${NEXT_ALLOWED_IMAGE_REMOTE_PATTERNS:-}"
export GOOGLE_CLOUD_PROJECT_ID="${GOOGLE_CLOUD_PROJECT_ID:-test-project}"
export GOOGLE_CLOUD_STORAGE_BUCKET="${GOOGLE_CLOUD_STORAGE_BUCKET:-test-bucket}"
export ADMIN_PASSWORD="${ADMIN_PASSWORD:-test-admin-password}"
export ADMIN_TOKEN_SECRET="${ADMIN_TOKEN_SECRET:-test-admin-token-secret-1234567890}"
export LOG_LEVEL="${LOG_LEVEL:-info}"

echo "Running migrations against local test database..."
bun run db:migrate

echo "Running e2e tests..."
bun --env-file=.env.test playwright test "$@"

if [[ "${KEEP_TEST_DB_RUNNING}" == "1" ]]; then
    echo "Leaving test database running (KEEP_TEST_DB_RUNNING=1)."
fi
