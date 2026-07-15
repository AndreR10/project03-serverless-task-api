# Serverless Task Management API

A production-inspired serverless REST API built on AWS using Infrastructure as Code (Terraform). This project is designed as a learning portfolio to demonstrate cloud engineering, serverless architecture, and infrastructure automation skills while staying within the AWS Free Tier whenever possible.

> **Current Status:** Phase 1 Completed – Core Serverless Application

---

# Project Goals

This project was created to prepare for entry-level positions such as:

- Junior Cloud Engineer
- Cloud Developer
- Cloud Native Engineer
- DevOps Engineer (Junior)

The primary focus is on AWS architecture and infrastructure rather than complex application development.

---

# Features

Current functionality includes:

- Create a task
- List all tasks
- Get a task by ID
- Update a task
- Delete a task

The API follows REST principles and uses a single Lambda Router pattern to process all requests.

---

# AWS Services Used

| Service                | Purpose                                    |
| ---------------------- | ------------------------------------------ |
| AWS Lambda             | Executes the application code              |
| Amazon API Gateway     | Exposes the REST API                       |
| Amazon DynamoDB        | Stores task data                           |
| AWS IAM                | Controls permissions using least privilege |
| Amazon CloudWatch Logs | Captures Lambda execution logs             |
| Terraform              | Provisions and manages infrastructure      |

---

# Architecture

```text
                    Client

                       │

              HTTPS Request

                       │

               Amazon API Gateway

                       │

                REST API (/v1)

                       │

                 AWS Lambda

                       │

          ┌────────────┴────────────┐

          │                         │

     Service Layer           Utility Layer

          │

     Repository Layer

          │

      Amazon DynamoDB

          │

   Amazon CloudWatch Logs
```

---

# Technology Stack

## Cloud

- AWS Lambda
- Amazon API Gateway
- Amazon DynamoDB
- AWS IAM
- Amazon CloudWatch

## Infrastructure as Code

- Terraform

## Backend

- Node.js 24.x
- AWS SDK v3

## Development Tools

- Git
- GitHub
- Visual Studio Code
- Bash

---

# Repository Structure

```text
project03-serverless-task-api/

├── app/
│   ├── src/
│   │   ├── handlers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── validators/
│   │   └── utils/
│   │
│   ├── package.json
│   └── package-lock.json
│
├── build/
│
├── docs/
│
├── scripts/
│   └── build.sh
│
└── terraform/
    ├── api_gateway.tf
    ├── dynamodb.tf
    ├── iam.tf
    ├── lambda.tf
    ├── locals.tf
    ├── outputs.tf
    ├── providers.tf
    └── variables.tf
```

---

# API Endpoints

| Method | Endpoint       | Description              |
| ------ | -------------- | ------------------------ |
| POST   | /v1/tasks      | Create a new task        |
| GET    | /v1/tasks      | Retrieve all tasks       |
| GET    | /v1/tasks/{id} | Retrieve a specific task |
| PUT    | /v1/tasks/{id} | Update a task            |
| DELETE | /v1/tasks/{id} | Delete a task            |

---

# Deploying the Project

## Prerequisites

- AWS Account
- AWS CLI configured
- Terraform installed
- Node.js 24.x
- Git

## Build the Lambda Package

```bash
cd scripts
./build.sh
```

## Deploy Infrastructure

```bash
cd terraform

terraform init

terraform fmt

terraform validate

terraform plan

terraform apply
```

After deployment, Terraform outputs the API Gateway endpoint.

---

# Testing the API

Example request:

```bash
curl -X POST \
https://YOUR_API_ID.execute-api.eu-west-1.amazonaws.com/dev/v1/tasks \
-H "Content-Type: application/json" \
-d '{
"title":"Study AWS",
"description":"Complete Module 1"
}'
```

---

# Terraform Concepts Demonstrated

- Variables
- Locals
- Outputs
- Resource dependencies
- Resource tagging
- Dynamic resources using `for_each`
- Infrastructure state management
- Infrastructure provisioning
- Infrastructure destruction

---

# AWS Concepts Demonstrated

- Serverless Computing
- REST APIs
- Infrastructure as Code
- IAM Least Privilege
- Lambda Proxy Integration
- DynamoDB CRUD Operations
- CloudWatch Logging
- Resource Tagging
- Environment Variables

---

# Cost Considerations

The project has been designed to stay within the AWS Free Tier under normal learning usage.

Key optimizations include:

- Lambda serverless compute
- DynamoDB On-Demand billing
- 128 MB Lambda memory
- Pay-per-request architecture
- Minimal resource footprint

---

# Future Improvements

The following features will be added during future phases:

- CloudWatch Metrics
- CloudWatch Alarms
- Amazon S3 file attachments
- GitHub Actions CI/CD
- Amazon EventBridge
- Amazon SNS notifications
- Amazon SQS asynchronous processing
- Lambda Layers
- AWS X-Ray tracing
- Multi-environment deployments (dev/prod)
- Terraform modules
- Automated testing
- Security hardening
- API authentication

---

# Learning Outcomes

By completing this project, you will gain practical experience with:

- Designing serverless applications
- Building REST APIs on AWS
- Managing infrastructure using Terraform
- Applying IAM least privilege principles
- Deploying cloud-native applications
- Structuring production-inspired cloud projects
- Troubleshooting common AWS deployment issues

---

# Documentation

Additional documentation is available in the `docs/` directory.

- Architecture
- AWS Services
- Terraform
- Deployment Guide
- API Reference
- Testing Guide
- Troubleshooting
- Cost Estimation
- Architecture Decisions

---

# License

This project is provided for educational purposes and portfolio development.
