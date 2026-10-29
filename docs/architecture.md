# Architecture

This project is a simple serverless application built on AWS. The goal is to make the architecture easy to understand and beginner-friendly.

The system combines:

- GitHub Actions for automation
- OpenID Connect (OIDC) for AWS login
- Terraform for infrastructure provisioning
- API Gateway for the public API
- Static dashboard files packaged with the Lambda function
- Lambda for business logic
- DynamoDB for data storage
- CloudWatch for logs and monitoring

---

## High-level view

```text
Developer
   |
   | git push
   v
GitHub
   |
   v
GitHub Actions
   |
   | OIDC token
   v
AWS IAM Role
   |
   v
Terraform
   |
   +--> API Gateway
   +--> Lambda
   +--> DynamoDB
   +--> S3
   +--> SSM
   +--> CloudWatch
   +--> IAM
        +--> Dashboard files in Lambda deployment package
   |
   v
AWS
```

---

## What happens when a request is made?

A typical request follows this flow:

```text
Client
  |
  v
API Gateway
  |
  v
Lambda function
  |
  v
Task service logic
  |
  v
DynamoDB
  |
  v
HTTP response
```

The browser dashboard is served by the existing API Gateway and Lambda deployment at
`/ui/index.html`. Its JavaScript and configuration are returned by the same Lambda at
`/ui/app.js` and `/ui/config.js`. The dashboard calls `/v1/tasks` on the same origin, so it
does not need a public S3 bucket, CloudFront distribution, or browser CORS exception.

```text
Recruiter's browser
        |
        +---- HTTPS page and assets ----> API Gateway ----> Lambda
        |
        +---- task API calls -----------> API Gateway ----> Lambda ----> DynamoDB / SSM
```

Example: create a task

```text
Client sends POST /v1/tasks
        |
        v
API Gateway receives the request
        |
        v
Lambda function executes
        |
        v
Service layer validates the payload
        |
        v
Repository writes to DynamoDB
        |
        v
Response returns to the client
```

---

## Main components

### GitHub Actions

GitHub Actions is used to automate deployment. It is the place where the workflow starts when you push changes to the repository.

It does not need long-lived AWS keys because it uses OIDC to get a short-lived token from AWS.

---

### Terraform

Terraform defines all AWS resources in code. This makes the infrastructure reproducible instead of manually creating resources in the AWS console.

The Terraform configuration creates:

- API Gateway
- Lambda
- DynamoDB
- S3 bucket
- static dashboard files included in the Lambda package
- SSM parameters
- IAM policies and roles
- OIDC provider and deployment role

---

### API Gateway

API Gateway exposes the API to the internet and routes requests to Lambda.

It handles:

- HTTP methods
- URL paths
- request forwarding
- response return

---

### Lambda

Lambda is where the actual application logic lives.

It receives requests from API Gateway, processes them, interacts with DynamoDB, and returns a response.

This is the serverless part of the solution: there is no server to maintain.

---

### DynamoDB

DynamoDB stores the task data.

The table contains records like:

| Field | Example | Purpose |
| ----- | ------- | ------- |
| id | uuid | Unique task identifier |
| title | Study AWS | Task title |
| description | Complete Module 8 | Task details |
| status | PENDING | Current state |

---

### CloudWatch

CloudWatch stores logs from Lambda and helps with observability.

It is used for:

- debugging errors
- checking request flow
- reviewing Lambda logs
- monitoring deployments

---

### IAM and OIDC

IAM controls who can do what in AWS. In this project, the GitHub Actions workflow does not use static AWS keys.

Instead, GitHub authenticates through OIDC and AWS grants only the allowed role for the repository and branch.

This is more secure than storing AWS secrets in GitHub.

---

## Why this architecture?

This project is designed to teach the basic pattern used in real-world serverless systems:

- app code runs in Lambda
- API Gateway exposes the interface
- DynamoDB stores state
- Terraform manages infrastructure
- GitHub Actions automates deployment
- OIDC keeps AWS access secure

That combination is common in modern cloud-native projects.

## Handler

Responsible for:

- Reading API Gateway events
- Determining the route
- Returning HTTP responses

---

## Service

Responsible for:

- Business logic
- Validation
- Preparing data

---

## Repository

Responsible for:

- DynamoDB communication
- CRUD operations

---

## Utility

Responsible for:

