import { response } from "../utils/response.js";

import { createTask } from "../services/taskService.js";
import { getAllTasks } from "../services/taskService.js";
import { getTaskById } from "../services/taskService.js";
import { updateTask } from "../services/taskService.js";
import { deleteTask } from "../services/taskService.js";

export const handler = async (event) => {
  try {
    const method = event.httpMethod;

    const path = event.resource;

    const id = event.pathParameters?.id;

    if (method === "POST" && path === "/v1/tasks") {
      const body = JSON.parse(event.body);

      const task = await createTask(body);

      return response(201, task);
    }

    if (method === "GET" && path === "/v1/tasks") {
      const tasks = await getAllTasks();

      return response(200, tasks);
    }

    if (method === "GET" && path === "/v1/tasks/{id}") {
      const task = await getTaskById(id);

      return response(200, task);
    }

    if (method === "PUT" && path === "/v1/tasks/{id}") {
      const body = JSON.parse(event.body);

      const task = await updateTask(id, body);

      return response(200, task);
    }

    if (method === "DELETE" && path === "/v1/tasks/{id}") {
      await deleteTask(id);

      return response(
        200,

        {
          message: "Task deleted successfully",
        },
      );
    }

    return response(
      404,

      {
        message: "Route not found",
      },
    );
  } catch (error) {
    console.error(error);

    return response(
      500,

      {
        message: error.message,
      },
    );
  }
};
