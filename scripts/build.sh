#!/bin/bash

# Prepare the files and production packages that Terraform will zip for Lambda.
set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "Cleaning build folder..."

# Remove stale output so deleted or renamed source files do not remain in the package.
rm -rf "$PROJECT_ROOT/build"

mkdir -p "$PROJECT_ROOT/build"

echo "Copying source files..."

cp -r "$PROJECT_ROOT/app/src" "$PROJECT_ROOT/build"

cp "$PROJECT_ROOT/app/package.json" "$PROJECT_ROOT/build"

echo "Installing dependencies..."

# Install only runtime dependencies; test and lint packages are not needed in Lambda.
cd "$PROJECT_ROOT/build"

npm install --omit=dev

echo "Build finished successfully."