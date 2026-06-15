import {
  getAllExercises,
  resetCompletionState,
  markExerciseComplete,
  unmarkExerciseComplete,
  completionState,
} from "../src/data.js";

describe("getAllExercises", () => {
  test("returns all exercises from all groups", () => {
    const exercises = getAllExercises();
    expect(Array.isArray(exercises)).toBe(true);
    expect(exercises.length).toBeGreaterThan(0);
    exercises.forEach((ex) => {
      expect(ex.id).toBeDefined();
    });
  });
});

describe("completion state helpers", () => {
  test("mark and unmark exercise", () => {
    const id = 99999;
    resetCompletionState();

    markExerciseComplete(id, "2026-01-01T00:00:00.000Z", "Test");

    expect(completionState[id]).toBeDefined();
    expect(completionState[id].completed).toBe(true);
    expect(completionState[id].name).toBe("Test");

    unmarkExerciseComplete(id);
    expect(completionState[id]).toBeUndefined();
  });
});
