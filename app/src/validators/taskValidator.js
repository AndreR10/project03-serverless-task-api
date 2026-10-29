// Reject invalid task input before the service sends a write to DynamoDB.
export const validateTask = (body) => {
  // Make sure a request body was provided.
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("Request body is required");
  }

  // Make sure the title property exists.
  // This handles undefined and null.
  if (body.title === undefined || body.title === null) {
    throw new Error("Title is required");
  }

  // The title must be a string.
  if (typeof body.title !== "string") {
    throw new Error("Title must be a string");
  }

  // The title cannot be empty or contain only whitespace.
  if (!body.title.trim()) {
    throw new Error("Title is required");
  }

  // Reject unknown statuses when a caller supplies one during an update.
  const allowedStatuses = ["PENDING", "IN_PROGRESS", "COMPLETED"];
  if (body.status !== undefined && !allowedStatuses.includes(body.status)) {
    throw new Error("Status must be PENDING, IN_PROGRESS, or COMPLETED");
  }
};
