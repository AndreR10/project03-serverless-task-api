/**
 * Read one setting from AWS Systems Manager Parameter Store.
 *
 * `name` is the full parameter path, not just the last part of its name. For
 * example, this project stores its default task status at
 * `/task-api/dev/default-status`.
 *
 * The AWS SDK gets credentials from the environment. In Lambda, those
 * credentials come from the function's execution role, which must allow
 * `ssm:GetParameter` for the requested parameter.
 *
 * @example
 * const defaultStatus = await getParameter("/task-api/dev/default-status");
 * // Example result: "PENDING"
 *
 * @param {string} name Full path of the parameter to read.
 * @returns {Promise<string | undefined>} The stored value, usually a string.
 */
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import { logger } from "../utils/index.js";

// Reuse one SDK client instead of creating a new network client for every read.
const client = new SSMClient({});

export const getParameter = async (name) => {
  try {
    // GetParameter reads one setting; WithDecryption also supports SecureString values.
    const response = await client.send(
      new GetParameterCommand({
        Name: name,
        WithDecryption: true,
      }),
    );

    // The optional chain avoids a crash if AWS returns no Parameter object.
    return response.Parameter?.Value;
  } catch (error) {
    // Keep the original AWS error as the cause so logs retain its diagnostic details.
    logger.error("Failed to retrieve parameter", {
      name,
      error: error.message,
    });

    throw new Error("Failed to retrieve parameter", {
      cause: error,
    });
  }
};
