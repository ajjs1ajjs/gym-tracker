describe("body weight calculations", () => {
  test("BMI formula works correctly", () => {
    const weight = 80;
    const heightM = 1.8;
    const bmi = weight / (heightM * heightM);
    expect(bmi).toBeCloseTo(24.69, 1);
  });
});

describe("calorie math (Mifflin-St Jeor)", () => {
  const calculateBMR = (gender, weight, height, age) => {
    if (gender === "male") {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    }
    return 10 * weight + 6.25 * height - 5 * age - 161;
  };

  test("male BMR at 80kg 175cm 25yr", () => {
    const bmr = calculateBMR("male", 80, 175, 25);
    expect(bmr).toBe(1773.75);
  });

  test("female BMR at 60kg 165cm 30yr", () => {
    const bmr = calculateBMR("female", 60, 165, 30);
    expect(bmr).toBe(1320.25);
  });

  test("TDEE with moderate activity", () => {
    const bmr = calculateBMR("male", 80, 175, 25);
    const tdee = bmr * 1.55;
    expect(tdee).toBeCloseTo(2749.31, 1);
  });
});

describe("water tracker math", () => {
  test("percentage calculation", () => {
    const current = 750;
    const goal = 2000;
    const pct = Math.min(100, Math.round((current / goal) * 100));
    expect(pct).toBe(38);
  });

  test("does not exceed 100%", () => {
    const current = 2500;
    const goal = 2000;
    const pct = Math.min(100, Math.round((current / goal) * 100));
    expect(pct).toBe(100);
  });
});
