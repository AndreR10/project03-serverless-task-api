# AWS Services

This document explains every AWS service used in the project, including its purpose, why it was selected, how it is configured, pricing considerations, and common mistakes.

---

# Service Overview

| Service                | Purpose                       | Phase      |
| ---------------------- | ----------------------------- | ---------- |
| AWS Lambda             | Executes the application code | ✅ Phase 1 |
| Amazon API Gateway     | Exposes the REST API          | ✅ Phase 1 |
| Amazon DynamoDB        | Stores task data              | ✅ Phase 1 |
| AWS IAM                | Manages permissions           | ✅ Phase 1 |
| Amazon CloudWatch Logs | Stores application logs       | ✅ Phase 1 |
| Amazon S3              | File storage                  | 🔜 Future  |
| Amazon EventBridge     | Event routing                 | 🔜 Future  |
| Amazon SNS             | Notifications                 | 🔜 Future  |
| Amazon SQS             | Message queue                 | 🔜 Future  |
| AWS X-Ray              | Distributed tracing           | 🔜 Future  |

---

# AWS Lambda

## What is AWS Lambda?

AWS Lambda is a **serverless compute service** that runs your code without requiring you to provision or manage servers.

Instead of managing infrastructure, you upload your application code and Lambda executes it only when it receives an event.

---

## Why are we using Lambda?

For this project, Lambda is responsible for:

- Receiving requests from API Gateway
- Executing business logic
- Reading and writing data in DynamoDB
- Returning HTTP responses

Benefits:

- No servers to manage
- Automatic scaling
- High availability
- Pay only for execution time

---

## How it fits into the architecture

```text
Client

↓

API Gateway

↓

AWS Lambda

↓

Service Layer

↓

Repository

↓

DynamoDB
```

---

## AWS Console Creation

1. Open **AWS Lambda**
2. Select **Create Function**
3. Choose **Author from scratch**
4. Configure:
   - Function Name: `task-api-dev-handler`
   - Runtime: Node.js 24.x

5. Create an execution role
6. Deploy the ZIP package
7. Configure environment variables
8. Save the function

---

## Terraform Resource

```hcl
resource "aws_lambda_function" "task_handler" {

  function_name = "${local.project}-${local.environment}-handler"

  runtime = "nodejs24.x"

  handler = "src/handlers/taskHandler.handler"

  role = aws_iam_role.lambda_role.arn

  filename = data.archive_file.lambda_zip.output_path

}
```

---

## Pricing

### AWS Free Tier

- 1 million requests/month
- 400,000 GB-seconds/month

For this project, normal learning usage should remain within the Free Tier.

---

## Common Beginner Mistakes

❌ Uploading the wrong ZIP structure

❌ Incorrect handler path

❌ Missing IAM permissions

❌ Forgetting environment variables

❌ Packaging `node_modules` incorrectly

---

## Best Practices

- Keep functions small
- Use environment variables
- Log meaningful information
- Grant least-privilege IAM permissions
- Reuse AWS SDK clients when possible

---

# Amazon API Gateway

## What is API Gateway?

Amazon API Gateway is a managed service that allows applications to expose REST or HTTP APIs securely.

It acts as the entry point to the serverless application.

---

## Why are we using API Gateway?

Responsibilities:

- Receives HTTPS requests
- Routes requests
- Invokes Lambda
- Returns HTTP responses
- Supports API versioning

---

## Request Flow

```text
Client

↓

API Gateway

↓

Lambda

↓

Response
```

---

## AWS Console Creation

1. Open **API Gateway**
2. Create a **REST API**
3. Create resource `/v1`
4. Create resource `/tasks`
5. Create resource `/tasks/{id}`
6. Add methods:
   - GET
   - POST
   - PUT
   - DELETE

7. Configure Lambda Proxy Integration
8. Deploy the API
9. Create stage `dev`

---

## Terraform Resources

Main resources:

```hcl
aws_api_gateway_rest_api

aws_api_gateway_resource

aws_api_gateway_method

aws_api_gateway_integration

aws_api_gateway_deployment

aws_api_gateway_stage
```

---

## Pricing

### AWS Free Tier

