// Unit tests for the task input rules; these tests do not call AWS services.
import { describe, it, expect } from "@jest/globals";
import { validateTask } from "../../../src/validators/taskValidator.js";

describe("validateTask", () => {
  it("should reject a missing request body", () => {
    expect(() => validateTask()).toThrow("Request body is required");
  });
  it("should reject a null request body", () => {
    expect(() => validateTask(null)).toThrow("Request body is required");
  });
  it("should reject an array as the request body", () => {
    expect(() => validateTask([])).toThrow("Request body is required");
  });
  it("should reject a task without a title", () => {
    expect(() => validateTask({})).toThrow("Title is required");
  });
  it("should reject a task with a null title", () => {
    expect(() => validateTask({ title: null })).toThrow("Title is required");
  });
  it("should reject a task with a non-string title", () => {
    expect(() => validateTask({ title: 123 })).toThrow(
      "Title must be a string",
    );
  });
  it("should reject an empty title", () => {
    expect(() => validateTask({ title: "" })).toThrow("Title is required");
  });
  it("should reject a whitespace-only title", () => {
    expect(() => validateTask({ title: " " })).toThrow("Title is required");
  });
  it("should accept a valid title", () => {
    expect(() => validateTask({ title: "Complete AWS project" })).not.toThrow();
  });
  it("should reject an unknown status", () => {
    expect(() => validateTask({ title: "Task", status: "BLOCKED" })).toThrow(
      "Status must be PENDING, IN_PROGRESS, or COMPLETED",
    );
  });
});
