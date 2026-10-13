# AWS services used in this project

This project is built on a small but realistic AWS serverless setup. Each service has a specific job, and together they form a complete application flow.

---

## Service overview

| Service | What it does | Why it is here |
| ------- | ------------ | -------------- |
| AWS Lambda | Runs the backend code | Handles requests and business logic |
| Amazon API Gateway | Exposes the API | Lets clients call the app over HTTP |
| Amazon DynamoDB | Stores task data | Keeps the app stateful |
| AWS IAM | Controls permissions | Keeps access secure |
| CloudWatch | Stores logs and metrics | Helps with debugging and monitoring |
| Amazon S3 | Stores deployment artifacts | Used for Terraform state and app packaging |
| Systems Manager Parameter Store | Stores config values | Keeps environment config separate |
| GitHub Actions | Runs automation | Deploys the project through CI/CD |

---

## AWS Lambda

AWS Lambda is the compute layer of the project.

When API Gateway receives a request, it triggers a Lambda function. The function reads the request, runs the relevant logic, and returns a response.

Why it matters:

- there are no servers to manage
- it scales automatically
- you pay only when it runs

In this project, Lambda is responsible for:

- creating tasks
- listing tasks
- retrieving a single task
- updating a task
- deleting a task

---

## Amazon API Gateway

API Gateway is the public entry point for the app.

It receives HTTP requests and forwards them to Lambda. It also returns the HTTP responses to clients.

This is how the app is exposed as a REST API.

Normally the pattern looks like:

```text
Client -> API Gateway -> Lambda -> DynamoDB
```

---

## Amazon DynamoDB

DynamoDB is the database in this project.

It stores each task as a record with fields such as:

- id
- title
- description
- status

Why DynamoDB is a good fit here:

- serverless by design
- fast access
- simple CRUD operations
- good fit for small application data

---

## AWS IAM

IAM is responsible for access control.

This project uses IAM to give AWS resources the minimum permissions they need.

Examples:

- Lambda reads and writes to DynamoDB
- GitHub Actions assumes a deployment role through OIDC
- Terraform creates permissions for the infrastructure it manages

This is a key security concept in AWS: least privilege.

---

## CloudWatch

CloudWatch captures logs from Lambda so you can see what happened during execution.

It is useful when:

- the API returns 500 errors
- a function fails
- you want to inspect request processing
- you need to debug deployment issues

Without CloudWatch, debugging serverless apps becomes much harder.

---

## Amazon S3

S3 is used to store deployment artifacts and project generated content.

In this project, S3 is relevant for:

- packaging code for deployment
- storing Terraform state artifacts or build output
- supporting static and operational resources

---

## AWS Systems Manager Parameter Store

SSM Parameter Store is used to store configuration values outside the application code.

This is useful when you want to keep things like:

- environment information
- configuration values
- secrets or config references

Without it, configuration can become scattered and harder to manage.

---

## GitHub Actions

GitHub Actions connects your repository to AWS.

In this project, it is used to:

- run validation checks
- deploy Terraform
- trigger a secure deployment on the main branch

The important part is that it does not rely on long-lived AWS keys. It uses OIDC instead.

---

## Beginner takeaway

These services work together like a small cloud app:

- GitHub starts the deployment
- IAM and OIDC authorize the workflow
- Terraform builds the AWS resources
- API Gateway exposes the app
- Lambda handles logic
- DynamoDB stores the data
- CloudWatch helps you debug problems

This is the basic pattern used by real serverless applications.
