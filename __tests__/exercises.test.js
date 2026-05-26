import { trainingData } from "../src/exercises.js";

describe("trainingData", () => {
  test("has 9 muscle groups", () => {
    expect(trainingData.length).toBe(9);
  });

  test("every exercise has required fields", () => {
    trainingData.forEach((group) => {
      group.exercises.forEach((ex) => {
        expect(ex.id).toBeDefined();
        expect(typeof ex.id).toBe("number");
        expect(ex.name).toBeTruthy();
        expect(ex.image).toBeTruthy();
        expect(ex.difficulty).toBeTruthy();
        expect(ex.muscle).toBeTruthy();
        expect(Array.isArray(ex.instructions)).toBe(true);
        expect(ex.instructions.length).toBeGreaterThan(0);
      });
    });
  });

  test("all exercise IDs are unique", () => {
    const ids = trainingData.flatMap((g) => g.exercises.map((e) => e.id));
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  test("difficulty values are valid", () => {
    const valid = ["Легкий", "Середній", "Складний"];
    trainingData.flatMap((g) => g.exercises).forEach((ex) => {
      expect(valid).toContain(ex.difficulty);
    });
  });
});
