# Deployment Guide

## Overview

This guide explains how to deploy the Serverless Task Management API using two approaches:

1. AWS Management Console (GUI)
2. Terraform (Infrastructure as Code)

The project is intentionally designed to support both methods so you can understand the AWS services before automating them with Terraform.

---

## Prerequisites

Before deploying the project, ensure you have the following:

### AWS

- AWS account
- AWS CLI installed and configured
- IAM user with sufficient permissions

Verify your AWS credentials:

```bash
aws sts get-caller-identity
```

Expected output:

```json
{
  "UserId": "...",
  "Account": "...",
  "Arn": "..."
}
```

---

### Development Tools

Install:

- Git
- Node.js 24.x
- npm
- Terraform
- Visual Studio Code (recommended)

Verify the installations:

```bash
node --version
npm --version
terraform --version
git --version
```

---

## Project Structure

```text
project03-serverless-task-api/
├── app/
├── build/
├── docs/
├── scripts/
└── terraform/
```

---

## Deployment Option 1 - AWS Management Console

This deployment method is intended for learning how AWS services are configured manually.

### Step 1 - Create the DynamoDB Table

Open AWS Console → DynamoDB and select Create table.

Configuration:

| Setting       | Value              |
| ------------- | ------------------ |
| Table Name    | task-api-dev-table |
| Partition Key | id                 |
| Type          | String             |
| Billing Mode  | On-demand          |

Create the table.

---

### Step 2 - Create the IAM Role

Open AWS Console → IAM → Roles and create a new role.

Trusted entity:

- AWS Service
- Lambda

Attach:

- AWSLambdaBasicExecutionRole

Create a custom policy that allows:

- PutItem
- GetItem
- UpdateItem
- DeleteItem
- Scan

on the DynamoDB table, then attach the policy to the role.

---

### Step 3 - Build the Lambda Package

From the project root, run:

```bash
cd scripts
./build.sh
```

The script generates the deployment package.

---

### Step 4 - Create the Lambda Function

Open AWS Console → Lambda and select Create Function.

Configuration:

| Setting        | Value                |
| -------------- | -------------------- |
| Name           | task-api-dev-handler |
| Runtime        | Node.js 24.x         |
| Architecture   | x86_64               |
| Execution Role | Existing Role        |

Upload the generated ZIP package.

---

### Step 5 - Configure Environment Variables

Inside the Lambda function, open Configuration → Environment Variables.

Create the following variable:

| Variable   | Value              |
| ---------- | ------------------ |
| TABLE_NAME | task-api-dev-table |

Deploy the changes.

---

### Step 6 - Create the REST API

Open AWS Console → API Gateway and create a REST API.

Create the following resources:

```text
/v1
/v1/tasks
/v1/tasks/{id}
```

Create the following methods:

| Resource    | Methods          |
| ----------- | ---------------- |
| /tasks      | GET, POST        |
| /tasks/{id} | GET, PUT, DELETE |

Enable Lambda Proxy Integration and select the following function:

```text
task-api-dev-handler
```

Deploy the API and create a stage named:

```text
dev
```

---

### Step 7 - Test the API

Example:

```bash
curl -X GET \
https://YOUR_API_ID.execute-api.eu-west-1.amazonaws.com/dev/v1/tasks
```

If everything is configured correctly, the API returns an HTTP response.

---

## Deployment Option 2 - Terraform

Terraform creates all infrastructure automatically.

### Step 1 - Configure AWS Credentials

Verify your credentials:

```bash
aws sts get-caller-identity
```

---

### Step 2 - Build the Lambda Package

```bash
cd scripts
./build.sh
```

---

### Step 3 - Initialize Terraform

```bash
cd ../terraform
terraform init
```

This downloads the required providers:

- AWS Provider
- Archive Provider

---

### Step 4 - Format

```bash
terraform fmt -recursive
```

---

### Step 5 - Validate

```bash
terraform validate
```

Expected output:

```text
Success! The configuration is valid.
```

---

### Step 6 - Review the Plan

```bash
terraform plan
```

Review the following before applying:

- Resources to create
- Changes
- Outputs

Never skip this step.

---

### Step 7 - Apply

```bash
terraform apply
```

Confirm with:

```text
yes
```

Terraform creates the following resources:

- IAM Role
- IAM Policies
- DynamoDB Table
- Lambda Function
- API Gateway
- Lambda Permissions
- API Deployment
- Stage

---

### Step 8 - Retrieve Outputs

```bash
terraform output
```

Example output:

```text
api_base_url = https://xxxxxxxx.execute-api.eu-west-1.amazonaws.com/dev
```

---

## Updating the Application

If only the application code changes:

1. Modify the source code.
2. Rebuild the package:

```bash
cd scripts
./build.sh
```

3. Redeploy:

```bash
cd ../terraform
terraform apply
```

Terraform detects the updated ZIP package and updates the Lambda function.

---

## Destroying the Infrastructure

To remove all resources:

```bash
terraform destroy
```

Confirm with:

```text
yes
```

This helps avoid unnecessary AWS charges.

---

## Deployment Verification

After deployment, verify the following:

### Lambda

- Function exists
- Environment variables are configured
- Test invocation succeeds

---

### DynamoDB

- Table exists
- Billing mode is On-Demand

---

### API Gateway

- REST API is deployed
- Stage dev exists
- Endpoints are reachable

---

### CloudWatch

- Lambda log group is created
- Logs are generated after invocation

---

## Common Deployment Issues

| Problem                       | Solution                                                      |
| ----------------------------- | ------------------------------------------------------------- |
| Invalid AWS credentials       | Run aws configure and verify with aws sts get-caller-identity |
| Lambda cannot access DynamoDB | Verify IAM permissions                                        |
| Internal Server Error         | Check CloudWatch Logs                                         |
| API returns 403               | Verify Lambda permission for API Gateway                      |
| API returns 404               | Confirm the API was deployed to the dev stage                 |
| Terraform validation fails    | Run terraform fmt and terraform validate                      |

---

## Deployment Checklist

Before considering the deployment complete, verify the following:

- ✅ AWS credentials configured
- ✅ Lambda package built
- ✅ Terraform initialized
- ✅ Configuration formatted
- ✅ Configuration validated
- ✅ Plan reviewed
- ✅ Infrastructure applied
- ✅ API endpoint available
- ✅ CRUD operations tested
- ✅ CloudWatch logs generated

---

## Next Steps

With the infrastructure successfully deployed, the next phase focuses on operational excellence:

- CloudWatch Metrics
- CloudWatch Alarms
- Structured logging
- Monitoring dashboards
- Production observability

These enhancements will transform the project from a functional serverless API into a production-inspired cloud application.