- 1 million REST API requests/month (first 12 months for eligible accounts)

---

## Common Beginner Mistakes

❌ Forgetting to deploy the API

❌ Missing Lambda permission

❌ Incorrect resource paths

❌ Confusing `http_method` with `integration_http_method`

---

## Best Practices

- Version APIs (`/v1`)
- Use meaningful resource names
- Keep routes RESTful
- Enable logging (future phase)

---

# Amazon DynamoDB

## What is DynamoDB?

Amazon DynamoDB is a fully managed NoSQL database.

It stores data using key-value and document models.

---

## Why are we using DynamoDB?

Responsibilities:

- Store tasks
- Retrieve tasks
- Update tasks
- Delete tasks

---

## Table Design

| Attribute   | Purpose          |
| ----------- | ---------------- |
| id          | Partition Key    |
| title       | Task title       |
| description | Task description |
| status      | Task status      |

---

## AWS Console Creation

1. Open **DynamoDB**
2. Create table
3. Table Name:
   `task-api-dev-table`
4. Partition Key:
   `id`
5. Billing Mode:
   **On-demand**

---

## Terraform Resource

```hcl
resource "aws_dynamodb_table" "tasks"
```

---

## Pricing

### AWS Free Tier

Designed to stay within the Free Tier using On-Demand billing and low request volume.

---

## Common Beginner Mistakes

❌ Using the wrong partition key

❌ Forgetting IAM permissions

❌ Choosing Provisioned Capacity unnecessarily

❌ Storing oversized items

---

## Best Practices

- Use On-Demand for small projects
- Keep items small
- Design access patterns first
- Avoid unnecessary scans in production

---

# AWS IAM

## What is IAM?

AWS Identity and Access Management (IAM) controls who can access AWS resources and what actions they can perform.

---

## Why are we using IAM?

The Lambda function requires permission to:

- Write logs
- Read and write DynamoDB data

IAM provides those permissions securely.

---

## Current Permissions

Lambda can:

- PutItem
- GetItem
- UpdateItem
- DeleteItem
- Scan

CloudWatch:

- Create log groups
- Create log streams
- Write log events

---

## AWS Console Creation

1. Open **IAM**
2. Create Role
3. Trusted Entity:
   AWS Lambda
4. Attach:
   - AWSLambdaBasicExecutionRole

5. Add a custom DynamoDB policy

---

## Terraform Resources

```hcl
aws_iam_role

aws_iam_policy

aws_iam_role_policy_attachment
```

---

## Pricing

IAM is free.

---

## Common Beginner Mistakes

❌ Using AdministratorAccess

❌ Using `"Resource": "*"` unnecessarily

❌ Hardcoding AWS credentials

---

## Best Practices

- Apply least privilege
- Separate roles by workload
- Rotate credentials
- Use IAM roles instead of access keys

---

# Amazon CloudWatch Logs

## What is CloudWatch Logs?

CloudWatch Logs stores logs generated by AWS services.

In this project, Lambda automatically sends logs to CloudWatch.

---

## Why are we using CloudWatch?

CloudWatch helps us:

- Troubleshoot errors
- Debug Lambda executions
- Monitor application behavior

---

## AWS Console

1. Open **CloudWatch**
2. Select **Log Groups**
3. Open the Lambda log group
4. View execution logs

---

## Terraform

No resource is required in Phase 1.

The log group is automatically created when the Lambda function executes for the first time.

Later phases will manage it with Terraform to configure log retention.

---

## Pricing

Small logging workloads generally remain within the Free Tier.

---

## Common Beginner Mistakes

❌ Never checking logs

❌ Logging sensitive information

❌ Ignoring error messages

---

## Best Practices

- Log errors clearly
- Avoid logging secrets
- Use structured JSON logs
- Configure retention policies

---

# Summary

By completing Phase 1, you have built a complete serverless application using the core AWS services required for many cloud-native applications.

You have gained hands-on experience with:

- Serverless computing
- REST API design
- NoSQL databases
- Infrastructure as Code
- IAM least privilege
- Cloud logging
- Terraform automation

These services form the foundation for the next phases, where monitoring, security, event-driven architecture, CI/CD, and advanced AWS services will be introduced.
