#!/bin/bash

# Delete every item in the app's configured DynamoDB table; this cannot be undone.
set -e

echo "Clearing DynamoDB..."

cd app

npm run clear-db