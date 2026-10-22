// Write one JSON log record per message so CloudWatch can search fields consistently.
const SERVICE = "task-api";

const ENVIRONMENT = process.env.ENVIRONMENT || process.env.NODE_ENV || "dev";

function write(level, message, metadata = {}) {
  // Include shared context on every log line, then add details from the caller.
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      service: SERVICE,
      environment: ENVIRONMENT,
      message,
      ...metadata,
    }),
  );
}

export const logger = {
  debug: (message, metadata = {}) => write("DEBUG", message, metadata),

  info: (message, metadata = {}) => write("INFO", message, metadata),

  warn: (message, metadata = {}) => write("WARN", message, metadata),

  error: (message, metadata = {}) => write("ERROR", message, metadata),
};
