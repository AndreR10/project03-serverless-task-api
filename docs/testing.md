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
npm ci
npm run lint
npm test
```

These checks help confirm that the Node.js code is valid and that the app logic behaves as expected.

## Build the Lambda package

Before deploying, the workflow prepares a folder that Lambda can run. From the repository root, run:

```bash
bash scripts/build.sh
```

This script copies `app/src`, `app/package.json`, and `app/package-lock.json` into `build/`, then installs the exact production dependencies recorded in the lockfile with `npm ci --omit=dev`. Check that the handler and the dependency reported missing in the Lambda logs are present:

```bash
test -f build/src/handlers/taskHandler.js
test -f build/package.json
test -f build/node_modules/uuid/package.json
test -d build/node_modules
```

Terraform packages this `build/` folder into `terraform/build/task-api.zip`. The archive must contain `node_modules/uuid/package.json` as well as the handler. GitHub Actions checks for that file in the ZIP after `terraform plan` and stops before `apply` if it is missing. The Lambda handler setting must match the archive path: `src/handlers/taskHandler.handler`.

If an API request returns `502`, check the Lambda's CloudWatch logs. `Cannot find package 'uuid'` means the runtime dependency is missing from the ZIP. `Cannot find module 'taskHandler'` points to a handler path or ZIP layout mismatch.

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

Once the API is deployed, retrieve its URL from Terraform's state instead of typing the API ID by hand. From the repository root, run:

```bash
cd terraform
terraform init

API_URL="$(terraform output -raw api_url)"
API_BASE_URL="$(terraform output -raw api_base_url)"
LAMBDA_NAME="$(terraform output -raw lambda_name)"
FRONTEND_URL="$(terraform output -raw frontend_url)"

printf 'Tasks endpoint: %s\n' "$API_URL"
printf 'API base URL: %s\n' "$API_BASE_URL"
printf 'Lambda function: %s\n' "$LAMBDA_NAME"
printf 'Frontend URL: %s\n' "$FRONTEND_URL"
```

`api_url` includes `/v1/tasks`, so use it for task requests. `api_base_url` is the API Gateway stage URL, so use it when testing a different route. These outputs are available after Terraform has successfully deployed the resources and the state backend is accessible.

Keep the same terminal open so the variables remain available, then run the examples below.

### Preview the UI locally

You can preview the static UI before deploying. From the repository root, get the API URL and start a small local web server:

```bash
API_BASE_URL="$(terraform -chdir=terraform output -raw api_base_url)"
python3 -m http.server 4173 --directory web
```

Open this address in a browser, replacing `<URL_ENCODED_API_BASE_URL>` with the encoded value of `API_BASE_URL`:

```text
http://localhost:4173/?api=<URL_ENCODED_API_BASE_URL>
```

For example, encode `https://abc123.execute-api.eu-west-1.amazonaws.com/dev` as `https%3A%2F%2Fabc123.execute-api.eu-west-1.amazonaws.com%2Fdev`. The local `web/config.js` reads this query parameter. During deployment Terraform writes a generated `config.js` with the API URL into the S3 website bucket.

### Test the browser dashboard

Open the value printed for `FRONTEND_URL` in a browser. The S3 website endpoint uses HTTP. The page should show the tasks from the API. Try creating a task, changing its title or status, searching/filtering the list, and deleting the test task.

If the page loads but shows a connection error, check that the generated `config.js` contains the API stage URL and that the Lambda responses include the required CORS headers.

You can test the API's CORS preflight from the terminal with:

```bash
curl -i -X OPTIONS "$API_BASE_URL/v1/tasks" \
  -H "Origin: $FRONTEND_URL" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type"
```

The S3 website and API Gateway have different origins, so the API must allow the website origin through CORS.

### 1) Create a task

```bash
curl -X POST \
  "$API_URL" \
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
curl "$API_URL"
```

Expected result:

- HTTP 200
- JSON list of tasks

---

### 3) Get one task

```bash
curl "$API_URL/<TASK_ID>"
```

Expected result:

- HTTP 200
- JSON object for the selected task

---

### 4) Update a task

```bash
curl -X PUT \
  "$API_URL/<TASK_ID>" \
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
curl -X DELETE "$API_URL/<TASK_ID>"
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
  "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{}'
```

Expected result:

- HTTP 400

### Invalid route

```bash
curl "$API_BASE_URL/v1/does-not-exist"
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
