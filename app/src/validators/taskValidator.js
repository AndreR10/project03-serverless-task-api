export const validateTask = (body) => {
  if (!body) {
    throw new Error("Request body is required");
  }

  if (typeof body.title !== "string") {
    throw new Error("Title must be a string");
  }

  if (!body.title.trim()) {
    throw new Error("Title is required");
  }
};
