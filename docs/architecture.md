# Architecture

## Overview

The **Serverless Task Management API** is a cloud-native application built using AWS serverless services. The project follows a layered architecture to separate infrastructure, business logic, and data access while keeping the application simple enough for beginners.

The primary objective is to demonstrate AWS architecture and Infrastructure as Code (Terraform) rather than advanced application development.

---

# High-Level Architecture

```text
                        Client

                           │

                   HTTPS Request

                           │

                    Amazon API Gateway

                           │

                 REST API (/v1/tasks)

                           │

                     AWS Lambda Router

                           │

          ┌────────────────┴────────────────┐

          │                                 │

      Service Layer                  Utility Layer

          │

     Repository Layer

          │

     Amazon DynamoDB

          │

   Amazon CloudWatch Logs
```

---

# Request Flow

The following sequence describes how a typical request is processed.

## Example: Create Task

```text
Client

↓

POST /v1/tasks

↓

Amazon API Gateway

↓

AWS Lambda

↓

Task Service

↓

Task Repository

↓

Amazon DynamoDB

↓

Response

↓

API Gateway

↓

Client
```

---

# Component Responsibilities

## Amazon API Gateway

Responsibilities:

- Exposes the REST API
- Receives HTTPS requests
- Performs request routing
- Invokes AWS Lambda using Lambda Proxy Integration
- Returns HTTP responses

Why it was chosen:

- Fully managed
- Serverless
- Scales automatically
- Integrated with Lambda
- Pay-per-request pricing

---

## AWS Lambda

Responsibilities:

- Executes application logic
- Routes requests based on HTTP method
- Calls the service layer
- Returns structured responses
- Logs execution details

Architecture pattern:

```text
Handler

↓

Service

↓

Repository

↓

DynamoDB
```

Benefits:

- No servers to manage
- Automatic scaling
- Pay only for execution time

---

## Service Layer

Responsibilities:

- Business logic
- Input validation
- Creating task IDs
- Preparing responses
- Coordinating repository operations

This layer keeps business rules separate from infrastructure code.

---

## Repository Layer

Responsibilities:

- Interacts with DynamoDB
- Executes CRUD operations
- Isolates database access from business logic

Benefits:

- Easier maintenance
- Easier testing
- Better separation of concerns

---

## Amazon DynamoDB

Responsibilities:

- Stores task records
- Provides highly available NoSQL storage
- Supports serverless workloads

Current table design:

| Attribute   | Type   | Purpose          |
| ----------- | ------ | ---------------- |
| id          | String | Partition Key    |
| title       | String | Task title       |
| description | String | Task description |
| status      | String | Task status      |

Billing mode:

```text
PAY_PER_REQUEST
```

Chosen because it fits AWS Free Tier usage and removes capacity management.

---

## Amazon CloudWatch Logs

Responsibilities:

- Store Lambda logs
- Capture runtime errors
- Assist troubleshooting
- Support operational monitoring

Current usage:

- Console logging
- Error logging

Future phases will add:

- Metrics
- Alarms
- Dashboards

---

# Layered Application Architecture

The backend follows a layered design.

```text
Handler

↓

Service

↓

Repository

↓

Database
```

Each layer has a single responsibility.

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
