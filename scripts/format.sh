#!/bin/bash

set -e

echo "Formatting Terraform..."

cd terraform

terraform fmt -recursive

terraform validate