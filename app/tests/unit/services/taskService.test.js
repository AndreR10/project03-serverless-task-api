import { jest, expect, describe, beforeEach, it } from "@jest/globals";

/*
 * We are testing the taskService, but we do not want our tests
 * to make real calls to DynamoDB.
 *
 * The taskService normally calls functions from taskRepository:
 *
 * taskService
 *      |
 *      v
 * taskRepository
 *      |
 *      v
 * DynamoDB
 *
 * Instead of using the real repository, we create fake functions
 * using Jest. These fake functions are called "mocks".
 *
 * This allows us to test only the service logic.
 */
const mockRepository = {
  saveTask: jest.fn(),
  findAllTasks: jest.fn(),
  findTaskById: jest.fn(),
  updateTaskById: jest.fn(),
  deleteTaskById: jest.fn(),
};

const mockConfig = {
  getConfig: jest.fn(),
};
/*
 * Replace the real taskRepository module with our mockRepository.
 *
 * When taskService.js tries to import functions such as
 * saveTask() or findTaskById(), Jest will give it the fake
 * functions defined above instead.
 *
 * This means no real DynamoDB requests will be made.
 */
jest.unstable_mockModule(
  "../../../src/repositories/taskRepository.js",
  () => mockRepository,
);

jest.unstable_mockModule("../../../src/config/config.js", () => mockConfig);

/*
 * Now that the repository has been mocked, we import the service.
 *
 * We use a dynamic import here because Jest needs to set up
 * the mock BEFORE taskService.js is loaded.
 */
const { createTask, getAllTasks, getTaskById, updateTask, deleteTask } =
  await import("../../../src/services/taskService.js");

/*
 * describe() groups tests that belong to the same functionality.
 *
 * In this case, all the tests below are related to taskService.js.
 */
