# Serverless Task Management API

This project is a beginner-friendly AWS serverless API that shows how to build, deploy, and automate a real cloud application with:

- Node.js
- AWS Lambda
- API Gateway
- DynamoDB
- SSM Parameter Store
- CloudWatch
- Terraform
- GitHub Actions
- GitHub OIDC authentication to AWS

The goal is to help you learn how real-world cloud projects are structured without using long-lived AWS credentials in GitHub.

---

## What this project does

This API allows you to manage tasks with a simple REST interface.

Example actions:

- Create a task
- List all tasks
- Get one task by ID
- Update a task
- Delete a task

At the infrastructure level, Terraform creates and manages:

- API Gateway
- Lambda function
- DynamoDB table
- SSM parameters
- S3 bucket for Lambda artifacts
- CloudWatch alarms and dashboard
- IAM roles and policies
- GitHub OIDC provider and deployment role

---

## Architecture overview

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
   | OIDC
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
   +--> SSM Parameter Store
   +--> CloudWatch
   +--> IAM
   |
   v
AWS
```

The app flow is basic and beginner-friendly:

```text
Client -> API Gateway -> Lambda -> DynamoDB
                          |
                          v
                    SSM Parameters
```

---

## Technologies used

### Application

- Node.js 24
- AWS SDK v3
- JavaScript

### AWS services

- AWS Lambda
- API Gateway
- DynamoDB
- SSM Parameter Store
- S3
- CloudWatch
- IAM

### Infrastructure as Code

- Terraform

### CI/CD

- GitHub Actions
- OIDC authentication with AWS

---

## Repository structure

```text
project03-serverless-task-api/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── app/
│   ├── scripts/
│   ├── src/
│   ├── tests/
│   ├── eslint.config.js
│   ├── package.json
│   └── package-lock.json
├── docs/
├── scripts/
├── terraform/
│   ├── archive.tf
│   ├── backend.tf
│   ├── locals.tf
│   ├── main.tf
│   ├── outputs.tf
│   ├── providers.tf
│   ├── terraform.tfvars.example
│   ├── variables.tf
│   ├── versions.tf
│   └── modules/
│       ├── api/
│       ├── compute/
│       ├── dynamodb/
│       ├── github-actions/
│       ├── monitoring/
│       ├── parameter-store/
│       ├── s3/
│       └── security/
├── README.md
├── .gitignore
├── .gitattributes
└── terraform-backend/
```

---

## API endpoints

The API is organized under the versioned route `/v1`.

- POST `/v1/tasks` — create a new task
- GET `/v1/tasks` — list all tasks
- GET `/v1/tasks/{id}` — get one task
- PUT `/v1/tasks/{id}` — update a task
- DELETE `/v1/tasks/{id}` — delete a task

---

## Local development setup

### Prerequisites

Before you start, make sure you have:

- Node.js 24 or newer
- npm
- Terraform installed
- AWS CLI configured locally
- Git
- An AWS account with permission to create resources

### 1) Install app dependencies

```bash
cd app
npm install
```

### 2) Run lint and tests

```bash
npm run lint
npm test
```

These checks help make sure the app code is valid before deployment.

---

## Terraform setup

The Terraform project lives in the `terraform/` folder.

### 1) Create your local tfvars file

Use the example file as a starting point:

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

Then edit `terraform.tfvars` with your values.

Example:

```hcl
region       = "eu-west-1"
environment  = "dev"
project_name = "task-api"
alert_email  = "your-email@example.com"

