import { bodyWeightHistory, saveState } from "./data.js";
import { t } from "./i18n.js";
import { formatDate, vibrate, showToast, getDateKey } from "./utils.js";
import type { Chart as ChartJS } from "chart.js";

let bodyChart: ChartJS | null = null;

function saveBodyWeight() {
  const input = document.getElementById(
    "body-weight-input",
  ) as HTMLInputElement | null;
  if (!input) return;
  const weight = parseFloat(input.value);
  if (!weight || weight <= 0) {
    showToast(t('toast.enter_valid_weight'), "warning");
    return;
  }

  const date = new Date().toISOString();
  bodyWeightHistory.push({ date, weight });
  saveState();
  renderBodyStats();
  vibrate(50);
  input.value = "";
}

function renderBodyStats() {
  const historyList = document.getElementById("body-history-list");
  if (!historyList) return;

  const sortedHistory = [...bodyWeightHistory].sort(
    (a, b) => +new Date(b.date) - +new Date(a.date),
  );

  historyList.innerHTML = sortedHistory
    .map(
      (item) => `
        <div class="body-history-item">
            <span>${formatDate(item.date)}</span>
            <span style="color:var(--accent); font-weight:bold;">${item.weight} кг</span>
        </div>
    `,
    )
    .join("");

  renderBodyChart();
}

function renderBodyChart() {
  const canvas = document.getElementById(
    "body-chart",
  ) as HTMLCanvasElement | null;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  if (bodyChart) bodyChart.destroy();

  const data = bodyWeightHistory.slice(-15);

  if (data.length === 0) return;

  bodyChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: data.map((i) => new Date(i.date).toLocaleDateString()),
      datasets: [
        {
          label: t('body.chart_label'),
          data: data.map((i) => i.weight),
          borderColor: "#00d4ff",
          backgroundColor: "rgba(0, 212, 255, 0.1)",
          fill: true,
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: false, grid: { color: "rgba(255,255,255,0.05)" } },
        x: { grid: { display: false } },
      },
    },
  });
}

// --- Water Tracker ---

function getWaterGoal(): number {
  const goal = localStorage.getItem("gym_water_goal");
  return goal ? parseInt(goal, 10) : 2000;
}

function saveWaterGoal(goal: number): void {
  localStorage.setItem("gym_water_goal", String(goal));
  renderWaterTracker();
}

function getWaterLogForToday(): number {
  const today = getDateKey(new Date());
  const logsStr = localStorage.getItem("gym_water_logs");
  if (!logsStr) return 0;
  try {
    const logs = JSON.parse(logsStr) as Record<string, number>;
    return logs[today] || 0;
  } catch {
    return 0;
  }
}

function addWater(ml: number): void {
  const today = getDateKey(new Date());
  const logsStr = localStorage.getItem("gym_water_logs");
  let logs: Record<string, number> = {};
  if (logsStr) {
    try {
      logs = JSON.parse(logsStr) as Record<string, number>;
    } catch {
      logs = {};
    }
  }
  logs[today] = (logs[today] || 0) + ml;
  localStorage.setItem("gym_water_logs", JSON.stringify(logs));
  renderWaterTracker();
  vibrate(30);
}

function resetWater(): void {
  const today = getDateKey(new Date());
  const logsStr = localStorage.getItem("gym_water_logs");
  let logs: Record<string, number> = {};
  if (logsStr) {
    try {
      logs = JSON.parse(logsStr) as Record<string, number>;
    } catch {
      logs = {};
    }
  }
  logs[today] = 0;
  localStorage.setItem("gym_water_logs", JSON.stringify(logs));
  renderWaterTracker();
  vibrate(20);
}

function renderWaterTracker(): void {
  const current = getWaterLogForToday();
  const goal = getWaterGoal();
  const pct = goal > 0 ? Math.min(100, Math.round((current / goal) * 100)) : 0;

  const textEl = document.getElementById("water-progress-text");
  const barEl = document.getElementById("water-progress-bar");
  const goalInput = document.getElementById(
    "water-goal-input",
  ) as HTMLInputElement | null;

  if (textEl) {
    textEl.textContent = t('water.text', String(current), String(goal), String(pct));
  }
  if (barEl) {
    barEl.style.width = `${pct}%`;
  }
  if (goalInput) {
    goalInput.value = String(goal);
  }
}

// --- Calorie & Macro Calculator ---

interface CalorieParams {
  gender: string;
  age: number;
  height: number;
  weight: number;
  activity: number;
  goal: string;
}

