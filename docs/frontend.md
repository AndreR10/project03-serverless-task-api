# Frontend Guide

This guide explains how the task dashboard works and where to make common changes. The UI is intentionally small: it uses regular HTML and JavaScript, Bootstrap for layout and controls, and the project's existing API for all task data.

## Big Picture

The browser downloads the static dashboard from an S3 website endpoint. The JavaScript then calls the API Gateway task endpoint. API Gateway sends API requests to Lambda, which applies the business rules and talks to DynamoDB:

```text
Browser opens the S3 website URL
        |
        v
S3 returns index.html, app.js, and generated config.js
        |
        v
Browser requests the task collection from API Gateway
        |
        v
Lambda -> task service -> DynamoDB

```

Because the S3 website and API Gateway have different hostnames, the API must return CORS headers that allow the website to call it. S3 website endpoints use HTTP. Do not put credentials, private data, or secrets in the website bucket.

The website's S3 bucket is public-read for static files only. It is not the task API and cannot accept task updates; task operations go to API Gateway and Lambda.

## Files

- `web/index.html` contains the page structure, labels, Bootstrap classes, form fields, and element IDs used by JavaScript.
- `web/app.js` handles API requests, keeps the current task list in memory, renders rows, updates counts, and connects buttons and inputs to actions.
- `web/config.js` selects an API URL for a local preview.
- `web/config.js.tftpl` is the template Terraform fills with the API Gateway stage URL before uploading it.
- `app/src/handlers/taskHandler.js` handles task API routes; it does not serve the website files.
- `terraform/modules/frontend/main.tf` configures the S3 website bucket, website configuration, public-read-only object policy, and uploaded files.
- `terraform/outputs.tf` exposes the full dashboard URL as `frontend_url`.

Bootstrap CSS, Bootstrap Icons, and the Bootstrap JavaScript bundle are loaded from jsDelivr in `index.html`. The browser needs internet access to load these CDN assets. The dashboard itself does not have a JavaScript package manager or a separate frontend build step.

## How The API URL Is Chosen

`config.js` sets `window.TASK_API_BASE_URL` before `app.js` runs.

For a local preview, `web/config.js` accepts an API URL in the `api` query parameter. For example:

```text
http://localhost:4173/?api=https%3A%2F%2Fabc123.execute-api.eu-west-1.amazonaws.com%2Fdev
```

The `URLSearchParams` browser API decodes that value before assigning it to `window.TASK_API_BASE_URL`. In production, Terraform generates the bucket's `config.js` from `config.js.tftpl`, so the API URL does not need to be manually entered into the website files.

`app.js` removes a trailing slash from this base URL and appends the task path. For example, the task collection request becomes:

```text
<API_BASE_URL>/v1/tasks
```

## What Happens When The Page Loads

At the bottom of `app.js`, `loadTasks()` runs as soon as the JavaScript module loads.

1. `request()` sends `GET <API_BASE_URL>/v1/tasks`.
2. The returned JSON array is stored in the `tasks` variable.
3. `updateSummary()` counts tasks by status and fills the four summary numbers.
4. `renderTasks()` creates the visible task rows and updates the empty state.
5. The connection label and indicator change to show success or an error.

The `tasks` array is the page's temporary copy of the data. The API and DynamoDB remain the source of truth. After creating, editing, or deleting a task, the page calls `loadTasks()` again to fetch the latest data.

## Main JavaScript Functions

### `request(path, options)`

This is the shared HTTP helper. It combines the API base URL with `/v1/tasks` and an optional path. It adds a JSON content type when the request has a body, parses the response as JSON, and throws an error when the HTTP response is not successful.

Examples of calls made by the UI:

```text
request()                         -> GET    /v1/tasks
request("", { method: "POST" })  -> POST   /v1/tasks
request("/task-id")               -> GET    /v1/tasks/task-id
request("/task-id", { method: "PUT" })    -> PUT /v1/tasks/task-id
request("/task-id", { method: "DELETE" }) -> DELETE /v1/tasks/task-id
```

### `updateSummary()`

Counts the items in `tasks`. It treats a missing status as `PENDING`, then updates the total, in-progress, completed, and pending counters in the HTML.

### `makeTaskRow(task, index)`

Builds one task row from a task returned by the API. It creates DOM elements, adds Bootstrap classes, and connects Edit and Delete buttons to their handlers. Task text is assigned with `textContent`, which displays it as text rather than interpreting it as HTML.

### `renderTasks()`

Filters the in-memory `tasks` array using the search box and status dropdown, then redraws the visible rows. Searching and filtering happen in the browser; they do not send more API requests.

### `loadTasks()`

Fetches the task collection, updates the connection indicator, refreshes the summary, and redraws the rows. If the API request fails, it displays the error message instead of showing an unhandled browser exception.

### `openDialog(task)` and `closeDialog()`

