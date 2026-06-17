import {
  getDateKey,
  safeJSONParse,
} from "../src/utils.js";
import {
  completionState,
  getAllExercises,
  markExerciseComplete,
  unmarkExerciseComplete,
} from "../src/data.js";
import { trainingData } from "../src/exercises.js";

describe("Data export format", () => {
  test("exercises data has valid structure for JSON export", () => {
    const allEx = getAllExercises();
    const exportable = {
      exercises: allEx.map((e) => ({
        id: e.id,
        name: e.name,
        muscle: e.muscle,
        difficulty: e.difficulty,
      })),
    };
    expect(exportable.exercises.length).toBeGreaterThan(0);
    exportable.exercises.forEach((ex) => {
      expect(ex.id).toBeDefined();
      expect(ex.name).toBeTruthy();
      expect(ex.muscle).toBeTruthy();
      expect(ex.difficulty).toBeTruthy();
    });
  });
});

describe("Exercise completion cycle", () => {
  beforeEach(() => {
    Object.keys(completionState).forEach((k) => delete completionState[k]);
  });

  test("marks exercise as complete", () => {
    const exId = 1;
    markExerciseComplete(exId, new Date().toDateString(), "Test exercise");
    expect(completionState[exId]).toBeDefined();
    expect(completionState[exId].completed).toBe(true);
    expect(completionState[exId].date).toBeDefined();
  });

  test("unmarks exercise as complete", () => {
    const exId = 1;
    markExerciseComplete(exId, new Date().toDateString(), "Test exercise");
    unmarkExerciseComplete(exId);
    expect(completionState[exId]).toBeUndefined();
  });

  test("toggle complete/uncomplete works", () => {
    const exId = 2;
    markExerciseComplete(exId, new Date().toDateString(), "Test exercise");
    expect(completionState[exId].completed).toBe(true);
    unmarkExerciseComplete(exId);
    expect(completionState[exId]).toBeUndefined();
  });

  test("marks multiple exercises without conflict", () => {
    markExerciseComplete(1, new Date().toDateString(), "Ex1");
    markExerciseComplete(2, new Date().toDateString(), "Ex2");
    markExerciseComplete(3, new Date().toDateString(), "Ex3");
    expect(Object.keys(completionState).length).toBe(3);
  });
});

describe("Training data integrity", () => {
  test("all muscle groups have valid data", () => {
    expect(trainingData.length).toBeGreaterThan(0);
    trainingData.forEach((group) => {
      expect(group.name).toBeTruthy();
      expect(group.id).toBeDefined();
      expect(Array.isArray(group.exercises)).toBe(true);
      group.exercises.forEach((ex) => {
        expect(ex.id).toBeDefined();
        expect(ex.name).toBeTruthy();
        expect(ex.muscle).toBeTruthy();
        expect(ex.difficulty).toBeTruthy();
      });
    });
  });

  test("all exercise IDs are unique", () => {
    const ids = getAllExercises().map((e) => String(e.id));
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  test("all exercises have valid difficulty values", () => {
    const validDifficulties = ["Легкий", "Середній", "Складний"];
    getAllExercises().forEach((ex) => {
      expect(validDifficulties).toContain(ex.difficulty);
    });
  });

  test("every exercise has an image path", () => {
    getAllExercises().forEach((ex) => {
      expect(ex.image).toBeTruthy();
    });
  });
});

describe("getDateKey", () => {
  test("returns YYYY-MM-DD format", () => {
    const key = getDateKey(new Date(2024, 0, 15));
    expect(key).toBe("2024-01-15");
  });

  test("pads single digit months and days", () => {
    const key = getDateKey(new Date(2024, 2, 5));
    expect(key).toBe("2024-03-05");
  });

  test("works with December date", () => {
    const key = getDateKey(new Date(2024, 11, 31));
    expect(key).toBe("2024-12-31");
  });

  test("produces sortable format", () => {
    const earlier = getDateKey(new Date(2024, 0, 1));
    const later = getDateKey(new Date(2024, 11, 31));
    expect(earlier < later).toBe(true);
  });
});

describe("safeJSONParse edge cases", () => {
  test("parses deeply nested objects", () => {
    const data = { a: { b: { c: { d: "deep" } } } };
    expect(safeJSONParse(JSON.stringify(data))).toEqual(data);
  });

  test("parses large arrays", () => {
    const arr = Array.from({ length: 10000 }, (_, i) => i);
    const parsed = safeJSONParse(JSON.stringify(arr));
    expect(parsed).toEqual(arr);
    expect(Array.isArray(parsed)).toBe(true);
  });

  test("returns fallback for undefined input", () => {
    expect(safeJSONParse(undefined, {})).toEqual({});
    // null is valid JSON (JSON.parse(null) returns null)
    expect(safeJSONParse(null, [])).toBeNull();
  });
});