- Shared helper functions
- HTTP response formatting
- Future logging helpers

---

# API Design

Current API version:

```text
/v1
```

Versioning allows future releases without breaking existing clients.

Current endpoints:

| Method | Endpoint       |
| ------ | -------------- |
| POST   | /v1/tasks      |
| GET    | /v1/tasks      |
| GET    | /v1/tasks/{id} |
| PUT    | /v1/tasks/{id} |
| DELETE | /v1/tasks/{id} |

---

# Resource Naming Convention

All AWS resources follow the same naming pattern.

```text
<project>-<environment>-<resource>
```

Examples:

| Resource    | Example                  |
| ----------- | ------------------------ |
| Lambda      | task-api-dev-handler     |
| DynamoDB    | task-api-dev-table       |
| API Gateway | task-api-dev-api         |
| IAM Role    | task-api-dev-lambda-role |

Benefits:

- Easy identification
- Environment separation
- Consistent naming
- Easier automation

---

# Environment Strategy

Current environment:

```text
dev
```

Future environments:

```text
dev

test

prod
```

Terraform variables will allow deploying the same infrastructure into multiple environments.

---

# Security Overview

Current implementation:

- IAM Role for Lambda
- Least privilege IAM policy
- Environment variables
- No embedded AWS credentials
- API Gateway invokes Lambda using IAM permissions

Future improvements:

- Cognito Authentication
- AWS WAF
- Secrets Manager
- KMS Encryption

---

# Logging Strategy

Current implementation:

- Lambda logs requests
- Lambda logs errors
- CloudWatch automatically stores logs

Future improvements:

- Structured JSON logs
- Request IDs
- Correlation IDs
- Log retention policies
- Metrics and alarms

---

# Infrastructure as Code

Infrastructure is fully managed using Terraform.

Benefits:

- Version controlled
- Repeatable deployments
- Consistent environments
- Easy rollback
- Documentation through code

Terraform currently provisions:

- API Gateway
- Lambda
- IAM
- DynamoDB
- Lambda permissions
- Outputs

---

# Deployment Workflow

```text
Developer

↓

Git Repository

↓

Build Script

↓

Terraform

↓

AWS Infrastructure

↓

API Gateway

↓

Lambda

↓

DynamoDB
```

Future phases will introduce GitHub Actions for continuous deployment.

---

# Scalability

The architecture is fully serverless.

Benefits:

- Automatic scaling
- No server administration
- High availability
- Pay only for usage

Scaling behavior:

| Service     | Scaling               |
| ----------- | --------------------- |
| API Gateway | Automatic             |
| Lambda      | Automatic             |
| DynamoDB    | Automatic (On-Demand) |

---

# Cost Optimization

The project is intentionally designed for AWS Free Tier usage.

Techniques used:

- Serverless compute
- On-demand database
- Small Lambda memory allocation
- No EC2 instances
- No VPC (current phase)
- Minimal resource footprint

---

# Future Architecture

Future phases will extend the architecture.

```text
                     GitHub

                        │

                GitHub Actions

                        │

                 Terraform Apply

                        │

                 Amazon API Gateway

                        │

                   AWS Lambda

                        │

        ┌───────────────┼───────────────┐

        │               │               │

   Amazon DynamoDB   Amazon S3   Amazon EventBridge

                                        │

                              ┌─────────┴─────────┐

                              │                   │

                         Amazon SNS         Amazon SQS

                        │

                Amazon CloudWatch

                        │

                  AWS X-Ray
```

---

# Architecture Decisions

| Decision             | Reason                                      |
| -------------------- | ------------------------------------------- |
| Serverless           | Lower operational overhead                  |
| Lambda               | Pay-per-use compute                         |
| API Gateway          | Managed REST API                            |
| DynamoDB             | Fully managed NoSQL database                |
| Terraform            | Infrastructure as Code                      |
| Single Lambda Router | Simpler architecture for a beginner project |
| Layered application  | Better separation of concerns               |
| IAM Least Privilege  | Improved security                           |
| API Versioning       | Easier future evolution                     |

---

# Summary

This architecture demonstrates many of the core AWS services and design principles commonly used in modern cloud-native applications while remaining approachable for beginners. As additional phases are completed, the project will evolve into a production-inspired serverless application featuring monitoring, security enhancements, event-driven integrations, CI/CD, and multi-environment deployments.
