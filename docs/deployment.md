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

## Using a different AWS account or a new user

There are two separate identities in this setup:

- **Your local AWS identity** is used when you run Terraform from your computer.
- **The GitHub deployment role** is used by GitHub Actions through OIDC. It does not use your local login or AWS access keys.

### If a new person needs access to an existing account

Ask the account administrator to give you access through **AWS IAM Identity Center** (also called AWS SSO) and assign a permission set that allows you to run this project's Terraform setup. The Terraform configuration creates and updates AWS services and IAM resources, so read-only access is not enough.

Configure and sign in to a local AWS CLI profile:

```bash
aws configure sso --profile task-api-admin
aws sso login --profile task-api-admin
export AWS_PROFILE=task-api-admin
aws sts get-caller-identity
```

The first command asks for your organization's SSO start URL and region. The last command should show the account and identity you were given. Do not use the AWS root user for routine work. If your organization cannot use IAM Identity Center, ask its administrator for an approved alternative; do not put access keys in GitHub.

If the account and infrastructure are already set up, you normally do not need to create another GitHub OIDC role or change `AWS_DEPLOY_ROLE_ARN`. Your local profile is for your own Terraform commands; GitHub continues using the existing deployment role.

### If this is a new AWS account

First configure and verify your local profile as above. Then create the remote Terraform state bucket, because the main Terraform configuration needs that bucket before it can initialize:

```bash
cd terraform-backend
terraform init
terraform apply
```

The state bucket name must be globally unique across AWS. This project currently expects `task-api-terraform-state-bucket`. If that name is unavailable, choose a unique name and use the same name in all three places: `terraform-backend`'s project value (which builds the bucket name), `terraform/backend.tf`, and the `terraform_state_bucket` value passed to the GitHub Actions module in `terraform/main.tf`.

After the bucket exists, configure the main Terraform deployment:

```bash
cd ../terraform
cp terraform.tfvars.example terraform.tfvars
```

Set the GitHub owner, owner ID, repository name, repository ID, branch, and alert email in `terraform.tfvars`. Then create the project resources and GitHub OIDC role using your local profile:

```bash
terraform init
terraform validate
terraform plan
terraform apply
```

Review the plan before approving it. After the apply completes, get the role ARN with `terraform output -raw github_actions_role_arn` and save it as the repository secret `AWS_DEPLOY_ROLE_ARN`. Set the repository variables `OWNER_ID`, `REPOSITORY_ID`, and `ALERT_EMAIL` as described below. GitHub Actions can then deploy to this AWS account.

The initial local apply needs an AWS identity authorized to create the project's resources and IAM roles and policies. After the OIDC deployment role is created, GitHub uses that role for future deployments.

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

The deploy workflow starts after the `CI` workflow succeeds for a commit on `main`. It checks out the project, sets up Node.js 24, builds the Lambda package, assumes the AWS deployment role through OIDC, and then runs Terraform plan and apply. The frontend is uploaded by Terraform to an S3 static website bucket; Terraform generates `config.js` with the API Gateway stage URL.

### Allow the public website bucket

The previous `PutBucketPolicy` error says account-level or organization-level S3 Block Public Access is preventing public bucket policies. As the account administrator, inspect the account setting:

```bash
AWS_ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
aws s3control get-public-access-block --account-id "$AWS_ACCOUNT_ID" --region eu-west-1
```

If your organization permits a public-read demo website, keep ACL-based public access blocked and disable the two account-wide settings that prevent bucket policies from granting public reads:

```bash
aws s3control put-public-access-block \
  --account-id "$AWS_ACCOUNT_ID" \
  --region eu-west-1 \
  --public-access-block-configuration '{"BlockPublicAcls":true,"IgnorePublicAcls":true,"BlockPublicPolicy":false,"RestrictPublicBuckets":false}'
```

**This changes S3 public-access guardrails for the entire account.** It does not make every bucket public, but it allows bucket policies to do so. The frontend bucket policy grants only `s3:GetObject` on this website's files. Do not run this command if an AWS Organizations policy requires public access to remain blocked; that policy must be changed by the organization administrator.

If `get-public-access-block` reports `NoSuchPublicAccessBlockConfiguration`, no account-level setting is configured. The frontend module sets the bucket-level `BlockPublicPolicy` and `RestrictPublicBuckets` flags to `false` and applies them before its bucket policy. If `PutBucketPolicy` is still denied, check whether AWS Organizations enforces a public-access restriction; do not broaden account settings without confirming the source of the denial.

After the effective account or organization setting permits the bucket policy, use an authorized AWS profile to review and apply the project:

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

Review the plan before applying. If a failed earlier apply created the frontend bucket, Terraform should reuse it. Its `force_destroy` setting means a later destroy can remove the bucket and its contents, so keep only generated website files there.

---

## 8) Verify the deployment

After the workflow finishes, check:

- Terraform executed successfully
- the role was assumed without AWS keys
- the Lambda function exists
- the API Gateway endpoint is deployed
- the S3 website URL is reachable
- the application responds to API calls

Get the dashboard URL with:

```bash
cd terraform
terraform output -raw frontend_url
```

The `frontend_url` Terraform output is the S3 website endpoint. Open it in a browser. The S3 website endpoint uses HTTP; the task API itself remains HTTPS.

Because the S3 website and API Gateway have different origins, the API's CORS headers allow the dashboard to call the task routes from a browser.

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
