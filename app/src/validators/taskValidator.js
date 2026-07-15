export const validateTask = (body) => {
  if (!body.title) {
    throw new Error("title is required");
  }
};
