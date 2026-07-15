#!/bin/bash

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "Cleaning build folder..."

rm -rf "$PROJECT_ROOT/build"

mkdir -p "$PROJECT_ROOT/build"

echo "Copying source files..."

cp -r "$PROJECT_ROOT/app/src" "$PROJECT_ROOT/build"

cp "$PROJECT_ROOT/app/package.json" "$PROJECT_ROOT/build"

echo "Installing dependencies..."

cd "$PROJECT_ROOT/build"

npm install --omit=dev

echo "Build finished successfully."