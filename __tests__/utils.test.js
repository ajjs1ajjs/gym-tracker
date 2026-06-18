import {
  safeJSONParse,
  calculate1RM,
  diffClass,
  getLastSessionSets,
  escapeHtml,
} from "../src/utils.js";

describe("escapeHtml", () => {
  test("escapes angle brackets and ampersands", () => {
    expect(escapeHtml("<script>")).toBe("&lt;script&gt;");
    expect(escapeHtml("a & b")).toBe("a &amp; b");
  });

  test("escapes quotes to prevent attribute breakout (XSS)", () => {
    // Regression for C2: values are interpolated into double-quoted attributes
    expect(escapeHtml('" onerror="alert(1)')).toBe(
      "&quot; onerror=&quot;alert(1)",
    );
    expect(escapeHtml("'")).toBe("&#39;");
  });

  test("coerces non-string input safely", () => {
    expect(escapeHtml(42)).toBe("42");
  });
});

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

  test("returns input for unknown", () => {
    expect(diffClass("Unknown")).toBe("Unknown");
  });
});

describe("getLastSessionSets", () => {
  test("returns empty array for empty logs", () => {
    expect(getLastSessionSets([])).toEqual([]);
    expect(getLastSessionSets(null)).toEqual([]);
  });

  test("ignores today's logs", () => {
    const today = new Date().toISOString();
    const logs = [
      { date: today, weight: 100, reps: 5 },
      { date: today, weight: 105, reps: 5 },
    ];
    expect(getLastSessionSets(logs)).toEqual([]);
  });

  test("returns sets from the most recent past day", () => {
    const today = new Date().toISOString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const lastWeek = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const logs = [
      { date: lastWeek, weight: 80, reps: 5 },
      { date: yesterday, weight: 90, reps: 5 },
      { date: yesterday, weight: 95, reps: 5 },
      { date: today, weight: 100, reps: 5 },
    ];
    expect(getLastSessionSets(logs)).toEqual([
      { date: yesterday, weight: 90, reps: 5 },
      { date: yesterday, weight: 95, reps: 5 },
    ]);
  });
});
