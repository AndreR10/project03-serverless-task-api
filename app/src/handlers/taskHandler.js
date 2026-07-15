import { response, logger } from "../utils/index.js";

import { createTask } from "../services/taskService.js";
import { getAllTasks } from "../services/taskService.js";
import { getTaskById } from "../services/taskService.js";
import { updateTask } from "../services/taskService.js";
import { deleteTask } from "../services/taskService.js";

export const handler = async (event, context) => {
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
    const method = event.httpMethod;

    const path = event.resource;

    const id = event.pathParameters?.id;

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
