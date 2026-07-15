# Troubleshooting Guide

## Overview

This document describes common issues encountered while developing and deploying the **Serverless Task Management API**, explains why they occur, and provides steps to resolve them.

---

# Troubleshooting Workflow

When something isn't working, follow this order:

```text
Client

↓

API Gateway

↓

Lambda

↓

CloudWatch Logs

↓

IAM Permissions

↓

DynamoDB

↓

Terraform Configuration
```

This top-down approach helps isolate the source of the problem efficiently.

---

# AWS Credentials Issues

## Error

```text
No valid credential sources found
```

or

```text
Invalid provider configuration
```

## Cause

Terraform cannot authenticate with AWS because credentials are missing or invalid.

---

## Resolution

Verify AWS CLI:

```bash
aws sts get-caller-identity
```

If this fails, configure credentials:

```bash
aws configure
```

Provide:

- AWS Access Key ID
- AWS Secret Access Key
- Region
- Output format

Verify again:

```bash
aws sts get-caller-identity
```

---

## Prevention

Always verify credentials before running Terraform.

---

# Provider Configuration Error

## Error

```text
Provider requires explicit configuration
```

## Cause

The AWS provider block is missing.

---

## Resolution

Verify that `providers.tf` contains:

```hcl
provider "aws" {
  region = var.region
}
```

Then run:

```bash
terraform init
```

---

## Prevention

Always initialize Terraform after modifying provider configuration.

---

# Lambda Packaging Issues

## Error

```text
Runtime.ImportModuleError
```

or

```text
Cannot find module
```

## Cause

The deployment ZIP does not contain the expected directory structure or required dependencies.

---

## Resolution

Rebuild the deployment package:

```bash
cd scripts

./build.sh
```

Verify the ZIP contains:

```text
src/
package.json
node_modules/
```

Deploy again:

```bash
terraform apply
```

---

## Prevention

Always rebuild the package after changing application code or dependencies.

---

# Internal Server Error (500)

## Error

```text
{
  "message":"Internal server error"
}
```

## Cause

The Lambda function threw an exception while processing the request.

Common reasons include:

- Missing environment variables
- Invalid DynamoDB table name
- JavaScript runtime errors
- Missing IAM permissions
- Invalid request body

---

## Resolution

Open:

AWS Console

↓

CloudWatch

↓

Log Groups

↓

Select the Lambda log group

Review the latest log stream for the stack trace.

Correct the issue and redeploy.

---

## Prevention

Check CloudWatch Logs immediately whenever a 500 response occurs.

---

# Access Denied to DynamoDB

## Error

```text
AccessDeniedException
```

## Cause

The Lambda execution role does not have permission to access the DynamoDB table.

---

## Resolution

Verify the IAM policy includes:

- GetItem
- PutItem
- UpdateItem
- DeleteItem
- Scan

Confirm the policy references the correct table ARN.

Run:

```bash
terraform apply
```

after updating the policy.

---

## Prevention

Follow the Principle of Least Privilege while ensuring all required actions are included.

---

# API Gateway Returns 403

## Error

```text
403 Forbidden
```

## Cause

API Gateway is not authorized to invoke the Lambda function.

---

## Resolution

Verify the `aws_lambda_permission` resource exists.

Example:

```hcl
resource "aws_lambda_permission" "apigateway" {
  ...
}
```

Run:

```bash
terraform apply
```

---

## Prevention

Always create a Lambda permission whenever integrating API Gateway with Lambda.

---

# API Gateway Returns 404

## Error

```text
404 Not Found
```

## Possible Causes

- Incorrect URL
- Incorrect resource path
- API not deployed
- Wrong stage name

---

## Resolution

Verify:

- API Gateway deployment exists
- Stage name is `dev`
- URL matches Terraform output

Example:

```text
https://<api-id>.execute-api.eu-west-1.amazonaws.com/dev/v1/tasks
```

If resources changed:

```bash
terraform apply
```

to redeploy the API.

---

# API Changes Not Reflected

## Symptom

Infrastructure deploys successfully, but API behavior does not change.

---

