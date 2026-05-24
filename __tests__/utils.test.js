import { safeJSONParse, calculate1RM, diffClass } from "../js/utils.js";

describe("safeJSONParse", () => {
  test("parses valid JSON", () => {
    expect(safeJSONParse('{"a":1}')).toEqual({ a: 1 });
    expect(safeJSONParse("[1,2,3]")).toEqual([1, 2, 3]);
    expect(safeJSONParse('"hello"')).toBe("hello");
  });

  test("returns fallback for invalid JSON", () => {
    expect(safeJSONParse("{bad}", null)).toBeNull();
    expect(safeJSONParse("undefined", [])).toEqual([]);
    expect(safeJSONParse("", false)).toBe(false);
  });

  test("defaults to null when no fallback given", () => {
    expect(safeJSONParse("not json")).toBeNull();
  });
});

describe("calculate1RM (Epley formula)", () => {
  test("1 rep equals weight", () => {
    expect(calculate1RM(100, 1)).toBe(100);
  });

  test("10 reps at 100kg", () => {
    const result = calculate1RM(100, 10);
    expect(result).toBe(133);
  });

  test("5 reps at 80kg", () => {
    const result = calculate1RM(80, 5);
    expect(result).toBe(93);
  });

  test("rounds to nearest integer", () => {
    const result = calculate1RM(65, 8);
    expect(Number.isInteger(result)).toBe(true);
  });
});

describe("diffClass", () => {
  test('maps "Легкий" to "easy"', () => {
    expect(diffClass("Легкий")).toBe("easy");
  });

  test('maps "Середній" to "medium"', () => {
    expect(diffClass("Середній")).toBe("medium");
  });

  test('maps "Складний" to "hard"', () => {
    expect(diffClass("Складний")).toBe("hard");
  });

  test('defaults to "medium" for unknown', () => {
    expect(diffClass("Unknown")).toBe("medium");
  });
});
