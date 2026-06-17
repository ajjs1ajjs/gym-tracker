import { t } from "./i18n.js";
import { calculate1RM, vibrate } from "./utils.js";

function calculatePlates(): void {
  const weightInput = document.getElementById(
    "plate-weight-input",
  ) as HTMLInputElement;
  const totalWeight = weightInput ? parseFloat(weightInput.value) || 0 : 0;
  const barWeight = 20;
  let weightToDistribute = (totalWeight - barWeight) / 2;

  if (weightToDistribute < 0) weightToDistribute = 0;

  const availablePlates = [25, 20, 15, 10, 5, 2.5, 1.25];
  const result: number[] = [];

  let temp = weightToDistribute;
  availablePlates.forEach((p) => {
    const count = Math.floor(temp / p);
    if (count > 0) {
      for (let i = 0; i < count; i++) result.push(p);
      temp %= p;
    }
  });

  const visualizer = document.getElementById("plate-visualizer");
  if (visualizer) {
    visualizer.textContent = "";
    const barbell = document.createElement("div");
    barbell.className = "barbell";
    const stack = document.createElement("div");
    stack.className = "plates-stack";
    result.forEach((p) => {
      const plate = document.createElement("div");
      plate.className = `plate p${String(p).replace(".", "_")}`;
      plate.title = `${p}kg`;
      plate.textContent = String(p);
      stack.appendChild(plate);
    });
    barbell.appendChild(stack);
    visualizer.appendChild(barbell);
  }

  const resultsArea = document.getElementById("plate-results");
  if (resultsArea) {
    resultsArea.textContent = "";
    const p = document.createElement("p");
    p.textContent =
      result.length > 0
        ? `${t('calc.plate_each_side', result.join("kg, ") + "kg")}`
        : t('calc.plate_only_bar');
    resultsArea.appendChild(p);
  }
}

function calculate1RMSplits(): void {
  const wInput = document.getElementById(
    "calc-1rm-weight",
  ) as HTMLInputElement | null;
  const rInput = document.getElementById(
    "calc-1rm-reps",
  ) as HTMLInputElement | null;
  if (!wInput || !rInput) return;

  const w = parseFloat(wInput.value) || 0;
  const r = parseInt(rInput.value) || 0;

  let oneRM = 0;
  if (w > 0 && r > 0) {
    oneRM = calculate1RM(w, r);
  }

  const valueDisplay = document.getElementById("calc-1rm-value");
  if (valueDisplay) {
    valueDisplay.textContent = t('calc.1rm_value', String(oneRM));
  }

  const tbody = document.getElementById("splits-tbody");
  if (tbody) {
    if (oneRM === 0) {
      tbody.innerHTML = `<tr><td colspan="2" style="text-align:center; padding: 15px; color: var(--text-secondary);">${t('calc.1rm_enter_prompt')}</td></tr>`;
      return;
    }

    const percentages = [100, 95, 90, 85, 80, 75, 70, 65, 60, 50];
    tbody.innerHTML = percentages
      .map((pct) => {
        const splitWeight = Math.round(oneRM * (pct / 100) * 10) / 10;
        return `
          <tr style="border-bottom: 1px solid var(--border);">
            <td style="padding: 8px 0; color: var(--text-primary); font-weight: 500;">${pct}%</td>
            <td style="padding: 8px 0; color: var(--accent); font-weight: bold; text-align: right;">${splitWeight} кг</td>
          </tr>
        `;
      })
      .join("");
  }
}

function switchCalcTab(tabId: "plate" | "1rm"): void {
  const btnPlate = document.getElementById("btn-calc-tab-plate");
  const btn1rm = document.getElementById("btn-calc-tab-1rm");
  const viewPlate = document.getElementById("calc-view-plate");
  const view1rm = document.getElementById("calc-view-1rm");

  if (btnPlate) btnPlate.classList.toggle("active", tabId === "plate");
  if (btn1rm) btn1rm.classList.toggle("active", tabId === "1rm");
  if (viewPlate) viewPlate.style.display = tabId === "plate" ? "block" : "none";
  if (view1rm) view1rm.style.display = tabId === "1rm" ? "block" : "none";

  if (tabId === "1rm") {
    calculate1RMSplits();
  }
  vibrate(20);
}

function openPlateModal(): void {
  const modal = document.getElementById("plate-modal");
  if (modal) modal.style.display = "flex";
  switchCalcTab("plate");
  calculatePlates();
}

function closePlateModal(): void {
  const modal = document.getElementById("plate-modal");
  if (modal) modal.style.display = "none";
}

export {
  calculatePlates,
  calculate1RMSplits,
  switchCalcTab,
  openPlateModal,
  closePlateModal,
};
