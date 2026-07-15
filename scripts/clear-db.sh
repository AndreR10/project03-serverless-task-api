#!/bin/bash

set -e

echo "Clearing DynamoDB..."

cd app

npm run clear-db