github_owner         = "YOUR_GITHUB_USERNAME"
github_owner_id      = "YOUR_GITHUB_OWNER_ID"
github_repository    = "project03-serverless-task-api"
github_repository_id = "YOUR_GITHUB_REPOSITORY_ID"
github_branch        = "main"
```

This file is local to your machine and should not be committed.

### Quick explanation: `TF_VAR_*` and GitHub variables

In GitHub Actions, Terraform values are usually passed as environment variables such as:

```yaml
TF_VAR_github_owner_id: ${{ vars.OWNER_ID }}
TF_VAR_github_repository_id: ${{ vars.REPOSITORY_ID }}
```

This works because Terraform automatically reads environment variables in the form `TF_VAR_<variable_name>`. For example, `TF_VAR_github_owner_id` fills the Terraform input variable named `github_owner_id`.

So the rule is simple:

- GitHub repository variables are the source values
- `TF_VAR_...` is the bridge between GitHub Actions and Terraform
- the Terraform variable names must match the names being passed

### How to get the GitHub owner and repository IDs

You usually need the numeric repository owner ID and repository ID because the OIDC trust policy is more specific when it references those values.

You can get them in GitHub in a few ways:

1. Using the GitHub website:
   - open the repository page
   - open the Settings tab
   - check your repository details and owner information
   - use the repository ID shown in metadata or a GitHub API response

2. Using the GitHub CLI:

```bash
gh api user --jq '.id'
gh api repos/OWNER/REPO --jq '.id'
```

3. Using the REST API directly:

```bash
curl -s https://api.github.com/repos/OWNER/REPO | jq '.owner.id, .id'
```

The important thing is that these values are only needed for the deployment trust policy. They are not the same as your AWS keys.

> Local `terraform.tfvars` is useful for manual local testing, but GitHub Actions does not need that file. In deployment, the workflow injects values with `TF_VAR_*` directly.

### 2) Initialize Terraform

```bash
terraform init
```

### 3) Preview changes

```bash
terraform plan
```

### 4) Apply changes

```bash
terraform apply
```

> For this project, Terraform uses a remote S3 backend for state. Do not run apply blindly. Always review the plan first.

---

## What Terraform creates

The root Terraform project wires together several modules.

It creates or manages:

- API Gateway
- Lambda
- DynamoDB
- S3 bucket for artifacts
- SSM parameters
- CloudWatch alarm/dashboard resources
- IAM roles and policies
- GitHub OIDC deployment role

The Terraform module `github-actions` creates the AWS IAM OIDC provider and the deployment role used by GitHub Actions.

---

## GitHub OIDC and security model

This project does not use long-lived AWS access keys stored in GitHub.

Instead, GitHub Actions uses OpenID Connect (OIDC) to request a short-lived token from AWS.

### Security idea

- GitHub proves the workflow identity
- AWS checks the trust policy
- AWS issues short-lived credentials only for the allowed job
- the deployment role is restricted to specific repo and branch

### Trust policy pattern

The trust policy restricts access to the exact repository and branch.

Current GitHub OIDC subject format for newer repos is:

```text
repo:OWNER@OWNER_ID/REPO@REPO_ID:ref:refs/heads/main
```

This is stricter and safer than allowing all repos or all branches.

### Required GitHub configuration

In GitHub repository settings, configure:

- Secret: `AWS_DEPLOY_ROLE_ARN`
- Repository variables:
  - `OWNER_ID`
  - `REPOSITORY_ID`
  - `ALERT_EMAIL`

The workflow maps these values into Terraform with names like:

```yaml
TF_VAR_github_owner_id: ${{ vars.OWNER_ID }}
TF_VAR_github_repository_id: ${{ vars.REPOSITORY_ID }}
```

The deployment role ARN is then used by:

```yaml
role-to-assume: ${{ secrets.AWS_DEPLOY_ROLE_ARN }}
```

---

## GitHub Actions workflow

The repository contains two workflows:

- `ci.yml` — runs linting and Terraform validation on pull requests and pushes
- `deploy.yml` — deploys Terraform after CI succeeds on `main`

The deployment workflow:

1. checks out the project
2. requests a short-lived AWS token via OIDC
3. configures AWS credentials
4. runs `terraform init`
5. runs `terraform plan`
6. runs `terraform apply`

Important workflow permissions:

```yaml
permissions:
  id-token: write
  contents: read
```

This is required for GitHub OIDC token exchange.

---

## Deployment flow

Recommended deployment process:

1. Make code changes locally
2. Run app lint/tests
3. Run Terraform format/validate
4. Push to GitHub
5. CI runs
6. If on `main` and checks pass, deployment workflow runs
7. OIDC login to AWS succeeds
8. Terraform deploys infrastructure

This keeps the process clean and avoids storing AWS secrets in the repository.

---

## Security notes

This project follows a least-privilege mindset.

Important principles:

- no AWS access keys in GitHub secrets
- no AWS secret keys in GitHub
- no broad AdministratorAccess policy for deployment
- no `repo:*` trust pattern
- trust is restricted to this repository and branch
- IAM `PassRole` is scoped to the application Lambda role
- S3 and other permissions are limited to the project resources

This is a much safer setup than using long-lived credentials.

---

## Useful commands

### App checks

```bash
cd app
npm ci
npm run lint
npm test
```

### Terraform checks

```bash
cd terraform
terraform fmt -recursive
terraform init -backend=false
terraform validate
```

### Local deployment preview

```bash
cd terraform
terraform plan
```

### Local deployment

```bash
cd terraform
terraform apply
```

---

## Common beginner questions

### Why is OIDC better than AWS keys?

Because OIDC gives short-lived credentials automatically and avoids storing long-lived AWS secrets in GitHub.

### Why do we need owner and repository IDs?

GitHub now recommends immutable subject claims for newer repositories. These IDs help make the trust policy more specific and secure.

### What does `TF_VAR_*` mean?

It is Terraform's standard convention for reading values from environment variables. In GitHub Actions, this lets you pass repo variables into Terraform without storing them directly in a committed file.

Example:

```yaml
TF_VAR_github_owner: ${{ github.repository_owner }}
TF_VAR_github_repository: ${{ github.event.repository.name }}
```

Terraform reads those values automatically and fills the matching input variables.

### Do I need a `terraform.tfvars` file for GitHub Actions deployment?

No. GitHub Actions deployment usually uses `TF_VAR_*` environment variables from repository variables or secrets instead. A local `terraform.tfvars` file is useful only for local runs and testing.

### Why use Terraform?

Terraform lets you define infrastructure in code instead of creating resources manually in the AWS console.

### Why do we have a separate backend project?

The `terraform-backend/` folder creates the S3 bucket used for Terraform remote state. This keeps backend storage separate from app infrastructure.

---

## Future improvements

This project is already a strong portfolio project, and future improvements could include:

- environment-specific deployments such as dev/prod
- blue/green or safer release strategies
- custom API authentication and authorization
- more monitoring and alerts
- stronger separation of Terraform responsibilities
- more automated regression tests

---

## Learning outcomes

By working through this project, you will get practical experience with:

- serverless architecture design
- AWS resource provisioning with Terraform
- Lambda and API Gateway basics
- IAM least privilege
- SSM configuration patterns
- GitHub Actions automation
- GitHub OIDC security for AWS
- cloud deployment workflows used in real projects

---

## Notes

- Do not commit `terraform.tfvars` files.
- Do not commit Terraform state files.
- Keep AWS credentials out of GitHub.
- Use GitHub Actions OIDC for AWS access.
- Always review Terraform plans before apply.

---

## License

This project is intended for learning, portfolio building, and demonstration of AWS and infrastructure engineering skills.
