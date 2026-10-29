// API Gateway expects the response body to be a string, so JSON data is serialized here.
export const response = (statusCode, body) => {
  return {
    statusCode,

    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    },

    body: JSON.stringify(body),
  };
};
