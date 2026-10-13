# Testing guide

This project has two kinds of testing:

1. application testing in the local codebase
2. deployment and smoke testing in AWS

The goal is to catch problems early before you rely on the deployed API.

---

## App-level checks

Before deployment, you should run the project checks locally.

From the app folder:

```bash
cd app
npm install
npm run lint
npm test
```

These checks help confirm that the Node.js code is valid and that the app logic behaves as expected.

---

## Terraform validation

Before applying infrastructure changes, always validate the Terraform files.

```bash
cd terraform
terraform init -backend=false
terraform validate
terraform plan
```

This confirms that your configuration is valid and shows what will change in AWS.

---

## Smoke tests for the deployed API

Once the API is deployed, test the endpoints with curl.

### 1) Create a task

```bash
curl -X POST \
  https://YOUR_API_ID.execute-api.eu-west-1.amazonaws.com/dev/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Study AWS",
    "description":"Complete Module 8"
  }'
```

Expected result:

- HTTP 201
- response contains task data

---

### 2) List tasks

```bash
curl https://YOUR_API_ID.execute-api.eu-west-1.amazonaws.com/dev/v1/tasks
```

Expected result:

- HTTP 200
- JSON list of tasks

---

### 3) Get one task

```bash
curl https://YOUR_API_ID.execute-api.eu-west-1.amazonaws.com/dev/v1/tasks/<TASK_ID>
```

Expected result:

- HTTP 200
- JSON object for the selected task

---

### 4) Update a task

```bash
curl -X PUT \
  https://YOUR_API_ID.execute-api.eu-west-1.amazonaws.com/dev/v1/tasks/<TASK_ID> \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Study Terraform",
    "description":"Complete Module 9",
    "status":"IN_PROGRESS"
  }'
```

Expected result:

- HTTP 200
- updated values are returned or confirmed by the next read

---

### 5) Delete a task

```bash
curl -X DELETE https://YOUR_API_ID.execute-api.eu-west-1.amazonaws.com/dev/v1/tasks/<TASK_ID>
```

Expected result:

- HTTP 200
- task no longer exists in future reads

---

## Negative tests

It is also useful to check failures.

### Invalid payload

```bash
curl -X POST \
  https://YOUR_API_ID.execute-api.eu-west-1.amazonaws.com/dev/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{}'
```

Expected result:

- HTTP 400

### Invalid route

```bash
curl https://YOUR_API_ID.execute-api.eu-west-1.amazonaws.com/dev/v1/does-not-exist
```

Expected result:

- HTTP 404

---

## Check AWS resources

After deployment, verify the major pieces are active.

### DynamoDB

Check the table exists and contains the data you added.

### Lambda

Verify the function exists and CloudWatch logs show successful invocations.

### API Gateway

Make sure the stage is deployed and the endpoint is reachable.

### CloudWatch Logs

Check the Lambda log group for failures, stack traces, or debug output.

---

## Simple test checklist

Use this quick list every time you deploy:

- [ ] app lint passes
- [ ] app tests pass
- [ ] Terraform validates
- [ ] Terraform plan looks correct
- [ ] API returns 200 or 201 for valid requests
- [ ] invalid requests return 400 or 404
- [ ] CloudWatch logs are being created
- [ ] DynamoDB is storing records

---

## Beginner takeaway

Testing in a serverless app is not only about the JS code. It also includes:

- Terraform correctness
- AWS resource health
- API response behavior
- CloudWatch debugging

That combination is what makes a deployment reliable.
