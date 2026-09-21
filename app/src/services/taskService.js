import { v4 as uuid } from "uuid";
import { validateTask } from "../validators/taskValidator.js";
import { getConfig } from "../config/config.js";

import {
  saveTask,
  findAllTasks,
  findTaskById,
  updateTaskById,
  deleteTaskById,
} from "../repositories/taskRepository.js";

export const createTask = async (body) => {
  validateTask(body);

  const config = await getConfig();

  const task = {
    id: uuid(),
    title: body.title,
    description: body.description || "",
    status: config.defaultStatus,
  };

  await saveTask(task);

  return task;
};

export const getAllTasks = async () => {
  return await findAllTasks();
};

export const getTaskById = async (id) => {
  return await findTaskById(id);
};

export const updateTask = async (id, body) => {
  validateTask(body);
  await updateTaskById(id, body);

  return await findTaskById(id);
};

export const deleteTask = async (id) => {
  await deleteTaskById(id);
};
