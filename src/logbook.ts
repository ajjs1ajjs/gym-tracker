import {
  exerciseLogs,
  customExercises,
  selectedExerciseId,
  getAllExercises,
  mergeCustomExercises,
  saveState,
} from "./data.js";
import { trainingData } from "./exercises.js";
import { showToast, escapeHtml, getLastSessionSets } from "./utils.js";
import { t } from "./i18n.js";
import type { Exercise, LogEntry } from "./types.js";

interface ActiveSet {
  weight: number;
  reps: number;
}

export interface LogbookCallbacks {
  renderExerciseSetsLog: (exerciseId: string | number) => void;
  updateStats: () => void;
  renderExercises: () => void;
  renderMuscleGroups: () => void;
}

let activeSets: ActiveSet[] = [];
let _callbacks: LogbookCallbacks | null = null;

export function setCallbacks(cb: LogbookCallbacks): void {
  // FIX #12: Clear old callbacks to prevent memory leaks and stale references
  _callbacks = null;
  _callbacks = cb;
}

function renderSets(): void {
  const container = document.getElementById("logbook-sets-container");
  if (!container) return;

  container.textContent = "";

  activeSets.forEach((s, idx) => {
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.justifyContent = "space-between";
    row.style.padding = "10px";
    row.style.background = "rgba(255,255,255,0.05)";
    row.style.borderRadius = "5px";
    row.style.alignItems = "center";

    const label = document.createElement("span");
    label.textContent = t('exercise.set_n', String(idx + 1));

    const value = document.createElement("span");
    value.style.color = "var(--theme-color, #00d4ff)";
    value.style.fontWeight = "bold";
    value.textContent = `${s.weight} кг × ${s.reps}`;

    const removeBtn = document.createElement("button");
    removeBtn.className = "lb-remove-set";
    removeBtn.textContent = "✕";
    removeBtn.style.background = "transparent";
    removeBtn.style.border = "none";
    removeBtn.style.color = "#ff4444";
    removeBtn.style.fontSize = "16px";
    removeBtn.style.cursor = "pointer";
    removeBtn.addEventListener("click", () => removeSet(idx));

    row.appendChild(label);
    row.appendChild(value);
    row.appendChild(removeBtn);
    container.appendChild(row);
  });
}

function removeSet(idx: number): void {
  activeSets.splice(idx, 1);
  renderSets();
}

function renderLastSession(): void {
  const select = document.getElementById(
    "logbook-ex-select",
  ) as HTMLSelectElement | null;
  const exerciseId = select?.value;
  const container = document.getElementById("logbook-last-session-container");
  if (!container) return;

  if (!exerciseId) {
    container.style.display = "none";
    return;
  }

  const logs = exerciseLogs[exerciseId] || [];
  const lastSets = getLastSessionSets(logs);

  if (lastSets.length > 0) {
    container.style.display = "flex";
    const setsStr = lastSets
      .map((s) => `${s.weight}кг x ${s.reps}`)
      .join(", ");
    container.innerHTML = `
        <span>${t('exercise.last_session', String(lastSets.length), setsStr)}</span>
        <button class="btn-copy-last" id="btn-copy-last-logbook">${t('exercise.copy_last')}</button>
      `;
    const copyBtn = document.getElementById("btn-copy-last-logbook");
    if (copyBtn) {
      copyBtn.onclick = (e) => {
        e.preventDefault();
        activeSets = lastSets.map((s) => ({
          weight: s.weight,
          reps: s.reps,
        }));
        renderSets();
        showToast(t('logbook.copy_success'), "success");
        container.style.display = "none";
      };
    }
  } else {
    container.style.display = "none";
  }
}

