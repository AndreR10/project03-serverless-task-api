import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "eu-west-1",
});

const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME || "task-api-dev-table";

async function clear() {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLE_NAME,
    }),
  );

  if (!result.Items?.length) {
    console.log("Database already empty.");
    return;
  }

  for (const item of result.Items) {
    await docClient.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
          id: item.id,
        },
      }),
    );
  }

  console.log("Database cleared.");
}

clear().catch(console.error);
