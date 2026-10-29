# API Reference

This guide explains how to call the API in the project and what responses you should expect.

The API is a small REST API built with API Gateway, Lambda, and DynamoDB. It is intentionally simple so it is easier to learn the serverless application flow.

Base URL:

```text
https://<api-id>.execute-api.<region>.amazonaws.com/dev
```

API version:

```text
/v1
```

All requests and responses are JSON.

The API is public and currently uses no authentication, so anyone who can reach its URL can read or change tasks. CORS allows the browser dashboard to call the API from another domain; CORS is not authentication or access control. Use this setup for a demo, not for sensitive data.

---

## Endpoints

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST | `/v1/tasks` | Create a new task |
| GET | `/v1/tasks` | List all tasks |
| GET | `/v1/tasks/{id}` | Get one task by ID |
| PUT | `/v1/tasks/{id}` | Update a task |
| DELETE | `/v1/tasks/{id}` | Delete a task |

---

## Common HTTP status codes

| Code | Meaning |
| ---- | ------- |
| 200 | Success |
| 201 | Created |
| 400 | Bad request |
| 404 | Not found |
| 500 | Internal server error |

---

## Create a task

Use this endpoint to add a new task.

### Request

```http
POST /v1/tasks
Content-Type: application/json
```

Body example:

```json
{
  "title": "Study AWS",
  "description": "Complete Module 8"
}
```

cURL example:

```bash
curl -X POST \
  https://YOUR_API_ID.execute-api.eu-west-1.amazonaws.com/dev/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Study AWS",
    "description":"Complete Module 8"
  }'
```

### Success response

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

## List tasks

This endpoint returns all tasks.

### Request

```http
GET /v1/tasks
```

cURL example:

```bash
curl https://YOUR_API_ID.execute-api.eu-west-1.amazonaws.com/dev/v1/tasks
```

### Success response

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

## Get one task

Use the task ID to retrieve a single record.

### Request

```http
GET /v1/tasks/{id}
```

cURL example:

```bash
curl https://YOUR_API_ID.execute-api.eu-west-1.amazonaws.com/dev/v1/tasks/4d0c5b3d-6a92-4f73-a8d2-11a5d2d8e8ef
```

### Success response

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

## Update a task

Use PUT to change an existing task.

### Request

```http
PUT /v1/tasks/{id}
Content-Type: application/json
```

Body example:

```json
{
  "title": "Study Terraform",
  "description": "Complete Module 9",
  "status": "IN_PROGRESS"
}
```

cURL example:

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

### Success response

```json
{
  "message": "Task updated successfully"
}
```

---

## Delete a task

Use DELETE to remove a task.

### Request

```http
DELETE /v1/tasks/{id}
```

cURL example:

```bash
curl -X DELETE https://YOUR_API_ID.execute-api.eu-west-1.amazonaws.com/dev/v1/tasks/4d0c5b3d-6a92-4f73-a8d2-11a5d2d8e8ef
```

### Success response

```json
{
  "message": "Task deleted successfully"
}
```

---

## Response format

Successful responses follow the same pattern:

```json
{
  "message": "Description of the result",
  "data": {}
}
```

Error responses usually look like:

```json
{
  "message": "Internal server error"
}
```

This consistent format makes debugging easier for both humans and client applications.

---

## Headers

Include this header for JSON requests:

```http
Content-Type: application/json
```

Future versions may require authentication headers once security is added.

---

## Beginner note

This API is intentionally simple. It gives you a clear model for how API Gateway, Lambda, and DynamoDB work together in a real serverless application.