function loadCalorieParams(): void {
  const paramsStr = localStorage.getItem("gym_calorie_calculator_params");
  if (!paramsStr) return;
  try {
    const params = JSON.parse(paramsStr) as CalorieParams;
    const genderEl = document.getElementById(
      "cal-gender",
    ) as HTMLSelectElement | null;
    const ageEl = document.getElementById("cal-age") as HTMLInputElement | null;
    const heightEl = document.getElementById(
      "cal-height",
    ) as HTMLInputElement | null;
    const weightEl = document.getElementById(
      "cal-weight",
    ) as HTMLInputElement | null;
    const activityEl = document.getElementById(
      "cal-activity",
    ) as HTMLSelectElement | null;
    const goalEl = document.getElementById(
      "cal-goal",
    ) as HTMLSelectElement | null;

    if (genderEl) genderEl.value = params.gender;
    if (ageEl) ageEl.value = String(params.age);
    if (heightEl) heightEl.value = String(params.height);
    if (weightEl) weightEl.value = String(params.weight);
    if (activityEl) activityEl.value = String(params.activity);
    if (goalEl) goalEl.value = params.goal;

    calculateCalories(false);
  } catch {
    // Ignore invalid save state
  }
}

function calculateCalories(interactive = true): void {
  const genderEl = document.getElementById(
    "cal-gender",
  ) as HTMLSelectElement | null;
  const ageEl = document.getElementById("cal-age") as HTMLInputElement | null;
  const heightEl = document.getElementById(
    "cal-height",
  ) as HTMLInputElement | null;
  const weightEl = document.getElementById(
    "cal-weight",
  ) as HTMLInputElement | null;
  const activityEl = document.getElementById(
    "cal-activity",
  ) as HTMLSelectElement | null;
  const goalEl = document.getElementById(
    "cal-goal",
  ) as HTMLSelectElement | null;

  if (!genderEl || !ageEl || !heightEl || !weightEl || !activityEl || !goalEl)
    return;

  const gender = genderEl.value;
  const age = parseInt(ageEl.value, 10);
  const height = parseInt(heightEl.value, 10);
  const weight = parseFloat(weightEl.value);
  const activity = parseFloat(activityEl.value);
  const goal = goalEl.value;

  if (!age || age <= 0 || !height || height <= 0 || !weight || weight <= 0) {
    if (interactive)
      showToast(t('toast.fill_all_fields'), "warning");
    return;
  }

  const params: CalorieParams = { gender, age, height, weight, activity, goal };
  localStorage.setItem("gym_calorie_calculator_params", JSON.stringify(params));

  // Mifflin-St Jeor
  let bmr = 0;
  if (gender === "male") {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  const tdee = bmr * activity;

  let targetCalories = tdee;
  if (goal === "loss") {
    targetCalories = tdee - 500;
  } else if (goal === "gain") {
    targetCalories = tdee + 300;
  }

  if (targetCalories < 1200) {
    targetCalories = 1200;
  }

  const caloriesRounded = Math.round(targetCalories);

  let proteinPct = 0.25;
  let fatPct = 0.3;
  let carbPct = 0.45;

  if (goal === "loss") {
    proteinPct = 0.35;
    fatPct = 0.3;
    carbPct = 0.35;
  } else if (goal === "gain") {
    proteinPct = 0.25;
    fatPct = 0.25;
    carbPct = 0.5;
  }

  const proteinG = Math.round((caloriesRounded * proteinPct) / 4);
  const fatG = Math.round((caloriesRounded * fatPct) / 9);
  const carbG = Math.round((caloriesRounded * carbPct) / 4);

  const resultsDiv = document.getElementById("calorie-results");
  const calValEl = document.getElementById("cal-result-calories");
  const protValEl = document.getElementById("cal-result-protein");
  const fatValEl = document.getElementById("cal-result-fat");
  const carbValEl = document.getElementById("cal-result-carb");

  const protPctEl = document.getElementById("cal-result-protein-pct");
  const fatPctEl = document.getElementById("cal-result-fat-pct");
  const carbPctEl = document.getElementById("cal-result-carb-pct");

  if (calValEl) calValEl.textContent = t('calories.result_calories', String(caloriesRounded));
  if (protValEl) protValEl.textContent = t('calories.result_grams', String(proteinG));
  if (fatValEl) fatValEl.textContent = t('calories.result_grams', String(fatG));
  if (carbValEl) carbValEl.textContent = t('calories.result_grams', String(carbG));

  if (protPctEl) protPctEl.textContent = t('calories.result_percent', String(Math.round(proteinPct * 100)));
  if (fatPctEl) fatPctEl.textContent = t('calories.result_percent', String(Math.round(fatPct * 100)));
  if (carbPctEl) carbPctEl.textContent = t('calories.result_percent', String(Math.round(carbPct * 100)));

  if (resultsDiv) resultsDiv.style.display = "block";

  if (interactive) {
    vibrate(40);
    showToast(t('toast.calories_calculated'), "success");
  }
}

export function destroyBodyChart(): void {
  if (bodyChart) { bodyChart.destroy(); bodyChart = null; }
}

export {
  saveBodyWeight,
  renderBodyStats,
  renderBodyChart,
  addWater,
  resetWater,
  renderWaterTracker,
  saveWaterGoal,
  loadCalorieParams,
  calculateCalories,
};
