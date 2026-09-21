import { jest, expect, describe, beforeEach, it } from "@jest/globals";

/*
 * We are testing taskRepository.js.
 *
 * The repository is responsible for communicating with DynamoDB.
 *
 * Normally the flow is:
 *
 * taskRepository
 *      |
 *      v
 * dynamo.send()
 *      |
 *      v
 * AWS DynamoDB
 *
 * We don't want our unit tests to make real AWS requests.
 *
 * Therefore, we create a fake "dynamo" object.
 * The send() function is a Jest mock.
 */
const mockDynamo = {
  send: jest.fn(),
};

/*
 * Replace the real DynamoDB client with our mock.
 *
 * taskRepository.js imports "dynamo" from dynamoClient.js.
 * When the repository tries to use it, Jest will give it
 * our mockDynamo object instead.
 */
jest.unstable_mockModule("../../../src/repositories/dynamoClient.js", () => ({
  dynamo: mockDynamo,
}));

/*
 * Import the repository AFTER setting up the mock.
 *
 * This is important because the repository must receive
 * the mocked DynamoDB client instead of the real one.
 */
const { saveTask, findAllTasks, findTaskById, updateTaskById, deleteTaskById } =
  await import("../../../src/repositories/taskRepository.js");

/*
 * Group all tests related to taskRepository.
 */
