# Deployment guide

This guide explains how to deploy the project in a beginner-friendly way using the current setup: Terraform + GitHub Actions + AWS OIDC.

The main idea is simple:

- GitHub Actions starts the deployment
- AWS verifies the GitHub identity through OIDC
- the deployment role is assumed securely
- Terraform creates the infrastructure

This project does not use long-lived AWS access keys in GitHub.

---

## Prerequisites

Before deploying, make sure you have:

- an AWS account
- AWS CLI installed and configured
- Terraform installed
- Node.js 24 or newer
- npm
- Git
- a GitHub repository connected to this project

Check your AWS identity:

```bash
aws sts get-caller-identity
```

You should see your AWS account details.

---

## 1) Prepare GitHub variables

Go to your repository in GitHub and create the following repository variables under:

Settings → Secrets and variables → Actions → Variables

Add:

- `OWNER_ID`
- `REPOSITORY_ID`
- `ALERT_EMAIL`

Example values:

```text
OWNER_ID = 45071609
REPOSITORY_ID = 1379626013
ALERT_EMAIL = you@example.com
```

You can get the values with:

```bash
gh api user --jq '.id'
gh api repos/YOUR_USERNAME/YOUR_REPO --jq '.id'
```

---

## 2) Create the AWS deployment secret

Create a GitHub secret called:

- `AWS_DEPLOY_ROLE_ARN`

This value is filled after Terraform creates the IAM role. It is not the AWS access key; it is the ARN of the AWS role that GitHub can assume.

---

## 3) Create the Terraform values

Copy the example file:

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

Update it with your actual values.

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

This file is mainly for local testing. GitHub deployment usually does not need it because the workflow passes values using `TF_VAR_*`.

---

## 4) Run Terraform locally first

From the terraform directory:

```bash
terraform init
terraform validate
terraform plan
```

Review the plan before applying anything.

Then:

```bash
terraform apply
```

This creates the AWS resources for the project, including the OIDC-related IAM role and trust policy.

---

## 5) Copy the role ARN into GitHub

After Terraform finishes, look for the deployment role output. Copy the role ARN value and paste it into the GitHub secret:

```text
AWS_DEPLOY_ROLE_ARN = arn:aws:iam::<account-id>:role/<role-name>
```

This is the role GitHub Actions will use to deploy.

---

## 6) Understand the OIDC trust policy

This project uses GitHub OIDC instead of static AWS keys.

The trust policy is restricted to a specific repository and branch. The pattern is similar to:

```text
repo:OWNER@OWNER_ID/REPO@REPO_ID:ref:refs/heads/main
```

This is more secure than allowing all repositories or all branches.

---

## 7) Deploy through GitHub Actions

When you push to the main branch, the deployment workflow runs.

The workflow usually includes:

```yaml
permissions:
  id-token: write
  contents: read
```

and values like:

```yaml
env:
  TF_VAR_github_owner_id: ${{ vars.OWNER_ID }}
  TF_VAR_github_repository_id: ${{ vars.REPOSITORY_ID }}
```

Then GitHub requests a short-lived token from AWS and assumes the deployment role.

---

## 8) Verify the deployment

After the workflow finishes, check:

- Terraform executed successfully
- the role was assumed without AWS keys
- the Lambda function exists
- the API Gateway endpoint is deployed
- the application responds to API calls

You can also verify the application with curl:

```bash
curl https://YOUR_API_ID.execute-api.eu-west-1.amazonaws.com/dev/v1/tasks
```

---

## Common deployment checklist

Before you consider deployment successful, check:

- [ ] AWS CLI is configured
- [ ] GitHub variables exist
- [ ] `AWS_DEPLOY_ROLE_ARN` is set
- [ ] Terraform validates successfully
- [ ] Terraform plan looks correct
- [ ] GitHub workflow has `id-token: write`
- [ ] the branch is correct (`main` in most cases)
- [ ] the API is reachable after deployment

---

## Beginner takeaway

The deployment model is:

```text
Code change -> GitHub push -> GitHub Actions -> OIDC -> AWS role -> Terraform -> AWS resources
```

This is a modern and secure way to deploy cloud infrastructure without storing AWS credentials in GitHub.
