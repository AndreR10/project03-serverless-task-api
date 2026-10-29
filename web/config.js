// For local preview, pass the API Gateway stage URL as ?api=https%3A%2F%2F...
const apiOverride = new URLSearchParams(window.location.search).get("api");
const stageName = window.location.pathname.split("/")[1];
const apiFromCurrentOrigin = stageName
	? `${window.location.origin}/${stageName}`
	: window.location.origin;

window.TASK_API_BASE_URL = apiOverride || apiFromCurrentOrigin;