describe("taskService", () => {
  /*
   * beforeEach() runs before every individual test.
   *
   * clearAllMocks() removes information about previous calls
   * to our mock functions.
   *
   * For example, if one test calls saveTask(), the next test
   * should start with saveTask() having zero recorded calls.
   */
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /*
   * Tests related to the createTask() function.
   */
  describe("createTask", () => {
    /*
     * This test verifies that createTask():
     *
     * 1. Creates a task
     * 2. Generates an ID
     * 3. Sets the correct title
     * 4. Sets the description
     * 5. Sets the initial status to PENDING
     * 6. Calls saveTask() to save the task
     */
    it("should create and save a new task", async () => {
      // This is the data a client might send to our API.
      const body = {
        title: "Complete AWS project",
        description: "Finish the serverless task API",
      };

      mockConfig.getConfig.mockResolvedValue({
        defaultStatus: "PENDING",
      });

      // Call the function we are testing.
      const result = await createTask(body);

      /*
       * Check that the returned task has the expected values.
       *
       * expect.any(String) means:
       * "We don't know the exact UUID, but we expect it to be a string."
       */
      expect(result).toEqual({
        id: expect.any(String),
        title: "Complete AWS project",
        description: "Finish the serverless task API",
        status: "PENDING",
      });

      /*
       * Verify that saveTask() was called exactly once.
       */
      expect(mockRepository.saveTask).toHaveBeenCalledTimes(1);

      /*
       * Verify that saveTask() received the task created
       * by createTask().
       */
      expect(mockRepository.saveTask).toHaveBeenCalledWith(result);
    });

    /*
     * Test that verifies the default description.
     *
     * If the client doesn't provide a description,
     * the service should use an empty string.
     */
    it("should use an empty description when description is not provided", async () => {
      const body = {
        title: "Complete AWS project",
      };

      const result = await createTask(body);

      expect(result).toEqual({
        id: expect.any(String),
        title: "Complete AWS project",
        description: "",
        status: "PENDING",
      });

      mockConfig.getConfig.mockResolvedValue({
        defaultStatus: "PENDING",
      });
      /*
       * Verify that the task was sent to the repository.
       */
      expect(mockRepository.saveTask).toHaveBeenCalledWith(result);
    });

    /*
     * Test validation.
     *
     * A task must have a title.
     *
     * Because createTask() is async, we use rejects.toThrow()
     * to verify that the Promise is rejected with an error.
     */
    it("should reject the request when title is missing", async () => {
      await expect(
        createTask({
          description: "Task without a title",
        }),
      ).rejects.toThrow("Title is required");

      /*
       * Because validation failed, saveTask() should never
       * have been called.
       */
      expect(mockRepository.saveTask).not.toHaveBeenCalled();
    });
  });

  /*
   * Tests related to getAllTasks().
   */
  describe("getAllTasks", () => {
    it("should return all tasks from the repository", async () => {
      /*
       * This is fake data that represents what DynamoDB
       * might return.
       */
      const tasks = [
        {
          id: "task-1",
          title: "Task 1",
          description: "Description 1",
          status: "PENDING",
        },
        {
          id: "task-2",
          title: "Task 2",
          description: "Description 2",
          status: "PENDING",
        },
      ];

      /*
       * mockResolvedValue() tells Jest:
       *
       * "When findAllTasks() is called, pretend that
       * it successfully returned these tasks."
       *
       * This simulates an asynchronous repository call.
       */
      mockRepository.findAllTasks.mockResolvedValue(tasks);

      const result = await getAllTasks();

      /*
       * Verify that the service returned the tasks
       * received from the repository.
       */
      expect(result).toEqual(tasks);

      /*
       * Verify that the repository function was called once.
       */
      expect(mockRepository.findAllTasks).toHaveBeenCalledTimes(1);
    });
  });

  /*
   * Tests related to getTaskById().
   */
  describe("getTaskById", () => {
    it("should return a task by ID", async () => {
      const task = {
        id: "task-1",
        title: "Task 1",
        description: "Description 1",
        status: "PENDING",
      };

      /*
       * Pretend that the repository found the task.
       */
      mockRepository.findTaskById.mockResolvedValue(task);

      const result = await getTaskById("task-1");

      /*
       * Verify that the service returned the task.
       */
      expect(result).toEqual(task);

      /*
       * Verify that the correct ID was sent to the repository.
       */
      expect(mockRepository.findTaskById).toHaveBeenCalledWith("task-1");
    });

    it("should return null when the task does not exist", async () => {
      /*
       * Simulate the repository not finding a task.
       */
      mockRepository.findTaskById.mockResolvedValue(null);

      const result = await getTaskById("unknown-id");

      /*
       * The service should return null when no task is found.
       */
      expect(result).toBeNull();

      /*
       * Verify that the correct ID was searched for.
       */
      expect(mockRepository.findTaskById).toHaveBeenCalledWith("unknown-id");
    });
  });

  /*
   * Tests related to updateTask().
   */
  describe("updateTask", () => {
    it("should update a task and return the updated task", async () => {
      const body = {
        title: "Updated task",
        description: "Updated description",
      };

      /*
       * This represents the task after the update.
       */
      const updatedTask = {
        id: "task-1",
        title: "Updated task",
        description: "Updated description",
        status: "PENDING",
      };

      /*
       * Simulate a successful update.
       *
       * We don't need to return anything from updateTaskById()
       * because our service doesn't use its return value.
       */
      mockRepository.updateTaskById.mockResolvedValue();

      /*
       * After updating, the service calls findTaskById()
       * to retrieve the updated task.
       */
      mockRepository.findTaskById.mockResolvedValue(updatedTask);

      const result = await updateTask("task-1", body);

      /*
       * Verify that the service returned the updated task.
       */
      expect(result).toEqual(updatedTask);

      /*
       * Verify that the correct task ID and update data
       * were sent to the repository.
       */
      expect(mockRepository.updateTaskById).toHaveBeenCalledWith(
        "task-1",
        body,
      );

      /*
       * Verify that the service then retrieved the updated task.
       */
      expect(mockRepository.findTaskById).toHaveBeenCalledWith("task-1");
    });

    /*
     * Verify that a task cannot be updated without a title.
     */
    it("should reject the update when title is missing", async () => {
      await expect(
        updateTask("task-1", {
          description: "Updated description",
        }),
      ).rejects.toThrow("Title is required");

      /*
       * Because validation failed, the repository should
       * never receive an update request.
       */
      expect(mockRepository.updateTaskById).not.toHaveBeenCalled();
    });
  });

  /*
   * Tests related to deleteTask().
   */
  describe("deleteTask", () => {
    it("should delete a task by ID", async () => {
      /*
       * Simulate a successful delete operation.
       */
      mockRepository.deleteTaskById.mockResolvedValue();

      /*
       * Call the service function we are testing.
       */
      await deleteTask("task-1");

      /*
       * Verify that the repository was called exactly once.
       */
      expect(mockRepository.deleteTaskById).toHaveBeenCalledTimes(1);

      /*
       * Verify that the correct task ID was passed
       * to the repository.
       */
      expect(mockRepository.deleteTaskById).toHaveBeenCalledWith("task-1");
    });
  });
});
