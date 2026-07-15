import { PutCommand } from "@aws-sdk/lib-dynamodb";

import { GetCommand } from "@aws-sdk/lib-dynamodb";

import { ScanCommand } from "@aws-sdk/lib-dynamodb";

import { UpdateCommand } from "@aws-sdk/lib-dynamodb";

import { DeleteCommand } from "@aws-sdk/lib-dynamodb";

import { dynamo } from "./dynamoClient.js";

const TABLE_NAME = process.env.TABLE_NAME;

export const saveTask = async (task) => {
  await dynamo.send(
    new PutCommand({
      TableName: TABLE_NAME,

      Item: task,
    }),
  );
};

export const findAllTasks = async () => {
  const result = await dynamo.send(
    new ScanCommand({
      TableName: TABLE_NAME,
    }),
  );

  return result.Items;
};

export const findTaskById = async (id) => {
  const result = await dynamo.send(
    new GetCommand({
      TableName: TABLE_NAME,

      Key: {
        id,
      },
    }),
  );

  return result.Item;
};

export const updateTaskById = async (id, body) => {
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
};

export const deleteTaskById = async (id) => {
  await dynamo.send(
    new DeleteCommand({
      TableName: TABLE_NAME,

      Key: {
        id,
      },
    }),
  );
};
