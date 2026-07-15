# Terraform Guide

## Overview

This project uses **Terraform** to provision and manage all AWS infrastructure.

Instead of manually creating resources in the AWS Management Console, Terraform allows us to define the infrastructure as code, making deployments repeatable, version-controlled, and consistent across environments.

---

# Why Terraform?

Infrastructure as Code (IaC) provides several advantages over manual deployments.

## Benefits

- Infrastructure is version controlled.
- Deployments are repeatable.
- Resources are created consistently.
- Changes can be reviewed before deployment.
- Infrastructure can be recreated at any time.
- Supports multiple environments (dev, test, prod).

---

# Project Structure

```text
terraform/

├── api_gateway.tf
├── dynamodb.tf
├── iam.tf
├── lambda.tf
├── locals.tf
├── outputs.tf
├── providers.tf
├── variables.tf
```

Each file groups resources by responsibility rather than by resource type.

---

# providers.tf

## Purpose

Defines:

- Terraform version
- Required providers
- AWS provider configuration

Example:

```hcl
terraform {

  required_version = ">= 1.5"

  required_providers {

    aws = {
      source = "hashicorp/aws"
      version = "~> 6.0"
    }

    archive = {
      source = "hashicorp/archive"
      version = "~> 2.7"
    }

  }

}

provider "aws" {

  region = var.region

}
```

## Why?

Keeping provider configuration in a dedicated file makes it easy to update provider versions and reuse the project across environments.

---

# variables.tf

## Purpose

Defines values that may change between deployments.

Current variable:

```hcl
variable "region" {

  type = string

  default = "eu-west-1"

}
```

## Why use variables?

Without variables:

```hcl
region = "eu-west-1"
```

would need to be changed everywhere.

Using variables allows:

- Different AWS Regions
- Different environments
- Better reusability

---

# locals.tf

## Purpose

Stores values that are reused throughout the project.

Example:

```hcl
locals {

  project = "task-api"

  environment = "dev"

}
```

Instead of writing:

```text
task-api-dev-handler

task-api-dev-table

task-api-dev-api
```

multiple times, Terraform builds the names automatically.

---

## Resource Tags

All resources share the same tags:

```hcl
tags = {

  Project = local.project

  Environment = local.environment

  ManagedBy = "Terraform"

}
```

Benefits:

- Easier cost tracking
- Resource organization
- Operational visibility

---

## Dynamic API Methods

Instead of creating one resource per HTTP method:

```hcl
resource "aws_api_gateway_method" "tasks_post"
```

we use:

```hcl
tasks_methods = toset([
  "GET",
  "POST"
])
```

combined with:

```hcl
for_each = local.tasks_methods
```

Terraform automatically creates one resource for each method.

Benefits:

- Less duplication
- Easier maintenance
- Easier to extend

---

# dynamodb.tf

## Purpose

Creates the DynamoDB table.

Responsibilities:

- Table creation
- Billing mode
- Partition key
- Tags

Current configuration:

- Billing Mode: On-Demand
- Partition Key: id

---

# iam.tf

## Purpose

Creates the security configuration.

Resources:

- IAM Role
- IAM Policy
- Policy Attachments

Lambda receives permission to:

- Read DynamoDB
- Write DynamoDB
- Write CloudWatch Logs

The project follows the **Least Privilege Principle**.

---

# lambda.tf

## Purpose

Creates:

- Lambda deployment package
- Lambda function

Terraform uses the Archive Provider:

```hcl
data "archive_file"
```

to automatically package the application into a ZIP file.

Benefits:

- No manual ZIP creation
- Consistent deployments
- Automatic updates when source code changes

---

# api_gateway.tf

## Purpose

Creates the REST API.

Resources include:

- REST API
- Resources
- Methods
- Integrations
- Deployment
- Stage

The API follows:

```text
/v1/tasks
```

and

```text
/v1/tasks/{id}
```

---

## Why use `for_each`?

Instead of:

