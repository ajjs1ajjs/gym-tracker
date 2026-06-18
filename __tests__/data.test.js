import {
  getAllExercises,
  resetCompletionState,
  markExerciseComplete,
  unmarkExerciseComplete,
  completionState,
  getWaterLogs,
  saveWaterLogs,
  getCalorieParams,
  setCalorieParams,
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

describe("nutrition state (water / calories)", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear(); // no passphrase => plaintext persistence path
  });

  test("water logs persist to localStorage and round-trip", () => {
    const logs = getWaterLogs();
    Object.keys(logs).forEach((k) => delete logs[k]);
    logs["2026-01-01"] = 750;
    saveWaterLogs();

    expect(JSON.parse(localStorage.getItem("gym_water_logs"))).toEqual({
      "2026-01-01": 750,
    });
    expect(getWaterLogs()["2026-01-01"]).toBe(750);
  });

  test("calorie params persist and round-trip", () => {
    const params = { gender: "male", age: 30, height: 180, weight: 80 };
    setCalorieParams(params);

    expect(
      JSON.parse(localStorage.getItem("gym_calorie_calculator_params")),
    ).toEqual(params);
    expect(getCalorieParams()).toEqual(params);
  });
});
