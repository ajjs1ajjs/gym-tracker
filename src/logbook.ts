import {
  exerciseLogs,
  customExercises,
  selectedExerciseId,
  getAllExercises,
  mergeCustomExercises,
  saveState,
} from "./data.js";
import { trainingData } from "./exercises.js";
import {
  renderExerciseSetsLog,
  updateStats,
  renderExercises,
  renderMuscleGroups,
} from "./ui.js";
import { showToast, escapeHtml, getLastSessionSets } from "./utils.js";
import type { Exercise, LogEntry } from "./types.js";

interface ActiveSet {
  weight: number;
  reps: number;
}

const LogbookModule = {
  activeSets: [] as ActiveSet[],

  init() {
    this.bindEvents();
  },

  bindEvents() {
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

        this.activeSets.push({ weight: w, reps: r });
        wInput.value = "";
        rInput.value = "";
        this.renderSets();
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

        if (!exerciseId || this.activeSets.length === 0) return;

        if (!exerciseLogs[exerciseId]) {
          exerciseLogs[exerciseId] = [];
        }

        const now = new Date().toISOString();
        this.activeSets.forEach((set) => {
          exerciseLogs[exerciseId].push({
            date: now,
            weight: set.weight,
            reps: set.reps,
          });
        });

        saveState();
        this.activeSets = [];
        this.renderSets();

        const toast = document.getElementById("logbook-toast");
        if (toast) {
          toast.style.display = "block";
          setTimeout(() => {
            toast.style.display = "none";
          }, 2000);
        }

        updateStats();
        if (String(selectedExerciseId) === String(exerciseId)) {
          renderExerciseSetsLog(exerciseId);
        }
      });
    }

    const exSelect = document.getElementById(
      "logbook-ex-select",
    ) as HTMLSelectElement | null;
    if (exSelect) {
      exSelect.addEventListener("change", () => {
        this.activeSets = [];
        this.renderSets();
        this.renderLastSession();
      });
    }

    const histSelect = document.getElementById("logbook-history-select");
    if (histSelect) {
      histSelect.addEventListener("change", () => {
        this.renderHistory();
      });
    }

    const exSearch = document.getElementById("logbook-ex-search");
    if (exSearch) {
      exSearch.addEventListener("input", () => {
        this.filterSelect(
          "logbook-ex-select",
          (exSearch as HTMLInputElement).value,
        );
      });
    }

    const histSearch = document.getElementById("logbook-history-search");
    if (histSearch) {
      histSearch.addEventListener("input", () => {
        this.filterSelect(
          "logbook-history-select",
          (histSearch as HTMLInputElement).value,
        );
      });
    }

    const btnDelEx = document.getElementById("btn-delete-logbook-ex");
    if (btnDelEx) {
      btnDelEx.addEventListener("click", (e) => {
        e.preventDefault();
        this.deleteExercise();
      });
    }
  },

  renderSets() {
    const container = document.getElementById("logbook-sets-container");
    if (!container) return;

    container.innerHTML = this.activeSets
      .map(
        (s, idx) => `
            <div style="display:flex; justify-content:space-between; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 5px; align-items:center;">
                <span>Підхід ${idx + 1}</span>
                <span style="color: var(--theme-color, #00d4ff); font-weight: bold;">${s.weight} кг × ${s.reps}</span>
                <button class="lb-remove-set" data-idx="${idx}" style="background:transparent; border:none; color:#ff4444; font-size:16px; cursor:pointer;">✕</button>
            </div>
        `,
      )
      .join("");

    container.querySelectorAll(".lb-remove-set").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt((btn as HTMLElement).dataset.idx || "0");
        this.removeSet(idx);
      });
    });
  },

  removeSet(idx: number) {
    this.activeSets.splice(idx, 1);
    this.renderSets();
  },

  renderLastSession() {
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
        <span>📋 Минулий раз: ${lastSets.length} підх. (${setsStr})</span>
        <button class="btn-copy-last" id="btn-copy-last-logbook">Скопіювати</button>
      `;
      const copyBtn = document.getElementById("btn-copy-last-logbook");
      if (copyBtn) {
        copyBtn.onclick = (e) => {
          e.preventDefault();
          this.activeSets = lastSets.map((s) => ({
            weight: s.weight,
            reps: s.reps,
          }));
          this.renderSets();
          showToast("Попередні підходи додано в журнал", "success");
          container.style.display = "none";
        };
      }
    } else {
      container.style.display = "none";
    }
  },

  deleteExercise() {
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
      showToast("Вбудовані вправи не можна видалити.", "warning");
      return;
    }

    if (
      confirm(
        `Ви впевнені, що хочете видалити вправу "${ex.name}"? Її минулі записи в історії збережуться.`,
      )
    ) {
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
      this.activeSets = [];
      this.renderSets();
      this.loadSelect();

      const histSelect = document.getElementById(
        "logbook-history-select",
      ) as HTMLSelectElement;
      if (histSelect && String(histSelect.value) === String(exId)) {
        histSelect.value = "";
        this.renderHistory();
      }

      renderExercises();
      renderMuscleGroups();
      updateStats();
    }
  },

  deleteSet(exerciseId: string | number, originalIndex: number) {
    if (confirm("Ви впевнені, що хочете видалити цей підхід?")) {
      if (exerciseLogs[exerciseId] && exerciseLogs[exerciseId][originalIndex]) {
        exerciseLogs[exerciseId].splice(originalIndex, 1);
        saveState();
        this.renderHistory();
        updateStats();
        if (String(selectedExerciseId) === String(exerciseId)) {
          renderExerciseSetsLog(exerciseId);
        }
      }
    }
  },

  deleteDaySession(exerciseId: string | number, dateStr: string) {
    if (confirm(`Ви впевнені, що хочете видалити всі підходи за ${dateStr}?`)) {
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
        this.renderHistory();
        updateStats();
        if (String(selectedExerciseId) === String(exerciseId)) {
          renderExerciseSetsLog(exerciseId);
        }
      }
    }
  },

  createExercise() {
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
      description: "Користувацька вправа з Журналу",
      instructions: ["Користувацька вправа"],
      sets: "3 x 10",
      image:
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=300&auto=format&fit=crop",
    };
    customExercises.push(newEx);
    mergeCustomExercises();
    saveState();

    input.value = "";
    this.loadSelect();

    const select = document.getElementById(
      "logbook-ex-select",
    ) as HTMLSelectElement;
    if (select) select.value = String(newEx.id);

    this.activeSets = [];
    this.renderSets();
  },

  loadSelect() {
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
        '<option value="" disabled selected>Оберіть вправу</option>' +
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
        '<option value="" disabled selected>Оберіть вправу для перегляду</option>' +
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

    this.renderLastSession();
  },

  filterSelect(selectId: string, query: string) {
    const select = document.getElementById(selectId) as HTMLSelectElement;
    if (!select) return;
    const q = query.toLowerCase().trim();
    for (let i = 0; i < select.options.length; i++) {
      const opt = select.options[i];
      if (!opt.value) continue;
      opt.style.display =
        !q || opt.text.toLowerCase().includes(q) ? "" : "none";
    }
  },

  renderHistory() {
    const list = document.getElementById("logbook-history-list");
    const selectHist = document.getElementById(
      "logbook-history-select",
    ) as HTMLSelectElement;
    if (!list) return;

    const selectedId = selectHist?.value;

    if (!selectedId) {
      list.innerHTML =
        '<p style="color:var(--text-secondary); text-align:center;">Оберіть вправу зі списку вище, щоб побачити історію.</p>';
      return;
    }

    const sets = exerciseLogs[selectedId] || [];

    if (sets.length === 0) {
      list.innerHTML =
        '<p style="color:var(--text-secondary); text-align:center;">Історія порожня для цієї вправи.</p>';
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
        return new Date(
          Number(parts[2]),
          Number(parts[1]) - 1,
          Number(parts[0]),
        );
      };
      return +parseDate(b) - +parseDate(a);
    });

    const allEx = getAllExercises();
    const ex = allEx.find((e) => String(e.id) === String(selectedId)) || {
      name: "Видалена вправа",
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
                        <span style="color:var(--text-secondary);">Підхід ${index + 1}:</span>
                        <b>${s.weight} кг х ${s.reps}</b>
                    </div>
                    <button class="lb-del-set" data-ex="${escapeHtml(String(selectedId))}" data-idx="${s.originalIndex}" style="background:transparent; border:none; color:#ff4444; font-size:14px; cursor:pointer;" title="Видалити підхід">✕</button>
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
                        <button class="lb-del-day" data-ex="${escapeHtml(String(selectedId))}" data-day="${escapeHtml(dateStr)}" style="background:transparent; border:none; cursor:pointer; color:#ef4444; font-size:1.1rem;" title="Видалити весь день">🗑️</button>
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
        this.deleteSet(el.dataset.ex || "", parseInt(el.dataset.idx || "0"));
      });
    });

    list.querySelectorAll(".lb-del-day").forEach((btn) => {
      btn.addEventListener("click", () => {
        const el = btn as HTMLElement;
        this.deleteDaySession(el.dataset.ex || "", el.dataset.day || "");
      });
    });
  },
};

export default LogbookModule;