function deleteExercise(): void {
  const select = document.getElementById(
    "logbook-ex-select",
  ) as HTMLSelectElement;
  const exId = select?.value;
  if (!exId) return;

  const allEx = getAllExercises();
  const ex = allEx.find((e) => String(e.id) === String(exId));
  if (!ex) return;

  const isCustom = customExercises.some((e) => String(e.id) === String(exId));
  if (!isCustom) {
    showToast(t('logbook.builtin_delete_warning'), "warning");
    return;
  }

  if (confirm(t('confirm.delete_exercise', ex.name))) {
    customExercises.splice(
      customExercises.findIndex((e) => String(e.id) === String(exId)),
      1,
    );

    trainingData.forEach((group) => {
      (group.exercises as Exercise[]) = (
        group.exercises as Exercise[]
      ).filter((e) => String(e.id) !== String(exId));
    });

    saveState();
    activeSets = [];
    renderSets();
    loadSelect();

    const histSelect = document.getElementById(
      "logbook-history-select",
    ) as HTMLSelectElement;
    if (histSelect && String(histSelect.value) === String(exId)) {
      histSelect.value = "";
      renderHistory();
    }

    _callbacks?.renderExercises();
    _callbacks?.renderMuscleGroups();
    _callbacks?.updateStats();
  }
}

function deleteSet(exerciseId: string | number, originalIndex: number): void {
  if (confirm(t('confirm.delete_set'))) {
    if (exerciseLogs[exerciseId] && exerciseLogs[exerciseId][originalIndex]) {
      exerciseLogs[exerciseId].splice(originalIndex, 1);
      saveState();
      renderHistory();
      _callbacks?.updateStats();
      if (String(selectedExerciseId) === String(exerciseId)) {
        _callbacks?.renderExerciseSetsLog(exerciseId);
      }
    }
  }
}

