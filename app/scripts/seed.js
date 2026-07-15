import { randomUUID } from "crypto";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { tasks } from "./sample-data.js";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "eu-west-1",
});

const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME || "task-api-dev-table";

async function seed() {
  for (const task of tasks) {
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          id: randomUUID(),
          ...task,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }),
    );

    console.log(`✔ Created: ${task.title}`);
  }

  console.log("\nDatabase successfully populated.");
}

seed().catch(console.error);
