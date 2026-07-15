# Testing Guide

## Overview

This document describes how to verify that the **Serverless Task Management API** is functioning correctly after deployment.

The tests cover:

- Infrastructure deployment
- API functionality
- Database operations
- Logging
- Error handling

---

# Prerequisites

Before testing, ensure:

- AWS infrastructure has been deployed
- Lambda function is active
- API Gateway stage is deployed
- DynamoDB table exists
- AWS CLI is configured
- Terraform completed successfully

Verify AWS credentials:

```bash
aws sts get-caller-identity
```

Verify Terraform outputs:

```bash
terraform output
```

Example:

```text
api_base_url = https://xxxxxxxx.execute-api.eu-west-1.amazonaws.com/dev
```

---

# Test Environment

| Component       | Expected State |
| --------------- | -------------- |
| Lambda          | Active         |
| API Gateway     | Deployed       |
| DynamoDB        | Active         |
| IAM Role        | Attached       |
| CloudWatch Logs | Enabled        |

---

# Functional Tests

## Test 1 - Create Task

### Objective

Verify that a new task can be created.

### Request

```bash
curl -X POST \
https://YOUR_API_ID.execute-api.eu-west-1.amazonaws.com/dev/v1/tasks \
-H "Content-Type: application/json" \
-d '{
"title":"Study AWS",
"description":"Complete Module 8"
}'
```

### Expected Result

Status Code

```text
201 Created
```

Response contains:

- id
- title
- description
- status

---

## Test 2 - List Tasks

### Objective

Verify that all tasks are returned.

### Request

```bash
curl \
https://YOUR_API_ID.execute-api.eu-west-1.amazonaws.com/dev/v1/tasks
```

### Expected Result

```text
200 OK
```

The response should contain the task created in Test 1.

---

## Test 3 - Get Task

### Objective

Retrieve a task by ID.

### Request

```bash
curl \
https://YOUR_API_ID.execute-api.eu-west-1.amazonaws.com/dev/v1/tasks/<TASK_ID>
```

### Expected Result

```text
200 OK
```

Returned task matches the requested ID.

---

## Test 4 - Update Task

### Objective

Update an existing task.

### Request

```bash
curl -X PUT \
https://YOUR_API_ID.execute-api.eu-west-1.amazonaws.com/dev/v1/tasks/<TASK_ID> \
-H "Content-Type: application/json" \
-d '{
"title":"Study Terraform",
"description":"Module 9",
"status":"IN_PROGRESS"
}'
```

### Expected Result

```text
200 OK
```

Verify the updated values by running Test 3 again.

---

## Test 5 - Delete Task

### Objective

Delete an existing task.

### Request

```bash
curl -X DELETE \
https://YOUR_API_ID.execute-api.eu-west-1.amazonaws.com/dev/v1/tasks/<TASK_ID>
```

### Expected Result

```text
200 OK
```

Attempting to retrieve the task afterwards should return:

```text
404 Not Found
```

---

# Negative Tests

## Invalid JSON

Request:

```bash
curl -X POST \
https://YOUR_API_ID.execute-api.eu-west-1.amazonaws.com/dev/v1/tasks \
-H "Content-Type: application/json" \
-d '{}'
```

Expected:

```text
400 Bad Request
```

---

## Invalid Route

Request:

```bash
curl \
https://YOUR_API_ID.execute-api.eu-west-1.amazonaws.com/dev/v1/invalid
```

Expected:

```text
404 Not Found
```

---

## Invalid Task ID

Request:

```bash
curl \
https://YOUR_API_ID.execute-api.eu-west-1.amazonaws.com/dev/v1/tasks/invalid-id
```

Expected:

```text
404 Not Found
```

---

## Unsupported HTTP Method

Request:

```bash
curl -X PATCH \
https://YOUR_API_ID.execute-api.eu-west-1.amazonaws.com/dev/v1/tasks
```

Expected:

```text
405 Method Not Allowed
```

(or the response configured by API Gateway/Lambda.)

---

# DynamoDB Verification

Open:

AWS Console → DynamoDB → Tables

Verify:

- Table exists
- Item was created
- Item was updated
- Item was deleted

Check that the partition key (`id`) is populated.

---

# CloudWatch Verification

Open:

AWS Console → CloudWatch → Log Groups

Locate:

```text
/aws/lambda/task-api-dev-handler
```

Verify:

- Invocation logs exist
- Errors are logged
- Request processing appears as expected

---

# API Gateway Verification

Open:

AWS Console → API Gateway

Verify:

- REST API exists
- Stage `dev` is deployed
- Resources `/v1/tasks` and `/v1/tasks/{id}` exist
- All methods are configured

---

# Lambda Verification

Open:

AWS Console → Lambda

Verify:

- Function status is **Active**
- Correct runtime is configured
- IAM execution role is attached
- Environment variable `TABLE_NAME` exists

Run a test event and confirm it executes successfully.

---

# Terraform Verification

Run:

```bash
terraform validate
```

Expected:

```text
Success! The configuration is valid.
```

Run:

```bash
terraform plan
```

Expected:

```text
No changes. Your infrastructure matches the configuration.
```

This confirms the deployed infrastructure matches the Terraform configuration.

---

# Regression Checklist

Run this checklist after making changes to the application or infrastructure.

| Test                   | Status |
| ---------------------- | ------ |
| Terraform Validate     | ☐      |
| Terraform Plan         | ☐      |
| Create Task            | ☐      |
| List Tasks             | ☐      |
| Get Task               | ☐      |
| Update Task            | ☐      |
| Delete Task            | ☐      |
| CloudWatch Logs        | ☐      |
| DynamoDB Data          | ☐      |
| API Gateway Deployment | ☐      |

---

# Production Readiness Checklist

Although this is a learning project, review the following before considering it production-ready.

| Item                   | Status    |
| ---------------------- | --------- |
| IAM Least Privilege    | ☑         |
| Resource Tagging       | ☑         |
| API Versioning         | ☑         |
| Structured Responses   | ☑         |
| Infrastructure as Code | ☑         |
| CloudWatch Logging     | ☑         |
| Monitoring Alarms      | ☐ Phase 2 |
| CI/CD Pipeline         | ☐ Phase 3 |
| Authentication         | ☐ Future  |
| Secrets Management     | ☐ Future  |

---

# Common Testing Issues

| Issue                                  | Possible Cause            | Resolution                     |
| -------------------------------------- | ------------------------- | ------------------------------ |
| 500 Internal Server Error              | Lambda exception          | Review CloudWatch Logs         |
| 403 Forbidden                          | Missing Lambda permission | Verify `aws_lambda_permission` |
| 404 Not Found                          | API not deployed          | Redeploy API Gateway           |
| Empty response                         | DynamoDB table empty      | Create test data               |
| Terraform detects changes unexpectedly | Manual AWS changes        | Reconcile or import changes    |

---

# Summary

A successful test cycle confirms that:

- Infrastructure is correctly provisioned.
- API Gateway routes requests correctly.
- Lambda executes business logic.
- DynamoDB stores and retrieves data.
- IAM permissions are correctly configured.
- CloudWatch captures execution logs.

Completing these tests after every deployment helps detect issues early and ensures the application remains stable as new features are introduced.
