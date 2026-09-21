import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import { logger } from "../utils/index.js";

const client = new SSMClient({});

export const getParameter = async (name) => {
  try {
    const response = await client.send(
      new GetParameterCommand({
        Name: name,
        WithDecryption: true,
      }),
    );

    return response.Parameter?.Value;
  } catch (error) {
    logger.error("Failed to retrieve parameter", {
      name,
      error: error.message,
    });

    throw new Error("Failed to retrieve parameter", {
      cause: error,
    });
  }
};
