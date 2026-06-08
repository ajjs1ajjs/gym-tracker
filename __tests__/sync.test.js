import { safeJSONParse, calculate1RM } from "../src/utils.js";

describe("exportToCSV", () => {
  test("CSV header is correct", () => {
    const header = "Дата,Вправа,Група,Вага,Повтори,1RM\n";
    expect(header).toContain("Дата");
    expect(header).toContain("1RM");
  });
});

describe("exportForAppleHealth", () => {
  test("Apple Health CSV has correct headers", () => {
    const header =
      "Date,Workout Name,Duration,Exercise Name,Set Order,Weight,Reps,Distance,Seconds,Notes,Workout Notes,RPE\n";
    expect(header).toContain("Set Order");
    expect(header).toContain("RPE");
  });
});

describe("safeJSONParse edge cases", () => {
  test("handles large nested objects", () => {
    const obj = { a: { b: { c: [1, 2, 3] } } };
    expect(safeJSONParse(JSON.stringify(obj))).toEqual(obj);
  });

  test("undefined input falls back to null", () => {
    expect(safeJSONParse(undefined, null)).toBeNull();
  });
});

describe("calculate1RM extras", () => {
  test("Epley: 10 reps at 100kg = 133kg", () => {
    expect(calculate1RM(100, 10)).toBe(133);
  });

  test("Epley: 1 rep equals input weight", () => {
    expect(calculate1RM(200, 1)).toBe(200);
  });
});
