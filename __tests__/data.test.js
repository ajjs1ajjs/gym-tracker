import { getAllExercises, resetCompletionState, markExerciseComplete, unmarkExerciseComplete } from "../dist/js/data.js";

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
    
    // Import completionState to verify
    import("../dist/js/data.js").then((mod) => {
      expect(mod.completionState[id]).toBeDefined();
      expect(mod.completionState[id].completed).toBe(true);
      expect(mod.completionState[id].name).toBe("Test");

      unmarkExerciseComplete(id);
      expect(mod.completionState[id]).toBeUndefined();
    });
  });
});
