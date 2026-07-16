#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
APP_DIR="${PROJECT_ROOT}/app"

if [[ ! -d "${APP_DIR}" ]]; then
  echo "Error: application directory not found at ${APP_DIR}" >&2
  exit 1
fi

echo "Seeding DynamoDB..."

cd "${APP_DIR}"
npm run seed