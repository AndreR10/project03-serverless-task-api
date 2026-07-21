# Terraform project structure

This Terraform configuration is organized into a root module and several child modules so each part of the infrastructure has a clear responsibility.

## Overview

The root module in this folder is responsible for:

- defining shared input variables
- creating common local values such as tags and naming values
- wiring modules together
- exposing top-level outputs

Each child module encapsulates one area of infrastructure:

- API Gateway
- Lambda compute resources
- IAM/security resources
- S3 storage for Lambda artifacts
- monitoring and alerting
- DynamoDB storage

## Root files

### main.tf

The entry point for the Terraform configuration. It instantiates all modules and passes values from the root module into each child module.

### variables.tf

Defines the input variables exposed to the root module. These values are used to configure the whole stack and are passed into the modules.

### locals.tf

Defines local values used across the root configuration. This includes shared naming values, common tags, and derived values such as the API name or Lambda function name.

### outputs.tf

Defines outputs exposed by the root module. These are convenient values to retrieve after deployment, such as the API URL or DynamoDB table details.

### providers.tf

Configures the Terraform providers used by the project, including AWS.

### versions.tf

Declares the required Terraform version and provider versions.

### archive.tf

Defines the Lambda deployment package artifact used by the compute module.

## Modules

### modules/api

Handles the API Gateway resources:

- REST API
- resources paths
- methods
- integrations
- deployment and stage

### modules/compute

Handles the Lambda compute resources:

- Lambda function definition
- CloudWatch log group
- Lambda outputs such as the function name and invoke ARN

### modules/security

Handles IAM resources for the Lambda execution role and its permissions.

### modules/storage

Handles the S3 bucket used to store Lambda deployment artifacts.

### modules/monitoring

Handles CloudWatch alarms, SNS notifications, and dashboard widgets.

### modules/dynamodb

Handles the DynamoDB table definition and its outputs.

## How the files relate to each other

- The root module reads shared configuration from variables.tf and locals.tf.
- The root module calls each child module from main.tf.
- Each child module receives only the inputs it needs.
- Child modules expose outputs that the root module can use for other resources or for top-level outputs.

This structure keeps the infrastructure easier to understand and maintain because each module has a single responsibility and the root module acts as the coordinator.

## Example flow

1. The root module reads project and environment values.
2. The root module passes those values into the API, compute, security, storage, monitoring, and DynamoDB modules.
3. Each module creates its own resources.
4. The root module exposes the resulting values such as API URL and table name.

## Best practices used here

- One module per concern
- Clear input/output boundaries
- Shared values centralized in the root module
- Reusable and easier-to-maintain infrastructure code
