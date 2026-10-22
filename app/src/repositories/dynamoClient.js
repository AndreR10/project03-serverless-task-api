// Create one reusable DynamoDB document client for repository operations.
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// The AWS SDK reads region and credentials from the Lambda runtime environment.
const client = new DynamoDBClient({});

export const dynamo = DynamoDBDocumentClient.from(client);
