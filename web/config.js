// A local preview can pass its API URL in ?api=https%3A%2F%2F...
const apiOverride = new URLSearchParams(window.location.search).get("api");

// Deployed pages live at /<stage>/ui/index.html, so the first path segment is the stage.
// For example, /dev/ui/index.html uses https://<host>/dev as the API base URL.
const stageName = window.location.pathname.split("/")[1];
const apiFromCurrentOrigin = stageName
	? `${window.location.origin}/${stageName}`
	: window.location.origin;

// Use the explicit local-preview URL when provided; otherwise use this page's API Gateway stage.
window.TASK_API_BASE_URL = apiOverride || apiFromCurrentOrigin;