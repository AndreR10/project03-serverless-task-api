#!/bin/bash

set -e

API_URL=$(cd ../terraform && terraform output -raw api_base_url)

echo "Testing API..."

echo
echo "GET /tasks"

curl "${API_URL}/v1/tasks"

echo
echo
echo "Smoke test completed."