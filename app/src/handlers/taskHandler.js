// Lambda entry point: translate API Gateway events into task-service calls and HTTP responses.
import { readFile } from "node:fs/promises";
import { response, logger } from "../utils/index.js";

import { createTask } from "../services/taskService.js";
import { getAllTasks } from "../services/taskService.js";
import { getTaskById } from "../services/taskService.js";
import { updateTask } from "../services/taskService.js";
import { deleteTask } from "../services/taskService.js";

const frontendAssets = {
  "index.html": { contentType: "text/html; charset=utf-8" },
  "app.js": { contentType: "application/javascript; charset=utf-8" },
  "config.js": { contentType: "application/javascript; charset=utf-8" },
};

async function serveFrontendAsset(assetName) {
  const asset = frontendAssets[assetName];
  if (!asset) {
    return response(404, { message: "Frontend file not found" });
  }

  const body = await readFile(new URL(`../web/${assetName}`, import.meta.url), "utf8");
  return {
    statusCode: 200,
    headers: {
      "Content-Type": asset.contentType,
      "Cache-Control": "no-store",
    },
    body,
  };
}

export const handler = async (event, context) => {
  // Keep a start time so request logs can report how long each operation took.
  const startTime = Date.now();
  const method = event.httpMethod;
  const path = event.resource;
  const id = event.pathParameters?.id;

  logger.info("Incoming request", {
    requestId: context.awsRequestId,
    method,
    path,
    id,
  });

  try {
    // API Gateway provides the HTTP method, route template, and path parameters in the event.
    const method = event.httpMethod;

    const path = event.resource;

    const id = event.pathParameters?.id;

    // Browsers send OPTIONS before cross-origin writes to ask which methods are allowed.
    if (method === "OPTIONS") {
      return response(200, {});
    }

    // Serve only the three known frontend files from the packaged Lambda directory.
    if (method === "GET" && path === "/ui/{asset}") {
      return await serveFrontendAsset(event.pathParameters?.asset);
    }

    // Collection routes create or list tasks; item routes use the ID from the URL.
    if (method === "POST" && path === "/v1/tasks") {
      const body = JSON.parse(event.body);

      const task = await createTask(body);

      logger.info("Task created successfully", {
        requestId: context.awsRequestId,
        durationMs: Date.now() - startTime,
        title: task.title,
        taskId: task.id,
      });

      return response(201, task);
    }

    if (method === "GET" && path === "/v1/tasks") {
      const tasks = await getAllTasks();

      logger.info("Tasks retrieved", {
        requestId: context.awsRequestId,
        durationMs: Date.now() - startTime,
        count: tasks.length,
      });

      return response(200, tasks);
    }

    if (method === "GET" && path === "/v1/tasks/{id}") {
      const task = await getTaskById(id);

      logger.info("Task retrieved", {
        requestId: context.awsRequestId,
        durationMs: Date.now() - startTime,
        taskId: id,
      });

      return response(200, task);
    }

    if (method === "PUT" && path === "/v1/tasks/{id}") {
      const body = JSON.parse(event.body);

      const task = await updateTask(id, body);

      logger.info("Task updated", {
        requestId: context.awsRequestId,
        durationMs: Date.now() - startTime,
        taskId: id,
      });

      return response(200, task);
    }

    if (method === "DELETE" && path === "/v1/tasks/{id}") {
      await deleteTask(id);

      logger.info("Task deleted", {
        requestId: context.awsRequestId,
        durationMs: Date.now() - startTime,
        taskId: id,
      });

      return response(200, {
        message: "Task deleted successfully",
      });
    }

    logger.warn("Route not found", {
      requestId: context.awsRequestId,
      method,
      path,
    });

    return response(404, {
      message: "Route not found",
    });
  } catch (error) {
    // Return a JSON error to the caller and keep details in CloudWatch for debugging.
    logger.error("Unhandled exception", {
      requestId: context.awsRequestId,
      durationMs: Date.now() - startTime,
      error: error.message,
      stack: error.stack,
    });

    return response(
      500,

      {
        message: error.message,
      },
    );
  }
};