describe("taskRepository", () => {
  /*
   * This runs before every test.
   *
   * It clears information about previous calls to mockDynamo.send().
   *
   * Each test therefore starts with a clean mock.
   */
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /*
   * ==========================================
   * saveTask()
   * ==========================================
   */
  describe("saveTask", () => {
    it("should save a task using PutCommand", async () => {
      /*
       * This is the task we want to save.
       */
      const task = {
        id: "task-1",
        title: "Learn AWS",
        description: "Study DynamoDB",
        status: "PENDING",
      };

      /*
       * We tell the mock DynamoDB client to pretend
       * that the PutCommand succeeded.
       *
       * The repository doesn't need a return value from
       * DynamoDB, so we resolve with an empty object.
       */
      mockDynamo.send.mockResolvedValue({});

      /*
       * Call the repository function.
       */
      await saveTask(task);

      /*
       * Verify that DynamoDB was called once.
       */
      expect(mockDynamo.send).toHaveBeenCalledTimes(1);

      /*
       * Get the first argument passed to dynamo.send().
       *
       * This should be a PutCommand object.
       */
      const command = mockDynamo.send.mock.calls[0][0];

      /*
       * Verify that the command is PutCommand.
       *
       * The command constructor name tells us which
       * AWS SDK command was created.
       */
      expect(command.constructor.name).toBe("PutCommand");

      /*
       * Verify that the command contains the correct task.
       *
       * The input property contains the parameters sent
       * to DynamoDB.
       */
      expect(command.input.Item).toEqual(task);
    });

    it("should throw an error when DynamoDB fails", async () => {
      /*
       * Simulate a DynamoDB failure.
       */
      const error = new Error("DynamoDB error");

      mockDynamo.send.mockRejectedValue(error);

      /*
       * The repository should not hide the error.
       *
       * It should re-throw it so the service or handler
       * can handle it.
       */
      await expect(
        saveTask({
          id: "task-1",
          title: "Learn AWS",
          description: "",
          status: "PENDING",
        }),
      ).rejects.toThrow("DynamoDB error");
    });
  });

  /*
   * ==========================================
   * findAllTasks()
   * ==========================================
   */
  describe("findAllTasks", () => {
    it("should return all tasks", async () => {
      /*
       * Fake tasks returned by DynamoDB.
       */
      const tasks = [
        {
          id: "task-1",
          title: "Learn AWS",
          description: "Study DynamoDB",
          status: "PENDING",
        },
        {
          id: "task-2",
          title: "Build API",
          description: "Create Lambda API",
          status: "PENDING",
        },
      ];

      /*
       * Simulate a successful Scan operation.
       */
      mockDynamo.send.mockResolvedValue({
        Items: tasks,
      });

      /*
       * Call the repository function.
       */
      const result = await findAllTasks();

      /*
       * The repository should return the Items
       * received from DynamoDB.
       */
      expect(result).toEqual(tasks);

      /*
       * Verify that DynamoDB was called once.
       */
      expect(mockDynamo.send).toHaveBeenCalledTimes(1);

      /*
       * Verify that the repository used ScanCommand.
       */
      const command = mockDynamo.send.mock.calls[0][0];

      expect(command.constructor.name).toBe("ScanCommand");
    });

    it("should return an empty array when DynamoDB returns no Items", async () => {
      /*
       * Simulate DynamoDB returning no Items property.
       */
      mockDynamo.send.mockResolvedValue({});

      const result = await findAllTasks();

      /*
       * Our repository uses:
       *
       * result.Items ?? []
       *
       * Therefore, the expected result is an empty array.
       */
      expect(result).toEqual([]);
    });

    it("should throw an error when the scan fails", async () => {
      /*
       * Simulate a DynamoDB failure.
       */
      mockDynamo.send.mockRejectedValue(new Error("Scan failed"));

      await expect(findAllTasks()).rejects.toThrow("Scan failed");
    });
  });

  /*
   * ==========================================
   * findTaskById()
   * ==========================================
   */
  describe("findTaskById", () => {
    it("should return a task by ID", async () => {
      const task = {
        id: "task-1",
        title: "Learn AWS",
        description: "Study DynamoDB",
        status: "PENDING",
      };

      /*
       * Simulate DynamoDB finding the task.
       */
      mockDynamo.send.mockResolvedValue({
        Item: task,
      });

      const result = await findTaskById("task-1");

      /*
       * Verify that the task was returned.
       */
      expect(result).toEqual(task);

      /*
       * Verify that GetCommand was used.
       */
      const command = mockDynamo.send.mock.calls[0][0];

      expect(command.constructor.name).toBe("GetCommand");

      /*
       * Verify that the correct ID was sent as the key.
       */
      expect(command.input.Key).toEqual({
        id: "task-1",
      });
    });

    it("should return null when the task does not exist", async () => {
      /*
       * Simulate DynamoDB not finding the task.
       *
       * DynamoDB returns no Item.
       */
      mockDynamo.send.mockResolvedValue({});

      const result = await findTaskById("unknown-id");

      /*
       * Our repository is designed to return null
       * when no task is found.
       */
      expect(result).toBeNull();
    });

    it("should throw an error when retrieving the task fails", async () => {
      mockDynamo.send.mockRejectedValue(new Error("GetItem failed"));

      await expect(findTaskById("task-1")).rejects.toThrow("GetItem failed");
    });
  });

  /*
   * ==========================================
   * updateTaskById()
   * ==========================================
   */
  describe("updateTaskById", () => {
    it("should update a task using UpdateCommand", async () => {
      /*
       * Data that will replace the existing title
       * and description.
       */
      const body = {
        title: "Updated task",
        description: "Updated description",
      };

      /*
       * Simulate a successful DynamoDB update.
       */
      mockDynamo.send.mockResolvedValue({
        Attributes: {
          id: "task-1",
          ...body,
        },
      });

      /*
       * Call the repository function.
       */
      await updateTaskById("task-1", body);

      /*
       * Verify that DynamoDB was called once.
       */
      expect(mockDynamo.send).toHaveBeenCalledTimes(1);

      /*
       * Verify that UpdateCommand was used.
       */
      const command = mockDynamo.send.mock.calls[0][0];

      expect(command.constructor.name).toBe("UpdateCommand");

      /*
       * Verify that the correct task ID was used.
       */
      expect(command.input.Key).toEqual({
        id: "task-1",
      });

      /*
       * Verify that the title and description
       * were passed to DynamoDB.
       */
      expect(command.input.ExpressionAttributeValues).toEqual({
        ":title": "Updated task",
        ":description": "Updated description",
      });
    });

    it("should throw an error when the update fails", async () => {
      mockDynamo.send.mockRejectedValue(new Error("Update failed"));

      await expect(
        updateTaskById("task-1", {
          title: "Updated task",
          description: "Updated description",
        }),
      ).rejects.toThrow("Update failed");
    });
  });

  /*
   * ==========================================
   * deleteTaskById()
   * ==========================================
   */
  describe("deleteTaskById", () => {
    it("should delete a task using DeleteCommand", async () => {
      /*
       * Simulate a successful delete operation.
       */
      mockDynamo.send.mockResolvedValue({});

      /*
       * Call the repository function.
       */
      await deleteTaskById("task-1");

      /*
       * Verify that DynamoDB was called once.
       */
      expect(mockDynamo.send).toHaveBeenCalledTimes(1);

      /*
       * Verify that DeleteCommand was used.
       */
      const command = mockDynamo.send.mock.calls[0][0];

      expect(command.constructor.name).toBe("DeleteCommand");

      /*
       * Verify that the correct task ID was used.
       */
      expect(command.input.Key).toEqual({
        id: "task-1",
      });
    });

    it("should throw an error when the delete fails", async () => {
      mockDynamo.send.mockRejectedValue(new Error("Delete failed"));

      await expect(deleteTaskById("task-1")).rejects.toThrow("Delete failed");
    });
  });
});
