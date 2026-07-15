import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

import { dynamo } from "./dynamoClient.js";

import { logger } from "../utils/index.js";

const TABLE_NAME = process.env.TABLE_NAME;

export const saveTask = async (task) => {
  logger.info("Writing task to DynamoDB", {
    awsOperation: "PutItem",
    tableName: TABLE_NAME,
    taskId: task.id,
  });

  try {
    await dynamo.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: task,
      }),
    );

    logger.info("Task stored successfully", {
      awsOperation: "PutItem",
      taskId: task.id,
    });
  } catch (error) {
    logger.error("Failed to store task", {
      awsOperation: "PutItem",
      taskId: task.id,
      error: error.message,
    });

    throw error;
  }
};

export const findAllTasks = async () => {
  logger.info("Scanning DynamoDB table", {
    awsOperation: "Scan",
    tableName: TABLE_NAME,
  });
  try {
    const result = await dynamo.send(
      new ScanCommand({
        TableName: TABLE_NAME,
      }),
    );

    logger.info("Scan completed", {
      awsOperation: "Scan",
      tableName: TABLE_NAME,
      items: result.Items?.length ?? 0,
    });

    return result.Items ?? [];
  } catch (error) {
    logger.error("Failed to scan table", {
      awsOperation: "Scan",
      tableName: TABLE_NAME,
      error: error.message,
    });

    throw error;
  }
};

export const findTaskById = async (id) => {
  logger.info("Retrieving task", {
    awsOperation: "GetItem",
    taskId: id,
    tableName: TABLE_NAME,
  });
  try {
    const result = await dynamo.send(
      new GetCommand({
        TableName: TABLE_NAME,

        Key: {
          id,
        },
      }),
    );
    if (!result.Item) {
      logger.warn("Task not found", {
        awsOperation: "GetItem",
        taskId: id,
        tableName: TABLE_NAME,
      });

      return null;
    }

    logger.info("Task retrieved", {
      awsOperation: "GetItem",
      taskId: id,
      tableName: TABLE_NAME,
    });

    return result.Item;
  } catch (error) {
    logger.error("Failed to retrieve task", {
      awsOperation: "GetItem",
      taskId: id,
      tableName: TABLE_NAME,
      error: error.message,
    });

    throw error;
  }
};

export const updateTaskById = async (id, body) => {
  logger.info("Updating task", {
    awsOperation: "UpdateItem",
    tableName: TABLE_NAME,
    taskId: id,
    title: body.title,
  });

  try {
    await dynamo.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          id,
        },

        UpdateExpression: "set title=:title, description=:description",

        ExpressionAttributeValues: {
          ":title": body.title,

          ":description": body.description,
        },

        ReturnValues: "ALL_NEW",
      }),
    );
    logger.info("Task updated", {
      awsOperation: "UpdateItem",
      taskId: id,
      tableName: TABLE_NAME,
    });
  } catch (error) {
    logger.error("Failed to update task", {
      awsOperation: "UpdateItem",
      taskId: id,
      tableName: TABLE_NAME,
      error: error.message,
    });
    throw error;
  }
};

export const deleteTaskById = async (id) => {
  logger.info("Deleting task", {
    awsOperation: "DeleteItem",
    tableName: TABLE_NAME,
    taskId: id,
  });
  try {
    await dynamo.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
          id,
        },
      }),
    );
    logger.info("Task deleted", {
      awsOperation: "DeleteItem",
      tableName: TABLE_NAME,
      taskId: id,
    });
  } catch (error) {
    logger.error("Failed to delete task", {
      awsOperation: "DeleteItem",
      tableName: TABLE_NAME,
      taskId: id,
      error: error.message,
    });
    throw error;
  }
};
