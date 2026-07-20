import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

const client = new SSMClient({});

export const getParameter = async (name) => {
  try {
    const response = await client.send(
      new GetParameterCommand({
        Name: name,
      }),
    );

    return response.Parameter?.Value;
  } catch (error) {
    throw new Error(`Unable to retrieve parameter '${name}': ${error.message}`);
  }
};