## Cause

API Gateway deployment was not recreated.

---

## Resolution

Ensure the deployment resource includes a trigger, for example:

```hcl
triggers = {
  redeployment = sha1(jsonencode(...))
}
```

This forces a new deployment whenever API resources change.

Run:

```bash
terraform apply
```

---

## Prevention

Use deployment triggers so Terraform automatically redeploys the API when necessary.

---

# Lambda Code Changes Not Applied

## Symptom

Terraform completes successfully, but Lambda still executes old code.

---

## Cause

The deployment package was not rebuilt or Terraform did not detect a change.

---

## Resolution

Rebuild:

```bash
cd scripts

./build.sh
```

Run:

```bash
terraform plan
```

Verify the Lambda function will be updated.

Apply:

```bash
terraform apply
```

---

## Prevention

Automate ZIP creation using Terraform's `archive_file` data source and ensure `source_code_hash` is configured.

---

# Terraform Detects Unexpected Changes

## Symptom

`terraform plan` shows changes even though nothing was modified.

---

## Possible Causes

- Manual changes in AWS Console
- Resource drift
- Provider version differences

---

## Resolution

Compare Terraform configuration with the AWS Console.

Avoid manually editing resources managed by Terraform.

---

## Prevention

Once Terraform manages a resource, use Terraform exclusively for updates.

---

# Terraform State Issues

## Symptom

Terraform cannot find existing resources or wants to recreate them unexpectedly.

---

## Cause

The local state file is missing, corrupted, or out of sync.

---

## Resolution

Verify:

```text
terraform.tfstate
```

exists.

If collaborating with others, use a remote backend (introduced in a later phase).

---

## Prevention

Do not delete the state file while the infrastructure is still managed.

Do not manually edit the state file.

---

# Common cURL Issues

## Problem

Request fails with:

```text
Could not resolve host
```

### Resolution

Verify:

- Correct API URL
- Proper quotation marks
- Internet connectivity

---

## Problem

```text
Missing Authentication Token
```

### Resolution

Usually indicates:

- Incorrect URL
- Incorrect resource path
- Wrong HTTP method
- API not deployed

Verify the endpoint and redeploy if necessary.

---

# CloudWatch Logs Not Appearing

## Cause

The Lambda function has not been invoked, or the execution role lacks logging permissions.

---

## Resolution

1. Invoke the Lambda function.
2. Verify the IAM role includes:

- logs:CreateLogGroup
- logs:CreateLogStream
- logs:PutLogEvents

---

## Prevention

Attach the AWS managed policy:

```text
AWSLambdaBasicExecutionRole
```

or grant equivalent least-privilege permissions.

---

# Debugging Checklist

Before making code changes, verify:

- ☐ AWS credentials are valid
- ☐ Terraform configuration validates
- ☐ Terraform plan is correct
- ☐ Lambda package rebuilt
- ☐ API deployed
- ☐ Environment variables configured
- ☐ IAM permissions correct
- ☐ CloudWatch logs reviewed
- ☐ DynamoDB table exists
- ☐ API URL is correct

---

# Useful Commands

Verify AWS identity:

```bash
aws sts get-caller-identity
```

Initialize Terraform:

```bash
terraform init
```

Validate configuration:

```bash
terraform validate
```

Review infrastructure changes:

```bash
terraform plan
```

Apply changes:

```bash
terraform apply
```

Destroy infrastructure:

```bash
terraform destroy
```

Build the Lambda package:

```bash
cd scripts

./build.sh
```

---

# Lessons Learned

Throughout Phase 1, the following issues were encountered and resolved:

- AWS credential configuration
- Terraform provider configuration
- Lambda deployment packaging
- API Gateway deployment updates
- Lambda permissions for API Gateway
- IAM permissions for DynamoDB
- Internal Server Error diagnosis using CloudWatch Logs
- Terraform dependency management
- Automatic Lambda ZIP packaging
- API Gateway method generation using `for_each`

Understanding how to diagnose and resolve these issues is an essential Cloud Engineering skill and is often more valuable than simply knowing how to create the infrastructure.
