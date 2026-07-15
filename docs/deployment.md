# Deployment Guide

## Overview

This guide explains how to deploy the **Serverless Task Management API** using two different approaches:

1. **AWS Management Console (GUI)**
2. **Terraform (Infrastructure as Code)**

The project is intentionally designed to support both methods so you can understand the AWS services before automating them with Terraform.

---

# Prerequisites

Before deploying the project, ensure you have:

## AWS

- AWS Account
- AWS CLI installed
- AWS CLI configured
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

## Development Tools

Install:

- Git
- Node.js 24.x
- npm
- Terraform
- Visual Studio Code (recommended)

Verify installations:

```bash
node --version
npm --version
terraform --version
git --version
```

---

# Project Structure

```text
project03-serverless-task-api/

├── app/
├── build/
├── docs/
├── scripts/
└── terraform/
```

---

# Deployment Option 1 - AWS Management Console

This deployment method is intended for learning how AWS services are configured manually.

---

## Step 1 - Create the DynamoDB Table

Open:

**AWS Console → DynamoDB**

Select:

**Create table**

Configuration:

| Setting       | Value              |
| ------------- | ------------------ |
| Table Name    | task-api-dev-table |
| Partition Key | id                 |
| Type          | String             |
| Billing Mode  | On-demand          |

Create the table.

---

## Step 2 - Create the IAM Role

Open:

**AWS Console → IAM → Roles**

Create a new role.

Trusted Entity:

- AWS Service
- Lambda

Attach:

- AWSLambdaBasicExecutionRole

Create a custom policy allowing:

- PutItem
- GetItem
- UpdateItem
- DeleteItem
- Scan

on the DynamoDB table.

Attach the policy to the role.

---

## Step 3 - Build the Lambda Package

From the project root:

```bash
cd scripts

./build.sh
```

The script generates the deployment package.

---

## Step 4 - Create the Lambda Function

Open:

**AWS Console → Lambda**

Select:

**Create Function**

Configuration:

| Setting        | Value                |
| -------------- | -------------------- |
| Name           | task-api-dev-handler |
| Runtime        | Node.js 24.x         |
| Architecture   | x86_64               |
| Execution Role | Existing Role        |

Upload the generated ZIP package.

---

## Step 5 - Configure Environment Variables

Inside the Lambda function:

**Configuration → Environment Variables**

Create:

| Variable   | Value              |
| ---------- | ------------------ |
| TABLE_NAME | task-api-dev-table |

Deploy the changes.

---

## Step 6 - Create the REST API

Open:

**AWS Console → API Gateway**

Create:

REST API

Create resources:

```text
/v1

/v1/tasks

/v1/tasks/{id}
```

Create methods:

| Resource    | Methods          |
| ----------- | ---------------- |
| /tasks      | GET, POST        |
| /tasks/{id} | GET, PUT, DELETE |

Enable:

**Lambda Proxy Integration**

Select:

```
task-api-dev-handler
```

Deploy the API.

Create stage:

```
dev
```

---

## Step 7 - Test the API

Example:

```bash
curl -X GET \
https://YOUR_API_ID.execute-api.eu-west-1.amazonaws.com/dev/v1/tasks
```

If everything is configured correctly, the API returns an HTTP response.

---

# Deployment Option 2 - Terraform

Terraform creates all infrastructure automatically.

---

## Step 1 - Configure AWS Credentials

Verify:

```bash
aws sts get-caller-identity
```

---

## Step 2 - Build the Lambda Package

```bash
cd scripts

./build.sh
```

---

## Step 3 - Initialize Terraform

```bash
cd ../terraform

terraform init
```

Downloads:

- AWS Provider
- Archive Provider

---

## Step 4 - Format

```bash
terraform fmt -recursive
```

---

## Step 5 - Validate

```bash
terraform validate
```

Expected:

```text
Success! The configuration is valid.
```

---

## Step 6 - Review the Plan

```bash
terraform plan
```

Review:

- Resources to create
- Changes
- Outputs

Never skip this step.

---

## Step 7 - Apply

```bash
terraform apply
```

Confirm:

```text
yes
```

Terraform creates:

- IAM Role
- IAM Policies
- DynamoDB Table
- Lambda Function
- API Gateway
- Lambda Permissions
- API Deployment
- Stage

---

## Step 8 - Retrieve Outputs

```bash
terraform output
```

Example:

```text
api_base_url = https://xxxxxxxx.execute-api.eu-west-1.amazonaws.com/dev
```

---

# Updating the Application

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

# Destroying the Infrastructure

To remove all resources:

```bash
terraform destroy
```

Confirm:

```text
yes
```

This helps avoid unnecessary AWS charges.

---

# Deployment Verification

After deployment, verify:

## Lambda

- Function exists
- Environment variables configured
- Test invocation succeeds

---

## DynamoDB

- Table exists
- Billing mode is On-Demand

---

## API Gateway

- REST API deployed
- Stage `dev` exists
- Endpoints are reachable

---

## CloudWatch

- Lambda log group created
- Logs generated after invocation

---

# Common Deployment Issues

| Problem                       | Solution                                                          |
| ----------------------------- | ----------------------------------------------------------------- |
| Invalid AWS credentials       | Run `aws configure` and verify with `aws sts get-caller-identity` |
| Lambda cannot access DynamoDB | Verify IAM permissions                                            |
| Internal Server Error         | Check CloudWatch Logs                                             |
| API returns 403               | Verify Lambda permission for API Gateway                          |
| API returns 404               | Confirm the API was deployed to the `dev` stage                   |
| Terraform validation fails    | Run `terraform fmt` and `terraform validate`                      |

---

# Deployment Checklist

Before considering the deployment complete, verify:

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

# Next Steps

With the infrastructure successfully deployed, the next phase focuses on operational excellence:

- CloudWatch Metrics
- CloudWatch Alarms
- Structured logging
- Monitoring dashboards
- Production observability

These enhancements will transform the project from a functional serverless API into a production-inspired cloud application.
