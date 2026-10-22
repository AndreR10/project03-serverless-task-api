// API Gateway expects the response body to be a string, so JSON data is serialized here.
export const response = (statusCode, body) => {
  return {
    statusCode,

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(body),
  };
};
