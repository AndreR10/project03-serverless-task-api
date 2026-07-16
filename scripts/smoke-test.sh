#!/usr/bin/env bash

set -euo pipefail

usage() {
  echo "Usage: $0 [API_URL]" >&2
}

error() {
  echo "Error: $*" >&2
}

API_URL="${1:-${API_URL:-}}"

if [[ -z "${API_URL}" ]]; then
  if command -v terraform >/dev/null 2>&1; then
    if terraform -chdir=../terraform output -raw api_base_url >/tmp/task-api-url.txt 2>/dev/null; then
      API_URL="$(tr -d '\r' </tmp/task-api-url.txt)"
    fi
  fi
fi

if [[ -z "${API_URL}" ]]; then
  read -r -p "Enter the API base URL (for example, https://abc123.execute-api.us-east-1.amazonaws.com/dev): " API_URL
fi

if [[ -z "${API_URL}" ]]; then
  error "No API URL provided."
  usage
  exit 1
fi

API_URL="${API_URL%/}"
TASKS_URL="${API_URL}/v1/tasks"

response_file="$(mktemp)"
trap 'rm -f "${response_file}"' EXIT

echo "Testing API at ${TASKS_URL}..."
echo
echo "GET /tasks"

http_code="$(curl --silent --show-error --location --output "${response_file}" --write-out '%{http_code}' "${TASKS_URL}")"
curl_exit=$?

if [[ ${curl_exit} -ne 0 ]]; then
  error "The request failed. Check that the API is deployed and reachable."
  cat "${response_file}" >&2
  exit 1
fi

if [[ "${http_code}" =~ ^2 ]]; then
  cat "${response_file}"
else
  error "The API returned HTTP ${http_code}."
  cat "${response_file}" >&2
  exit 1
fi

echo
echo "Smoke test completed."