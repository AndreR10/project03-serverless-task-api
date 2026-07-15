# API Reference

## Overview

The **Serverless Task Management API** is a REST API built with Amazon API Gateway, AWS Lambda, and Amazon DynamoDB.

Base URL:

```text
https://<api-id>.execute-api.<region>.amazonaws.com/dev
```

Current API Version:

```text
/v1
```

All requests and responses use the **JSON** format.

---

# API Endpoints

| Method | Endpoint         | Description           |
| ------ | ---------------- | --------------------- |
| POST   | `/v1/tasks`      | Create a new task     |
| GET    | `/v1/tasks`      | Retrieve all tasks    |
| GET    | `/v1/tasks/{id}` | Retrieve a task by ID |
| PUT    | `/v1/tasks/{id}` | Update a task         |
| DELETE | `/v1/tasks/{id}` | Delete a task         |

---

# Common HTTP Status Codes

| Code | Meaning                        |
| ---- | ------------------------------ |
| 200  | Request completed successfully |
| 201  | Resource created successfully  |
| 400  | Invalid request                |
| 404  | Resource not found             |
| 500  | Internal server error          |

---

# Create Task

Creates a new task.

## Request

**Method**

```text
POST
```

**Endpoint**

```text
/v1/tasks
```

### Request Body

```json
{
  "title": "Study AWS",
  "description": "Complete Module 8"
}
```

### cURL Example

```bash
curl -X POST \
https://YOUR_API_ID.execute-api.eu-west-1.amazonaws.com/dev/v1/tasks \
-H "Content-Type: application/json" \
-d '{
  "title":"Study AWS",
  "description":"Complete Module 8"
}'
```

---

## Successful Response

Status Code

```text
201 Created
```

Example

```json
{
  "message": "Task created successfully",
  "data": {
    "id": "4d0c5b3d-6a92-4f73-a8d2-11a5d2d8e8ef",
    "title": "Study AWS",
    "description": "Complete Module 8",
    "status": "PENDING"
  }
}
```

---

## Possible Errors

| Status | Reason                |
| ------ | --------------------- |
| 400    | Invalid request body  |
| 500    | Internal server error |

---

# List Tasks

Returns all tasks.

## Request

**Method**

```text
GET
```

**Endpoint**

```text
/v1/tasks
```

### cURL Example

```bash
curl \
https://YOUR_API_ID.execute-api.eu-west-1.amazonaws.com/dev/v1/tasks
```

---

## Successful Response

Status Code

```text
200 OK
```

Example

```json
{
  "message": "Tasks retrieved successfully",
  "data": [
    {
      "id": "4d0c5b3d-6a92-4f73-a8d2-11a5d2d8e8ef",
      "title": "Study AWS",
      "description": "Complete Module 8",
      "status": "PENDING"
    }
  ]
}
```

---

## Possible Errors

| Status | Reason                |
| ------ | --------------------- |
| 500    | Internal server error |

---

# Get Task

Returns a single task.

## Request

**Method**

```text
GET
```

**Endpoint**

```text
/v1/tasks/{id}
```

### Path Parameter

| Name | Type   | Required |
| ---- | ------ | -------- |
| id   | String | Yes      |

### cURL Example

```bash
curl \
https://YOUR_API_ID.execute-api.eu-west-1.amazonaws.com/dev/v1/tasks/4d0c5b3d-6a92-4f73-a8d2-11a5d2d8e8ef
```

---

## Successful Response

Status Code

```text
200 OK
```

Example

```json
{
  "message": "Task retrieved successfully",
  "data": {
    "id": "4d0c5b3d-6a92-4f73-a8d2-11a5d2d8e8ef",
    "title": "Study AWS",
    "description": "Complete Module 8",
    "status": "PENDING"
  }
}
```

---

## Possible Errors

| Status | Reason                |
| ------ | --------------------- |
| 404    | Task not found        |
| 500    | Internal server error |

---

# Update Task

Updates an existing task.

## Request

**Method**

```text
PUT
```

**Endpoint**

```text
/v1/tasks/{id}
```

### Request Body

```json
{
  "title": "Study Terraform",
  "description": "Complete Module 9",
  "status": "IN_PROGRESS"
}
```

### cURL Example

```bash
curl -X PUT \
https://YOUR_API_ID.execute-api.eu-west-1.amazonaws.com/dev/v1/tasks/4d0c5b3d-6a92-4f73-a8d2-11a5d2d8e8ef \
-H "Content-Type: application/json" \
-d '{
  "title":"Study Terraform",
  "description":"Complete Module 9",
  "status":"IN_PROGRESS"
}'
```

---

## Successful Response

Status Code

```text
200 OK
```

Example

```json
{
  "message": "Task updated successfully"
}
```

---

## Possible Errors

| Status | Reason                |
| ------ | --------------------- |
| 400    | Invalid request body  |
| 404    | Task not found        |
| 500    | Internal server error |

---

# Delete Task

Deletes an existing task.

## Request

**Method**

```text
DELETE
```

**Endpoint**

```text
/v1/tasks/{id}
```

### cURL Example

```bash
curl -X DELETE \
https://YOUR_API_ID.execute-api.eu-west-1.amazonaws.com/dev/v1/tasks/4d0c5b3d-6a92-4f73-a8d2-11a5d2d8e8ef
```

---

## Successful Response

Status Code

```text
200 OK
```

Example

```json
{
  "message": "Task deleted successfully"
}
```

---

## Possible Errors

| Status | Reason                |
| ------ | --------------------- |
| 404    | Task not found        |
| 500    | Internal server error |

---

# Response Format

All successful responses follow the same structure.

```json
{
  "message": "<description>",
  "data": {}
}
```

Error responses follow a consistent format.

```json
{
  "message": "Internal server error"
}
```

Maintaining a consistent response format simplifies client-side development and debugging.

---

# Headers

Every request should include:

```http
Content-Type: application/json
```

Future versions may also require:

```http
Authorization: Bearer <JWT Token>
```

once authentication is introduced.

---

# API Versioning

The API is versioned using the URI.

Current version:

```text
/v1
```

Example:

```text
/v1/tasks
```

This strategy allows future versions (such as `/v2`) to introduce new features or breaking changes without affecting existing clients.

---

# Future Enhancements

Planned API improvements include:

- Authentication with Amazon Cognito
- Request validation
- Pagination
- Filtering and sorting
- Search by task title
- File attachments using Amazon S3
- OpenAPI (Swagger) specification
- Rate limiting
- Request tracing with AWS X-Ray

---

# Testing the API

After deployment, verify the following scenarios:

- Create a task
- Retrieve all tasks
- Retrieve a task by ID
- Update a task
- Delete a task
- Attempt to retrieve a deleted task
- Submit an invalid request body
- Verify responses in CloudWatch Logs

Successful completion of these tests confirms that the API, Lambda function, IAM permissions, and DynamoDB integration are working correctly.
