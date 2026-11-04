#!/bin/bash

# Prepare the files and production packages that Terraform will zip for Lambda.
set -euo pipefail

# Set PROJECT_ROOT to the parent directory of this script's location, ensuring paths are resolved correctly regardless of where the script is run from.
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "Cleaning build folder..."

# Remove stale output so deleted or renamed source files do not remain in the package.
rm -rf "$PROJECT_ROOT/build"

mkdir -p "$PROJECT_ROOT/build"

echo "Copying source files..."

cp -r "$PROJECT_ROOT/app/src" "$PROJECT_ROOT/build"


cp "$PROJECT_ROOT/app/package.json" "$PROJECT_ROOT/build"
cp "$PROJECT_ROOT/app/package-lock.json" "$PROJECT_ROOT/build"

echo "Installing dependencies..."

# Install exact locked runtime dependencies; test and lint packages are not needed in Lambda.
cd "$PROJECT_ROOT/build"

npm ci --omit=dev

# Fail the build rather than deploy a ZIP that will crash when the handler imports uuid.
test -f node_modules/uuid/package.json

echo "Build finished successfully."