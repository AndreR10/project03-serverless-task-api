# Troubleshooting guide

This document is for the most common beginner problems in this project.

The best debugging flow is usually:

```text
GitHub Actions or local deploy
        |
        v
Terraform validation / plan
        |
        v
AWS resource check
        |
        v
CloudWatch logs
        |
        v
IAM permissions and configuration
```

This order helps you isolate the root cause quickly.

---

## 1) AWS credentials errors

### Symptom

```text
No valid credential sources found
```

or

```text
Invalid provider configuration
```

### Cause

Terraform cannot authenticate with AWS.

### Fix

Check your AWS identity:

```bash
aws sts get-caller-identity
```

If it fails, configure AWS CLI:

```bash
aws configure
```

Then verify again.

---

## 2) Terraform init or validate fails

### Symptom

```text
Error: failed to validate
```

or provider-related messages.

### Cause

Configuration is missing or invalid.

### Fix

Run:

```bash
terraform init
terraform validate
```

If needed, also format the files:

```bash
terraform fmt -recursive
```

---

## 3) GitHub OIDC authentication fails

### Symptom

GitHub Actions cannot assume the AWS role.

### Cause

The trust policy does not match the repository or branch, or the GitHub variables are wrong.

### Fix

Check:

- `OWNER_ID` is correct
- `REPOSITORY_ID` is correct
- the workflow uses `vars.OWNER_ID` and `vars.REPOSITORY_ID`
- the branch matches the trust policy
- the role ARN exists and is valid

The trust policy should target the exact repository and branch, not a broad wildcard.

---

## 4) Lambda returns 500

### Symptom

```json
{
  "message": "Internal server error"
}
```

### Cause

The Lambda function threw an exception.

Common reasons:

- missing environment variables
- invalid DynamoDB table name
- Node.js runtime error
- IAM permission issue
- broken request payload

### Fix

Check CloudWatch Logs for the Lambda function.

Look for the stack trace and fix the code or configuration.

---

## 5) Lambda cannot access DynamoDB

### Symptom

```text
AccessDeniedException
```

### Cause

The Lambda execution role does not have the required DynamoDB permissions.

### Fix

Verify the IAM role has permission to:

- `dynamodb:GetItem`
- `dynamodb:PutItem`
- `dynamodb:UpdateItem`
- `dynamodb:DeleteItem`
- `dynamodb:Scan`

Then run:

```bash
terraform apply
```

---

## 6) API Gateway returns 403

### Symptom

```text
403 Forbidden
```

### Cause

API Gateway is not allowed to invoke the Lambda function.

### Fix

Check the Lambda permission resource and redeploy or apply Terraform again.

---

## 7) API Gateway returns 404

### Symptom

```text
404 Not Found
```

### Cause

The route is wrong or the API stage was not deployed.

### Fix

Check:

- correct URL
- correct route
- API Gateway stage exists
- deploy happened after changes

Example route:

```text
https://<api-id>.execute-api.<region>.amazonaws.com/dev/v1/tasks
```

---

## 8) Changes are not reflected after deploy

### Symptom

The code changes are not visible in the live API.

### Cause

Terraform or API Gateway deployment did not detect the update.

### Fix

Rebuild the Lambda package and reapply Terraform:

```bash
cd app
npm install
cd ../scripts
./build.sh
cd ../terraform
terraform plan
terraform apply
```

If needed, redeploy the API Gateway stage.

---

## 9) `terraform plan` shows unexpected changes

### Cause

This often means:

- manual changes were made in AWS console
- the state file is stale or drifted
- provider versions changed

### Fix

Review the plan carefully. If resources were changed manually, reconcile them with Terraform instead of editing AWS directly.

---

## 10) CloudWatch logs are missing

### Cause

The function was not invoked or the Lambda role is missing logging permissions.

### Fix

Make sure the execution role has:

- `logs:CreateLogGroup`
- `logs:CreateLogStream`
- `logs:PutLogEvents`

Also verify the Lambda function is actually being called.

---

## Useful commands

Check AWS identity:

```bash
aws sts get-caller-identity
```

Initialize Terraform:

```bash
terraform init
```

Validate configuration:

```bash
terraform validate
```

Review infrastructure changes:

```bash
terraform plan
```

Apply changes:

```bash
terraform apply
```

Destroy resources:

```bash
terraform destroy
```

---

## Beginner checklist before troubleshooting

Before jumping into fixes, confirm:

- [ ] AWS credentials are valid
- [ ] Terraform config validates
- [ ] Terraform plan shows expected changes
- [ ] API Gateway is deployed
- [ ] Lambda role has the right permissions
- [ ] CloudWatch logs have no hidden errors
- [ ] the API URL is correct
- [ ] the GitHub OIDC values are correct

---

## Beginner takeaway

Most problems in this project are usually caused by a small mismatch:

- wrong AWS credentials
- wrong route or URL
- wrong IAM permission
- bad Terraform config
- wrong GitHub variable value

Fixing those usually solves the issue quickly.
