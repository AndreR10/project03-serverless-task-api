#!/bin/bash

# Format Terraform files, then check that the configuration is valid.
set -e

echo "Formatting Terraform..."

cd terraform

terraform fmt -recursive

terraform validate