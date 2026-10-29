/**
 * Load the settings the application needs while it is running.
 *
 * The parameter name is supplied by Terraform as the Lambda environment
 * variable `DEFAULT_STATUS_PARAMETER`. In this project its value is
 * `/task-api/dev/default-status`, and the parameter currently contains
 * `PENDING`.
 *
 * Settings are cached in this module after the first successful load. A warm
 * Lambda invocation can reuse that value without another Parameter Store
 * request. A new Lambda execution environment starts with an empty cache and
 * loads the setting again.
 *
 * @example
 * const { defaultStatus } = await getConfig();
 * // Example result: { defaultStatus: "PENDING" }
 *
 * @returns {Promise<{defaultStatus: string | undefined}>} Runtime settings.
 */
import { getParameter } from "./parameterStore.js";

// This variable lives as long as the current Lambda execution environment stays warm.
let configuration;

export const loadConfig = async () => {
  // Return the cached settings when a previous invocation already loaded them.
  if (configuration) {
    return configuration;
  }

  // Read the parameter name from Lambda's environment; Promise.all supports loading
  // additional independent settings together if the application needs them later.
  const [defaultStatus] = await Promise.all([
    getParameter(process.env.DEFAULT_STATUS_PARAMETER),
  ]);

  configuration = {
    defaultStatus,
  };

  return configuration;
};

export const getConfig = async () => {
  // Load on first use; later calls return the cached object directly.
  if (!configuration) {
    return await loadConfig();
  }

  return configuration;
};