function deleteDaySession(exerciseId: string | number, dateStr: string): void {
  if (confirm(t('confirm.delete_day', dateStr))) {
    if (exerciseLogs[exerciseId]) {
      exerciseLogs[exerciseId] = exerciseLogs[exerciseId].filter((set) => {
        const d = new Date(set.date);
        const dayKey = d.toLocaleDateString("uk-UA", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
        return dayKey !== dateStr;
      });
      saveState();
      renderHistory();
      _callbacks?.updateStats();
      if (String(selectedExerciseId) === String(exerciseId)) {
        _callbacks?.renderExerciseSetsLog(exerciseId);
      }
    }
  }
}

function createExercise(): void {
  const input = document.getElementById(
    "logbook-custom-ex",
  ) as HTMLInputElement;
  if (!input) return;
  const title = input.value.trim();
  if (!title) return;

  const newEx: Exercise = {
    id: "lb_" + Date.now(),
    name: title,
    muscle: "Груди",
    muscleGroup: "Груди",
    difficulty: "Середній",
    description: t('exercise.custom_description'),
    instructions: [t('exercise.custom_description')],
    sets: "3 x 10",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=300&auto=format&fit=crop",
  };
  customExercises.push(newEx);
  mergeCustomExercises();
  saveState();

  input.value = "";
  loadSelect();

  const select = document.getElementById(
    "logbook-ex-select",
  ) as HTMLSelectElement;
  if (select) select.value = String(newEx.id);

  activeSets = [];
  renderSets();
}

function loadSelect(): void {
  const selectLog = document.getElementById(
    "logbook-ex-select",
  ) as HTMLSelectElement;
  const selectHist = document.getElementById(
    "logbook-history-select",
  ) as HTMLSelectElement;

  const allEx = getAllExercises();
  const sortedEx = [...allEx].sort((a, b) =>
    a.name.localeCompare(b.name, "uk-UA"),
  );

  const optionsBase = sortedEx
    .map(
      (ex) =>
        `<option value="${escapeHtml(String(ex.id))}">${escapeHtml(ex.name)}</option>`,
    )
    .join("");

  if (selectLog) {
    const currentVal = selectLog.value;
    selectLog.innerHTML =
      `<option value="" disabled selected>${t('logbook.select_placeholder')}</option>` +
      optionsBase;
    if (
      currentVal &&
      sortedEx.some((e) => String(e.id) === String(currentVal))
    ) {
      selectLog.value = currentVal;
    }
  }

  if (selectHist) {
    const currentVal = selectHist.value;
    selectHist.innerHTML =
      `<option value="" disabled selected>${t('logbook.history_select_placeholder')}</option>` +
      optionsBase;
    if (
      currentVal &&
      sortedEx.some((e) => String(e.id) === String(currentVal))
    ) {
      selectHist.value = currentVal;
    }
  }

  const exSearch = document.getElementById(
    "logbook-ex-search",
  ) as HTMLInputElement | null;
  if (exSearch) exSearch.value = "";
  const histSearch = document.getElementById(
    "logbook-history-search",
  ) as HTMLInputElement | null;
  if (histSearch) histSearch.value = "";

  renderLastSession();
}

function filterSelect(selectId: string, query: string): void {
  const select = document.getElementById(selectId) as HTMLSelectElement;
  if (!select) return;
  const q = query.toLowerCase().trim();
  for (let i = 0; i < select.options.length; i++) {
    const opt = select.options[i];
    if (!opt.value) continue;
    opt.style.display =
      !q || opt.text.toLowerCase().includes(q) ? "" : "none";
  }
}

function renderHistory(): void {
  const list = document.getElementById("logbook-history-list");
  const selectHist = document.getElementById(
    "logbook-history-select",
  ) as HTMLSelectElement;
  if (!list) return;

  const selectedId = selectHist?.value;

  if (!selectedId) {
    list.innerHTML =
      `<p style="color:var(--text-secondary); text-align:center;">${t('logbook.history_prompt')}</p>`;
    return;
  }

  const sets = exerciseLogs[selectedId] || [];

  if (sets.length === 0) {
    list.innerHTML =
      `<p style="color:var(--text-secondary); text-align:center;">${t('logbook.history_empty')}</p>`;
    return;
  }

  const groups: Record<string, (LogEntry & { originalIndex: number })[]> = {};
  sets.forEach((set, idx) => {
    const d = new Date(set.date);
    const dateStr = d.toLocaleDateString("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    if (!groups[dateStr]) {
      groups[dateStr] = [];
    }
    groups[dateStr].push({ ...set, originalIndex: idx });
  });

  const sortedDates = Object.keys(groups).sort((a, b) => {
    const parseDate = (str: string) => {
      const parts = str.split(".");
      // FIX #13: Validate date parts before creating Date
      if (parts.length !== 3 || !parts.every((p) => /^\d+$/.test(p))) {
        console.warn("Invalid date format:", str);
        return new Date(0);
      }
      const year = Number(parts[2]);
      const month = Number(parts[1]) - 1;
      const day = Number(parts[0]);
      const d = new Date(year, month, day);
      if (isNaN(d.getTime())) {
        console.warn("Invalid date after parsing:", str);
        return new Date(0);
      }
      return d;
    };
    const dateA = parseDate(a);
    const dateB = parseDate(b);
    return +dateB - +dateA;
  });

  const allEx = getAllExercises();
  const ex = allEx.find((e) => String(e.id) === String(selectedId)) || {
    name: t('logbook.deleted_exercise'),
  };

  list.innerHTML = sortedDates
    .map((dateStr) => {
      const daySets = groups[dateStr];
      const sortedDaySets = [...daySets].sort(
        (a, b) => +new Date(a.date) - +new Date(b.date),
      );

      const setsHtml = sortedDaySets
        .map(
          (s, index) => `
                <div style="margin-top: 5px; font-size: 0.95rem; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <span style="color:var(--text-secondary);">${t('exercise.set_n', String(index + 1))}:</span>
                        <b>${s.weight} кг х ${s.reps}</b>
                    </div>
                    <button class="lb-del-set" data-ex="${escapeHtml(String(selectedId))}" data-idx="${s.originalIndex}" style="background:transparent; border:none; color:#ff4444; font-size:14px; cursor:pointer;" title="${t('logbook.delete_set')}">✕</button>
                </div>
            `,
        )
        .join("");

      return `
            <div class="history-card" style="background:var(--card-bg); padding:15px; border-radius:10px; border:1px solid var(--border); margin-bottom:15px;">
                <div style="display:flex; justify-content:space-between; margin-bottom: 10px; border-bottom: 1px solid var(--border); padding-bottom: 8px; align-items:center;">
                    <span style="color:var(--theme-color, #00d4ff); font-weight:bold;">${escapeHtml(ex.name)}</span>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="color:var(--text-secondary); font-size:0.85rem;">${escapeHtml(dateStr)}</span>
                        <button class="lb-del-day" data-ex="${escapeHtml(String(selectedId))}" data-day="${escapeHtml(dateStr)}" style="background:transparent; border:none; cursor:pointer; color:#ef4444; font-size:1.1rem;" title="${t('logbook.delete_day')}">🗑️</button>
                    </div>
                </div>
                ${setsHtml}
            </div>
        `;
    })
    .join("");

  list.querySelectorAll(".lb-del-set").forEach((btn) => {
    btn.addEventListener("click", () => {
      const el = btn as HTMLElement;
      deleteSet(el.dataset.ex || "", parseInt(el.dataset.idx || "0"));
    });
  });

  list.querySelectorAll(".lb-del-day").forEach((btn) => {
    btn.addEventListener("click", () => {
      const el = btn as HTMLElement;
      deleteDaySession(el.dataset.ex || "", el.dataset.day || "");
    });
  });
}

function bindEvents(): void {
  const btnAdd = document.getElementById("btn-add-logbook-set");
  if (btnAdd) {
    btnAdd.addEventListener("click", (e) => {
      e.preventDefault();
      const wInput = document.getElementById(
        "logbook-weight",
      ) as HTMLInputElement;
      const rInput = document.getElementById(
        "logbook-reps",
      ) as HTMLInputElement;
      if (!wInput || !rInput) return;
      const w = parseFloat(wInput.value);
      const r = parseInt(rInput.value);
      if (isNaN(w) || isNaN(r) || w <= 0 || r <= 0) return;

      activeSets.push({ weight: w, reps: r });
      wInput.value = "";
      rInput.value = "";
      renderSets();
    });
  }

  const btnSave = document.getElementById("btn-save-logbook");
  if (btnSave) {
    btnSave.addEventListener("click", (e) => {
      e.preventDefault();
      const select = document.getElementById(
        "logbook-ex-select",
      ) as HTMLSelectElement;
      const exerciseId = select?.value;

      if (!exerciseId || activeSets.length === 0) return;

      if (!exerciseLogs[exerciseId]) {
        exerciseLogs[exerciseId] = [];
      }

      const now = new Date().toISOString();
      activeSets.forEach((set) => {
        exerciseLogs[exerciseId].push({
          date: now,
          weight: set.weight,
          reps: set.reps,
        });
      });

      saveState();
      activeSets = [];
      renderSets();

      const toast = document.getElementById("logbook-toast");
      if (toast) {
        toast.style.display = "block";
        setTimeout(() => {
          toast.style.display = "none";
        }, 2000);
      }

      _callbacks?.updateStats();
      if (String(selectedExerciseId) === String(exerciseId)) {
        _callbacks?.renderExerciseSetsLog(exerciseId);
      }
    });
  }

  const exSelect = document.getElementById(
    "logbook-ex-select",
  ) as HTMLSelectElement | null;
  if (exSelect) {
    exSelect.addEventListener("change", () => {
      activeSets = [];
      renderSets();
      renderLastSession();
    });
  }

  const histSelect = document.getElementById("logbook-history-select");
  if (histSelect) {
    histSelect.addEventListener("change", () => {
      renderHistory();
    });
  }

  const exSearch = document.getElementById("logbook-ex-search");
  if (exSearch) {
    exSearch.addEventListener("input", () => {
      filterSelect(
        "logbook-ex-select",
        (exSearch as HTMLInputElement).value,
      );
    });
  }

  const histSearch = document.getElementById("logbook-history-search");
  if (histSearch) {
    histSearch.addEventListener("input", () => {
      filterSelect(
        "logbook-history-select",
        (histSearch as HTMLInputElement).value,
      );
    });
  }

  const btnDelEx = document.getElementById("btn-delete-logbook-ex");
  if (btnDelEx) {
    btnDelEx.addEventListener("click", (e) => {
      e.preventDefault();
      deleteExercise();
    });
  }
}

export function init(): void {
  bindEvents();
}

export {
  loadSelect,
  renderHistory,
  createExercise,
  deleteSet,
  deleteDaySession,
  filterSelect,
};

export default {
  init,
  loadSelect,
  renderHistory,
  createExercise,
  setCallbacks,
};
