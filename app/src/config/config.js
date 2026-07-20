import { getParameter } from "./parameterStore.js";

let configuration;

export const loadConfig = async () => {
  if (configuration) {
    return configuration;
  }

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