Use the Bootstrap modal for both creating and editing. When editing, `openDialog()` fills the form with the selected task. The status field is hidden for a new task and shown when editing.

### `saveTask(event)`

Prevents the browser's default form submission and builds a JSON request body. If there is no task ID, it sends `POST` to create a task. If there is an ID, it sends `PUT` to update that task, including its selected status. After success, it closes the modal and reloads the list.

### `deleteTask(task)`

Asks for confirmation, sends `DELETE` for the selected task ID, then reloads the list. The confirmation helps avoid accidental deletion.

## Editing Common Parts

### Change visible labels or page sections

Edit `web/index.html`. The `id` attributes are important because `app.js` finds elements by those IDs. If you rename an ID in HTML, update the matching `document.querySelector()` in `app.js` too.

Bootstrap classes control layout and appearance. For example, `col-12 col-md-6` means an element uses the full row on a small screen and half the row on medium screens. Prefer existing Bootstrap classes over adding custom CSS.

### Change task fields

The title, description, and status form controls are in the modal in `index.html`. The form payload is assembled in `saveTask()` in `app.js`. If you add a field, update both places and also update the API validator, service, repository, and tests so the new value is validated and persisted.

### Add a task status

Statuses are currently `PENDING`, `IN_PROGRESS`, and `COMPLETED`. The allowed values are checked by `app/src/validators/taskValidator.js`. The UI status dropdown is in `index.html`; summary counts are in `updateSummary()`; badge colors are selected in `makeTaskRow()`; and filtering is in `renderTasks()`. Update all of those when adding another status.

### Change API behavior

Keep API calls inside `request()` and use the service routes already defined by the backend. Collection requests use `/v1/tasks`; individual task requests append `/<id>`. The API Gateway and Lambda routes must agree on their HTTP method and path.

### Keep task content safe

Render values received from the API with `textContent`, not `innerHTML`. `textContent` treats titles and descriptions as ordinary text, preventing task data from being interpreted as HTML. The few `innerHTML` assignments in `app.js` are fixed button labels written by the application, not task data.

## Local Preview

From the repository root, get the deployed API base URL and start a local static server:

```bash
API_BASE_URL="$(terraform -chdir=terraform output -raw api_base_url)"
python3 -m http.server 4173 --directory web
```

Open the printed API URL with its value URL-encoded after `?api=`. For example:

```text
http://localhost:4173/?api=https%3A%2F%2Fabc123.execute-api.eu-west-1.amazonaws.com%2Fdev
```

The local page is on a different origin from API Gateway, and the deployed S3 website is also on a different origin. Both depend on the API's CORS headers. Stop the Python server with Ctrl+C when finished.

## How Deployment Packages The UI

The GitHub deployment workflow runs `bash ../scripts/build.sh` from the `terraform/` directory to prepare the Lambda application package. The script copies `app/src/`, `package.json`, and `package-lock.json`, then runs `npm ci --omit=dev` so the production packages, including `uuid`, are installed in `build/node_modules/`. Terraform packages `build/` into `terraform/build/task-api.zip`.

The frontend files are deployed separately: Terraform uploads `index.html` and `app.js` from `web/` and generates `config.js` from `config.js.tftpl` with the API Gateway stage URL. GitHub Actions checks that `node_modules/uuid/package.json` is inside the final ZIP before it runs `terraform apply`.

The frontend module owns the S3 website bucket and its website configuration. Its bucket policy grants public `s3:GetObject` access to files only; visitors cannot list the bucket or upload files. Account-level S3 Block Public Access must allow public bucket policies for this website to work.

The deployed URL is available with:

```bash
cd terraform
terraform output -raw frontend_url
```

## Troubleshooting

- **The page returns 403:** check the S3 bucket policy, the bucket-level public access block settings, and the account-level or organization-level S3 Block Public Access settings.
- **A UI asset returns 404:** confirm Terraform uploaded `index.html`, `app.js`, and `config.js` to the frontend bucket.
- **The UI calls the wrong API URL:** check that Terraform generated `config.js` with the correct API Gateway stage URL.
- **The UI says the API is disconnected:** test `GET <API_BASE_URL>/v1/tasks` directly and check the Lambda CloudWatch logs.
- **A browser request fails:** the S3 website and API Gateway are cross-origin; verify the Lambda response includes CORS headers and the `OPTIONS` API methods exist.
- **The API returns 502:** inspect Lambda logs for startup/import errors and check that `terraform/build/task-api.zip` contains both `src/handlers/taskHandler.js` and `node_modules/uuid/package.json`.

## Security And Cost Notes

The dashboard bucket is public-read and uses HTTP. Publish only public static files there. The API currently has no authentication; anyone who can reach its URL can use task operations. Do not store sensitive data in this demo. S3 website hosting has no CloudFront charge, but S3 storage, requests, API Gateway calls, and Lambda invocations can use Free Tier credits or incur charges beyond account allowances.
