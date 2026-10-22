// Load runtime settings once per Lambda execution environment and reuse them on warm invocations.
import { getParameter } from "./parameterStore.js";

let configuration;

export const loadConfig = async () => {
  // Skip another network request when this Lambda instance already has the settings.
  if (configuration) {
    return configuration;
  }

  // Promise.all allows multiple settings to be fetched concurrently as the config grows.
  const [defaultStatus] = await Promise.all([
    getParameter(process.env.DEFAULT_STATUS_PARAMETER),
  ]);

  configuration = {
    defaultStatus,
  };

  return configuration;
};

export const getConfig = async () => {
  if (!configuration) {
    return await loadConfig();
  }

  return configuration;
};