```hcl
tasks_get

tasks_post

task_put

task_delete
```

we define:

```hcl
tasks_methods

task_id_methods
```

Terraform generates all required methods automatically.

This approach:

- Reduces code duplication
- Improves readability
- Simplifies future maintenance

---

# outputs.tf

## Purpose

Displays useful information after deployment.

Example:

```text
API URL

Lambda Name

DynamoDB Table
```

This avoids manually searching the AWS Console after every deployment.

---

# Terraform Workflow

## 1. Initialize

```bash
terraform init
```

Downloads:

- AWS Provider
- Archive Provider
- Initializes the working directory

Run whenever:

- Starting a new project
- Adding providers
- Updating provider versions

---

## 2. Format

```bash
terraform fmt
```

Formats all Terraform files.

Benefits:

- Consistent style
- Easier code reviews
- Cleaner Git diffs

---

## 3. Validate

```bash
terraform validate
```

Checks:

- Syntax
- References
- Configuration correctness

No resources are created.

---

## 4. Plan

```bash
terraform plan
```

Shows:

- Resources to create
- Resources to modify
- Resources to destroy

Always review the plan before applying changes.

---

## 5. Apply

```bash
terraform apply
```

Creates or updates infrastructure.

Terraform compares:

Desired State (code)

↓

Current State (AWS)

↓

Applies only the required changes.

---

## 6. Destroy

```bash
terraform destroy
```

Removes all managed resources.

Useful for:

- Cleaning up
- Avoiding unnecessary AWS costs
- Recreating environments

---

# Terraform State

Terraform stores infrastructure information in a **state file**.

Current project:

```text
terraform.tfstate
```

The state file records:

- Resource IDs
- Dependencies
- Current configuration

Terraform uses this file to determine what has changed.

---

# Dependency Graph

Terraform automatically determines resource creation order.

Example:

```text
IAM Role
      │
      ▼
Lambda Function
      │
      ▼
API Gateway Integration
      │
      ▼
API Deployment
      │
      ▼
Stage
```

Explicit dependencies are added only when Terraform cannot infer the correct order.

---

# Resource Lifecycle

Typical deployment flow:

```text
terraform apply

↓

IAM Role

↓

DynamoDB Table

↓

Lambda Package

↓

Lambda Function

↓

API Gateway

↓

Lambda Permission

↓

API Deployment

↓

API Stage

↓

Outputs
```

---

# Best Practices

This project follows several Terraform best practices:

- Separate files by responsibility
- Use variables
- Use locals
- Apply consistent tags
- Use `for_each` to reduce duplication
- Keep infrastructure under version control
- Avoid hardcoded values
- Follow the Principle of Least Privilege
- Review every `terraform plan`
- Format and validate before applying

---

# Common Beginner Mistakes

❌ Editing resources manually after Terraform creates them

❌ Forgetting to run `terraform init`

❌ Ignoring `terraform plan`

❌ Hardcoding values instead of using variables

❌ Using overly permissive IAM policies

❌ Deleting resources directly in AWS instead of using Terraform

❌ Committing `terraform.tfstate` to Git

---

# Files That Should Not Be Committed

Add these entries to `.gitignore`:

```text
.terraform/
*.tfstate
*.tfstate.*
.terraform.lock.hcl
task-api.zip
```

> **Note:** Whether to commit `.terraform.lock.hcl` depends on your team's practices. For many production projects, it is committed to ensure consistent provider versions. For a learning project, discuss the trade-offs in your README or team guidelines.

---

# Skills Demonstrated

By completing this phase, you have practiced:

- Infrastructure as Code
- AWS resource provisioning
- Provider configuration
- Variables and locals
- Dynamic resources with `for_each`
- IAM configuration
- Lambda deployment
- API Gateway configuration
- Terraform state management
- Deployment lifecycle
- Infrastructure automation

These are foundational Terraform skills used daily by Cloud Engineers, DevOps Engineers, and Platform Engineers.
