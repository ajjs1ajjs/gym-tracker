/**
 * Regression: every i18n key referenced by the custom-exercise creation paths
 * must exist in the locale, otherwise t() renders the literal key as UI text
 * (audit fix #7 — logbook.ts used a non-existent 'exercise.custom_description').
 */
import uk from "../src/locales/uk.js";
import { loadLocale, t } from "../src/i18n.js";

describe("i18n key existence", () => {
  beforeAll(() => loadLocale(uk));

  const usedKeys = [
    "custom_exercise.default_name",
    "custom_exercise.default_description",
    "custom_exercise.default_instructions",
    "keyboard.hint",
  ];

  test.each(usedKeys)("key '%s' resolves to a real string (not the key itself)", (key) => {
    const value = t(key);
    expect(value).not.toBe(key);
    expect(value.length).toBeGreaterThan(0);
  });

  test("the removed bad key is gone", () => {
    expect(uk["exercise.custom_description"]).toBeUndefined();
  });

  test("keyboard.hint has no leftover positional placeholders", () => {
    expect(t("keyboard.hint")).not.toMatch(/\{\d\}/);
  });
});
