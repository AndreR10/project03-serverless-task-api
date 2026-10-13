# Terraform guide

This project uses Terraform to create and manage the AWS infrastructure in a repeatable way.

Instead of clicking around in the AWS console, you write infrastructure as code. That means your cloud setup is saved in files, reviewed in Git, and recreated consistently whenever needed.

---

## Why Terraform is used here

Terraform helps with:

- repeatable deployments
- better team collaboration
- version-controlled infrastructure
- easier reproduction of environments
- less manual configuration mistakes

This is especially important for a portfolio project because it shows a professional cloud workflow.

---

## Project structure

The Terraform configuration is split into a few main areas:

```text
terraform/
├── main.tf
├── variables.tf
├── locals.tf
├── providers.tf
├── outputs.tf
├── terraform.tfvars.example
├── modules/
│   ├── api/
│   ├── compute/
│   ├── dynamodb/
│   ├── github-actions/
│   ├── monitoring/
│   ├── parameter-store/
│   ├── s3/
│   └── security/
└── backend.tf
```

This is a modular approach: smaller pieces are grouped by concern, which makes the project easier to maintain.

---

## Important Terraform files

### `variables.tf`

This file declares the input variables for the project.

Examples include:

- region
- environment
- project_name
- alert_email
- GitHub owner and repo identifiers

These values can change from one environment or deployment to another.

---

### `terraform.tfvars.example`

This is a template you copy and customize locally.

Example:

```hcl
region = "eu-west-1"
environment = "dev"
project_name = "task-api"
alert_email = "your-email@example.com"

github_owner = "YOUR_GITHUB_USERNAME"
github_owner_id = "YOUR_GITHUB_OWNER_ID"
github_repository = "project03-serverless-task-api"
github_repository_id = "YOUR_GITHUB_REPOSITORY_ID"
github_branch = "main"
```

This file is not meant to be committed with real values.

---

### `backend.tf`

This configures the backend used for Terraform state.

For real projects, the state should usually live in a remote backend, not only in a local file.

---

### `main.tf`

This file wires the root module together and calls the child modules.

It is the place where the project is assembled from smaller Terraform modules.

---

## `TF_VAR_*` environment variables

Terraform supports environment variables in this format:

```bash
TF_VAR_github_owner_id=123456
```

That value is automatically mapped to the Terraform variable:

```hcl
variable "github_owner_id" {
  type = string
}
```

This is exactly how GitHub Actions passes values into Terraform in this project.

Example in GitHub Actions:

```yaml
TF_VAR_github_owner_id: ${{ vars.OWNER_ID }}
TF_VAR_github_repository_id: ${{ vars.REPOSITORY_ID }}
```

This means:

- GitHub variables are the source values
- `TF_VAR_*` is the bridge to Terraform
- the Terraform input variable names must match

---

## Terraform workflow

### 1. Initialize

```bash
terraform init
```

This downloads providers and prepares the working directory.

### 2. Format

```bash
terraform fmt
```

This keeps the code clean and consistent.

### 3. Validate

```bash
terraform validate
```

This checks whether the configuration is syntactically and logically valid.

### 4. Plan

```bash
terraform plan
```

This shows what Terraform is going to create or modify.

### 5. Apply

```bash
terraform apply
```

This creates or updates the infrastructure in AWS.

### 6. Destroy

```bash
terraform destroy
```

This removes all infrastructure managed by Terraform.

---

## Important beginner concept: state

Terraform tracks the current infrastructure in a state file.

This helps Terraform know:

- what already exists
- what needs to change
- what is safe to update

You should treat Terraform state as important infrastructure data.

---

## Beginner takeaway

The core idea is simple:

- write infrastructure in code
- let Terraform compare code vs AWS
- apply only the required changes
- keep deployments consistent and trackable

That is the foundation of modern cloud infrastructure management.

```text
terraform apply

↓

IAM Role

↓

DynamoDB Table

↓

Lambda Package

↓

Lambda Function

↓

API Gateway

↓

Lambda Permission

↓

API Deployment

↓

API Stage

↓

Outputs
```

---

# Best Practices

This project follows several Terraform best practices:

- Separate files by responsibility
- Use variables
- Use locals
- Apply consistent tags
- Use `for_each` to reduce duplication
- Keep infrastructure under version control
- Avoid hardcoded values
- Follow the Principle of Least Privilege
- Review every `terraform plan`
- Format and validate before applying

---

# Common Beginner Mistakes

❌ Editing resources manually after Terraform creates them

❌ Forgetting to run `terraform init`

❌ Ignoring `terraform plan`

❌ Hardcoding values instead of using variables

❌ Using overly permissive IAM policies

❌ Deleting resources directly in AWS instead of using Terraform

❌ Committing `terraform.tfstate` to Git

---

# Files That Should Not Be Committed

Add these entries to `.gitignore`:

```text
.terraform/
*.tfstate
*.tfstate.*
.terraform.lock.hcl
task-api.zip
```

> **Note:** Whether to commit `.terraform.lock.hcl` depends on your team's practices. For many production projects, it is committed to ensure consistent provider versions. For a learning project, discuss the trade-offs in your README or team guidelines.

---

# Skills Demonstrated

By completing this phase, you have practiced:

- Infrastructure as Code
- AWS resource provisioning
- Provider configuration
- Variables and locals
- Dynamic resources with `for_each`
- IAM configuration
- Lambda deployment
- API Gateway configuration
- Terraform state management
- Deployment lifecycle
- Infrastructure automation

These are foundational Terraform skills used daily by Cloud Engineers, DevOps Engineers, and Platform Engineers.
