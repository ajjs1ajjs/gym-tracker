import {
  trainingData,
  completionState,
  exerciseLogs,
  customExercises,
  selectedMuscleGroup,
  selectedExerciseId,
  getAllExercises,
  saveState,
  savePlans,
  workoutPlans,
  getWorkoutHistory,
  mergeCustomExercises,
  resetCompletionState,
  markExerciseComplete,
  unmarkExerciseComplete,
  setSelectedMuscleGroup,
  setSelectedExerciseId,
} from "./data.js";
import {
  formatDate,
  calculate1RM,
  vibrate,
  celebration,
  requestWakeLock,
  releaseWakeLock,
  diffClass,
  safeJSONParse,
  showToast,
  escapeHtml,
  getLastSessionSets,
  getDateKey,
} from "./utils.js";
import { openTimerModal, startTimer } from "./timer.js";
import {
  renderBodyStats,
  renderWaterTracker,
  loadCalorieParams,
  destroyBodyChart,
} from "./stats.js";
import LogbookModule from "./logbook.js";
import { t } from "./i18n.js";
import type { CompletionEntry, Exercise } from "./types.js";
import type { Chart as ChartJS } from "chart.js";
import {
  calculatePlates,
  calculate1RMSplits,
  switchCalcTab,
  openPlateModal,
  closePlateModal,
} from "./plates.js";
import { renderHeatmap } from "./renderers/heatmap.js";

let progressionChart: ChartJS | null = null;
let historyChartInstance: ChartJS | null = null;
let muscleChartInstance: ChartJS | null = null;

let updateStatsTimeout: ReturnType<typeof setTimeout> | null = null;
let exerciseSearchQuery = "";
let logSetDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

function updateStats(): void {
  if (updateStatsTimeout) clearTimeout(updateStatsTimeout);
  updateStatsTimeout = setTimeout(() => {
    const allExercises = getAllExercises();
    const total = allExercises.length;
    let completed = 0;
    const workoutDates = new Set<string>();
    let totalVolume = 0;

    allExercises.forEach((ex) => {
      if (completionState[ex.id]) {
        completed++;
        if (completionState[ex.id].date) {
          workoutDates.add(getDateKey(new Date(completionState[ex.id].date)));
        }
      }
    });

    Object.values(exerciseLogs).forEach((logs) => {
      logs.forEach((s) => {
        totalVolume += (s.weight || 0) * (s.reps || 0);
      });
    });

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    const progressEl = document.getElementById("progress-percent");
    const fillEl = document.getElementById("progress-fill");
    if (progressEl) progressEl.textContent = percent + "%";
    if (fillEl) fillEl.style.width = percent + "%";

    const completedEl = document.getElementById("completed-exercises");
    if (completedEl) completedEl.textContent = String(completed);

    const workoutsEl = document.getElementById("total-workouts");
    if (workoutsEl) workoutsEl.textContent = String(workoutDates.size);

    const volumeEl = document.getElementById("total-volume");
    if (volumeEl) {
      volumeEl.textContent =
        totalVolume > 1000
          ? (totalVolume / 1000).toFixed(1) + "т"
          : totalVolume + "кг";
    }
  }, 100);
}

function renderMuscleGroups(): void {
  const container = document.getElementById("muscle-groups");
  if (!container) return;

  container.innerHTML = trainingData
    .map((group) => {
      const groupExercises = group.exercises.length;
      let groupCompleted = 0;
      group.exercises.forEach((ex) => {
        if (completionState[ex.id]) groupCompleted++;
      });

      const isActive = selectedMuscleGroup === group.id;
      const isComplete = groupCompleted === groupExercises;

      return `
            <div class="muscle-group ${isActive ? "active" : ""} ${isComplete ? "completed" : ""}"
                 data-muscle-id="${escapeHtml(String(group.id))}">
                <span class="muscle-icon">${escapeHtml(group.icon)}</span>
                <span class="muscle-name">${escapeHtml(group.name)}</span>
                <span class="muscle-progress">${groupCompleted}/${groupExercises}</span>
            </div>
        `;
    })
    .join("");
}

function filterByGroup(groupId: string): void {
  setSelectedMuscleGroup(selectedMuscleGroup === groupId ? null : groupId);
  renderMuscleGroups();
  renderExercises();
}

function setSearchQuery(query: string): void {
  exerciseSearchQuery = query.toLowerCase().trim();
  renderMuscleGroups();
  renderExercises();
}

function matchesSearch(ex: Exercise): boolean {
  if (!exerciseSearchQuery) return true;
  const name = ex.name.toLowerCase();
  const muscle = (ex.muscle || "").toLowerCase();
  return name.includes(exerciseSearchQuery) || muscle.includes(exerciseSearchQuery);
}

function renderExercises(): void {
  const container = document.getElementById("exercises-list");
  if (!container) return;

  const filteredGroups = selectedMuscleGroup
    ? trainingData.filter((g) => g.id === selectedMuscleGroup)
    : trainingData;

  container.innerHTML = filteredGroups
    .map(
      (group) => {
        const filteredExs = group.exercises.filter(matchesSearch);
        if (filteredExs.length === 0) return "";
        return `
        <div class="exercise-group">
            <h2 class="group-title">${escapeHtml(group.icon)} ${escapeHtml(group.name)}</h2>
            <div class="exercises-grid">
                ${filteredExs
                  .map((ex) => {
                    const state = completionState[ex.id];
                    const isCompleted = !!state;

                    return `
                        <div class="exercise-card ${isCompleted ? "completed" : ""}" data-ex-id="${ex.id}">
                            <div class="card-image">
                                <img src="${escapeHtml(ex.image)}" alt="${escapeHtml(ex.name)}" loading="lazy">
                                ${isCompleted ? '<div class="completed-badge">✓</div>' : ""}
                            </div>
                            <div class="card-content">
                                <h3>${escapeHtml(ex.name)}</h3>
                                <div class="card-meta">
                                    <span class="muscle-tag">${escapeHtml(ex.muscle)}</span>
                                    <span class="difficulty-tag ${diffClass(ex.difficulty)}">${escapeHtml(ex.difficulty)}</span>
                                </div>
                                ${state ? `<p class="completed-date">${t('exercise.completed_date', formatDate(state.date))}</p>` : ""}
                                <button class="check-btn ${isCompleted ? "checked" : ""}" data-check-id="${ex.id}">
                                    ${isCompleted ? t('exercise.check_mark') : t('exercise.check_pending')}
                                </button>
                            </div>
                        </div>
                    `;
                  })
                  .join("")}
            </div>
        </div>
    `;
      },
    )
    .join("");
}

function toggleExercise(id: string | number): void {
  const allExercises = getAllExercises();
  const exercise = allExercises.find((ex) => ex.id === id);

  if (completionState[id]) {
    unmarkExerciseComplete(id);
  } else {
    markExerciseComplete(
      id,
      new Date().toISOString(),
      exercise ? exercise.name : "",
    );
  }

  saveState();
  updateStats();
  renderMuscleGroups();
  renderExercises();
  updateModalState();

  if (completionState[id]) {
    vibrate(80);
    const group = trainingData.find((g) =>
      g.exercises.some((ex) => ex.id === id),
    );
    if (group && group.exercises.every((ex) => completionState[ex.id])) {
      celebration();
    }
  }
}

function openModal(id: string | number): void {
  setSelectedExerciseId(id);
  const allExercises = getAllExercises();
  const exercise = allExercises.find((ex) => ex.id === id);

  if (!exercise) return;

  const state = completionState[id];
  const isCompleted = !!state;

  const modalImage = document.getElementById("modal-image") as HTMLImageElement;
  if (modalImage) modalImage.src = exercise.image;
  const modalTitle = document.getElementById("modal-title");
  if (modalTitle) modalTitle.textContent = exercise.name;
  const modalMuscle = document.getElementById("modal-muscle");
  if (modalMuscle) modalMuscle.textContent = exercise.muscle;
  const modalDifficulty = document.getElementById("modal-difficulty");
  if (modalDifficulty) modalDifficulty.textContent = exercise.difficulty;
  const modalDescription = document.getElementById("modal-description");
  if (modalDescription) modalDescription.textContent = exercise.description;
  const modalSets = document.getElementById("modal-sets");
  if (modalSets) modalSets.textContent = exercise.sets;

  const modalInstructions = document.getElementById("modal-instructions");
  if (modalInstructions) {
    modalInstructions.innerHTML = exercise.instructions
      .map((i) => `<li>${escapeHtml(i)}</li>`)
      .join("");
  }

  const checkinBtn = document.getElementById("modal-checkin-btn");
  if (checkinBtn) {
    checkinBtn.textContent = isCompleted ? t('exercise.check_mark') : t('exercise.check_pending');
    checkinBtn.className = isCompleted ? "btn-completed" : "";
  }
  const checkinDate = document.getElementById("checkin-date");
  if (checkinDate) {
    checkinDate.textContent = state ? t('exercise.checkin_date', formatDate(state.date)) : "";
  }

  const lastSessionContainer = document.getElementById(
    "modal-last-session-container",
  );
  if (lastSessionContainer) {
    const logs = exerciseLogs[id] || [];
    const lastSets = getLastSessionSets(logs);
    if (lastSets.length > 0) {
      lastSessionContainer.style.display = "flex";
      const setsStr = lastSets
        .map((s) => `${s.weight}кг x ${s.reps}`)
        .join(", ");
      lastSessionContainer.innerHTML = `
        <span>${t('exercise.last_session', String(lastSets.length), setsStr)}</span>
        <button class="btn-copy-last" id="btn-copy-last-modal">${t('exercise.copy_last')}</button>
      `;
      const copyBtn = document.getElementById("btn-copy-last-modal");
      if (copyBtn) {
        copyBtn.onclick = () => {
          if (!exerciseLogs[id]) exerciseLogs[id] = [];
          const now = new Date().toISOString();
          lastSets.forEach((s) => {
            exerciseLogs[id].push({
              date: now,
              weight: s.weight,
              reps: s.reps,
            });
          });
          saveState();
          renderExerciseSetsLog(id);
          updateStats();
          showToast(t('toast.sets_copied'), "success");
          vibrate(50);
          lastSessionContainer.style.display = "none";
        };
      }
    } else {
      lastSessionContainer.style.display = "none";
    }
  }

  renderExerciseSetsLog(id);
  const modal = document.getElementById("exercise-modal");
  if (modal) modal.style.display = "flex";
  const chartWrapper = document.getElementById("progression-chart-wrapper");
  if (chartWrapper) chartWrapper.style.display = "none";
}

function closeModal(): void {
  const modal = document.getElementById("exercise-modal");
  if (modal) modal.style.display = "none";
  setSelectedExerciseId(null);
}

function updateModalState(): void {
  if (!selectedExerciseId) return;
  openModal(selectedExerciseId);
}

function toggleFromModal(): void {
  if (selectedExerciseId) {
    toggleExercise(selectedExerciseId);
  }
}

function renderExerciseSetsLog(id: string | number): void {
  const logContainer = document.getElementById("exercise-sets-log");
  if (!logContainer) return;
  const logs = exerciseLogs[id] || [];
  const today = getDateKey(new Date());

  const todaySets = logs.filter(
    (l) => getDateKey(new Date(l.date)) === today,
  );

  let max1RM = 0;
  if (todaySets.length > 0) {
    max1RM = Math.max(...todaySets.map((s) => calculate1RM(s.weight, s.reps)));
  }

  logContainer.innerHTML =
    todaySets.length > 0
      ? `
            <div style="margin-bottom:10px; color:var(--success); font-weight:bold; font-size:0.9rem;">
                ${t('exercise.best_1rm_today', String(max1RM))}
            </div>
            ${todaySets
              .map((s, i) => {
                const oneRM = calculate1RM(s.weight, s.reps);
                return `
                    <div class="exercise-set-item">
                        <span>${t('exercise.set_n', String(i + 1))} <small style="color:#888;">${t('exercise.set_1rm', String(oneRM))}</small></span>
                        <span>${t('exercise.set_detail', String(s.weight), String(s.reps))}</span>
                    </div>
                `;
              })
              .join("")}
        `
      : `<p style="color:var(--text-secondary); font-size:0.8rem;">${t('exercise.no_sets_today')}</p>`;
}

function logSet(): void {
  if (!selectedExerciseId) return;
  if (logSetDebounceTimer) return;
  logSetDebounceTimer = setTimeout(() => { logSetDebounceTimer = null; }, 400);

  const weightInput = document.getElementById("set-weight") as HTMLInputElement;
  const repsInput = document.getElementById("set-reps") as HTMLInputElement;
  if (!weightInput || !repsInput) return;

  const weight = parseFloat(weightInput.value);
  const reps = parseInt(repsInput.value);

  if (isNaN(weight) || isNaN(reps)) {
    showToast(t('toast.enter_weight_reps'), "warning");
    return;
  }

  if (weight <= 0 || reps <= 0) {
    showToast(t('toast.weight_reps_positive'), "warning");
    return;
  }

  if (!exerciseLogs[selectedExerciseId]) exerciseLogs[selectedExerciseId] = [];

  exerciseLogs[selectedExerciseId].push({
    date: new Date().toISOString(),
    weight,
    reps,
  });

  saveState();
  renderExerciseSetsLog(selectedExerciseId);
  updateStats();
  vibrate(30);

  weightInput.value = "";
  repsInput.value = "";

  const isSmartTimer = (
    document.getElementById("smart-timer-toggle") as HTMLInputElement
  )?.checked;
  if (isSmartTimer) {
    openTimerModal();
    startTimer();
  }
}

function toggleProgressionChart(): void {
  const wrapper = document.getElementById("progression-chart-wrapper");
  const btn = document.querySelector(".btn-toggle-chart") as HTMLElement;

  if (!wrapper || !btn) return;

  if (wrapper.style.display === "none") {
    wrapper.style.display = "block";
    btn.textContent = t('exercise.hide_progress');
    if (selectedExerciseId) renderProgressionChart(selectedExerciseId);
  } else {
    wrapper.style.display = "none";
    btn.textContent = t('exercise.show_progress');
  }
}

function renderProgressionChart(id: string | number): void {
  const canvas = document.getElementById(
    "progression-chart",
  ) as HTMLCanvasElement | null;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const logs = exerciseLogs[id] || [];
  if (logs.length === 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return;
  }

  if (progressionChart) progressionChart.destroy();

  const metricSelect = document.getElementById(
    "progression-metric",
  ) as HTMLSelectElement | null;
  const metric = metricSelect?.value || "weight";

  // Group logs by date to compute metric per day
  const entries: Record<string, number> = {};

  // Group logs by standard YYYY-MM-DD date key
  const groupedByDate: Record<string, typeof logs> = {};
  logs.forEach((l) => {
    const dateObj = new Date(l.date);
    const d = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`;
    if (!groupedByDate[d]) groupedByDate[d] = [];
    groupedByDate[d].push(l);
  });

  Object.keys(groupedByDate).forEach((d) => {
    const dayLogs = groupedByDate[d];
    if (metric === "weight") {
      // Maximum weight lifted on that day
      entries[d] = Math.max(...dayLogs.map((l) => l.weight));
    } else if (metric === "1rm") {
      // Maximum estimated 1RM on that day
      entries[d] = Math.max(
        ...dayLogs.map((l) => calculate1RM(l.weight, l.reps)),
      );
    } else if (metric === "volume") {
      // Total volume (weight * reps) lifted on that day
      entries[d] = dayLogs.reduce((sum, l) => sum + l.weight * l.reps, 0);
    }
  });

  const sortedKeys = Object.keys(entries)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    .slice(-7);

  const datasets = sortedKeys.map((key) => entries[key]);
  const labels = sortedKeys.map((key) => {
    const parts = key.split("-");
    return `${parts[2]}.${parts[1]}`;
  });

  let labelText = t('exercise.chart_label_weight');
  let borderColor = "#28a745";
  let backgroundColor = "rgba(40, 167, 69, 0.15)";

  if (metric === "1rm") {
    labelText = t('exercise.chart_label_1rm');
    borderColor = "#ffc107";
    backgroundColor = "rgba(255, 193, 7, 0.15)";
  } else if (metric === "volume") {
    labelText = t('exercise.chart_label_volume');
    borderColor = "#00d4ff";
    backgroundColor = "rgba(0, 212, 255, 0.15)";
  }

  progressionChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: labelText,
          data: datasets,
          borderColor,
          backgroundColor,
          tension: 0.2,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { grid: { color: "rgba(255,255,255,0.05)" } },
        x: { grid: { display: false } },
      },
    },
  });
}

function renderHistory(): void {
  const historyList = document.getElementById("history-list");
  if (!historyList) return;
  const period =
    (document.getElementById("history-period") as HTMLSelectElement)?.value ||
    "all";

  const workouts = getWorkoutHistory(period);

  if (workouts.length === 0) {
    if (historyChartInstance) {
      historyChartInstance.destroy();
      historyChartInstance = null;
    }
    if (muscleChartInstance) {
      muscleChartInstance.destroy();
      muscleChartInstance = null;
    }
    historyList.innerHTML =
      `<div class="history-item"><p>${t('history.empty')}</p></div>`;
    return;
  }

  const page = parseInt(historyList.dataset.page || "1");
  const perPage = 20;
  const start = (page - 1) * perPage;
  const end = start + perPage;
  const pageWorkouts = workouts.slice(start, end);

  renderHistoryTableView(pageWorkouts);

  if (workouts.length > perPage) {
    const totalPages = Math.ceil(workouts.length / perPage);
    const nav = document.createElement("div");
    nav.style.display = "flex";
    nav.style.justifyContent = "center";
    nav.style.gap = "10px";
    nav.style.marginTop = "20px";
    nav.className = "history-pagination";
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.textContent = String(i);
      btn.style.padding = "8px 14px";
      btn.style.border = "none";
      btn.style.borderRadius = "6px";
      btn.style.cursor = "pointer";
      btn.style.background = i === page ? "var(--accent)" : "var(--card-bg)";
      btn.style.color = "var(--text-primary)";
      btn.style.fontWeight = i === page ? "bold" : "normal";
      btn.addEventListener("click", () => {
        historyList.dataset.page = String(i);
        renderHistory();
      });
      nav.appendChild(btn);
    }
    const existingNav = historyList.querySelector(".history-pagination");
    if (existingNav) existingNav.remove();
    historyList.appendChild(nav);
  }

  renderHistoryChart(workouts);
  renderMuscleDistributionChart(workouts);
}

function filterHistory(): void {
  const historyList = document.getElementById("history-list");
  if (historyList) historyList.dataset.page = "1";
  renderHistory();
}

function renderHistoryChart(workouts: { date: string; count: number }[]): void {
  const canvas = document.getElementById(
    "history-chart",
  ) as HTMLCanvasElement | null;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  if (historyChartInstance) {
    historyChartInstance.destroy();
    historyChartInstance = null;
  }

  if (workouts.length === 0) return;

  const last7 = workouts.slice(0, 7).reverse();

  historyChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: last7.map((w) => {
        const d = new Date(w.date);
        return `${d.getDate()}.${d.getMonth() + 1}`;
      }),
      datasets: [
        {
          label: t('history.exercises_done'),
          data: last7.map((w) => w.count),
          backgroundColor: "rgba(0, 212, 255, 0.2)",
          borderColor: "#00d4ff",
          borderWidth: 2,
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          },
          grid: {
            color: "rgba(255, 255, 255, 0.05)",
          },
        },
        x: {
          grid: {
            display: false,
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  });
}

function renderMuscleDistributionChart(
  workouts: { date: string; count: number; exercises: (string | number)[] }[],
): void {
  const canvas = document.getElementById(
    "muscle-distribution-chart",
  ) as HTMLCanvasElement | null;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  if (muscleChartInstance) {
    muscleChartInstance.destroy();
    muscleChartInstance = null;
  }

  if (workouts.length === 0) return;

  const allEx = getAllExercises();
  const muscleCounts: Record<string, number> = {};

  workouts.forEach((w) => {
    w.exercises.forEach((exId) => {
      const ex = allEx.find((e) => e.id === exId);
      if (ex) {
        const group = ex.muscleGroup || ex.muscle || t('muscle_group.other');
        muscleCounts[group] = (muscleCounts[group] || 0) + 1;
      }
    });
  });

  const labels = Object.keys(muscleCounts);
  const data = Object.values(muscleCounts);

  if (labels.length === 0) return;

  const colorMap: Record<string, string> = {
    Груди: "#00d4ff",
    Спина: "#ff007f",
    Ноги: "#28a745",
    Плечі: "#ffc107",
    Руки: "#fd7e14",
    Прес: "#e83e8c",
    Трицепс: "#20c997",
    Біцепс: "#6f42c1",
    Сідниці: "#dc3545",
    Кардіо: "#17a2b8",
  };

  const backgroundColors = labels.map(
    (label) => colorMap[label] || `hsl(${Math.random() * 360}, 75%, 60%)`,
  );

  muscleChartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: backgroundColors,
          borderWidth: 2,
          borderColor: "var(--card-bg, #1a1a2e)",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "var(--text-primary, #ffffff)",
            font: {
              size: 11,
            },
            padding: 15,
          },
        },
        tooltip: {
          callbacks: {
            label: function (context: { chart: ChartJS; raw: unknown; dataset: { data: number[] }; label: string }) {
              const value = context.raw as number;
              const total = (context.dataset.data as number[]).reduce(
                (a, b) => a + b,
                0,
              );
              const percentage = Math.round((value / total) * 100);
              return ` ${context.label}: ${value} (${percentage}%)`;
            },
          },
        },
      },
      cutout: "60%",
    },
  });
}

// ---- Heatmap moved to renderers/heatmap.ts ----

function renderPlans(): void {
  const container = document.getElementById("plans-list");
  if (!container) return;

  if (workoutPlans.length === 0) {
    container.innerHTML =
      `<div class="plan-card"><h3>${t('plans.none')}</h3><p>${t('plans.none_desc')}</p></div>`;
    return;
  }

  const allEx = getAllExercises();

  container.innerHTML = workoutPlans
    .map((plan, planIndex) => {
      const exerciseNames: { id: number | string; name: string }[] =
        plan.exercises
          .map((id) => {
            const ex = allEx.find((e) => e.id === id);
            return ex ? { id, name: ex.name } : null;
          })
          .filter(
            (n): n is { id: number | string; name: string } => n !== null,
          );

      return `
            <div class="plan-card">
                <h3>${escapeHtml(plan.name)}</h3>
                <div class="plan-card-exercises">
                    ${exerciseNames
                      .slice(0, 5)
                      .map(
                        (ex) =>
                          `<span class="plan-exercise-mini">${escapeHtml(ex.name)}</span>`,
                      )
                      .join("")}
                    ${exerciseNames.length > 5 ? `<span class="plan-exercise-mini">+${exerciseNames.length - 5}</span>` : ""}
                </div>
                <div class="plan-card-actions">
                    <button class="btn-start-plan" data-plan-index="${planIndex}">${t('plans.start')}</button>
                    <button class="btn-delete-plan" data-plan-index="${planIndex}">${t('plans.delete')}</button>
                </div>
            </div>
        `;
    })
    .join("");
}

function openPlanModal(): void {
  const modal = document.getElementById("plan-modal");
  if (modal) modal.style.display = "flex";
  const nameInput = document.getElementById("plan-name") as HTMLInputElement;
  if (nameInput) nameInput.value = "";

  const allEx = getAllExercises();
  const container = document.getElementById("plan-exercises-select");

  if (container) {
    container.innerHTML = allEx
      .map(
        (ex) => `
        <label class="plan-exercise-option" data-plan-check="${ex.id}">
            <input type="checkbox" value="${ex.id}">
            <span>${escapeHtml(ex.name)} (${escapeHtml(ex.muscle)})</span>
        </label>
    `,
      )
      .join("");
  }
}

function closePlanModal(): void {
  const modal = document.getElementById("plan-modal");
  if (modal) modal.style.display = "none";
}

function toggleExerciseOption(element: HTMLElement): void {
  element.classList.toggle("selected");
}

function savePlan(): void {
  const nameInput = document.getElementById("plan-name") as HTMLInputElement;
  const name = (nameInput?.value || "").trim();
  if (!name) {
    showToast(t('toast.enter_plan_name'), "warning");
    return;
  }

  const selected = document.querySelectorAll(
    "#plan-exercises-select input:checked",
  );
  const exerciseIds = Array.from(selected).map((cb) => {
    const val = (cb as HTMLInputElement).value;
    const num = parseInt(val);
    return isNaN(num) ? val : num;
  });

  if (exerciseIds.length === 0) {
    showToast(t('toast.select_exercise'), "warning");
    return;
  }

  celebration();

  workoutPlans.push({
    id: Date.now(),
    name,
    exercises: exerciseIds,
  });

  savePlans();
  renderPlans();
  closePlanModal();
}

function deletePlan(index: number): void {
  if (confirm(t('confirm.delete_plan'))) {
    workoutPlans.splice(index, 1);
    savePlans();
    renderPlans();
  }
}

function startWorkout(planIndex: number): void {
  const plan = workoutPlans[planIndex];
  if (!plan) return;

  const planExIds = plan.exercises;
  if (!planExIds.length) {
    showToast(t('toast.plan_no_exercises'), "warning");
    return;
  }

  setSelectedExerciseId(planExIds[0]);
  openModal(planExIds[0]);

  const modalContent = document.querySelector(".modal-content");
  if (!modalContent) return;

  const existing = modalContent.querySelector(".workout-progress");
  if (existing) existing.remove();

  const planInfo = document.createElement("div");
  planInfo.className = "workout-progress";
  planInfo.innerHTML = `
        <p style="margin: 10px 20px; color: #00d4ff;">${t('plans.workout_progress', escapeHtml(plan.name), String(planExIds.length))}</p>
    `;

  modalContent.insertBefore(
    planInfo,
    modalContent.querySelector(".modal-checkin"),
  );
}

function finishWorkout(): void {
  const completedCount = Object.keys(completionState).length;
  if (completedCount === 0) {
    showToast(t('toast.no_completed_exercises'), "warning");
    return;
  }

  if (confirm(t('confirm.finish_workout', String(completedCount)))) {
    const today = getDateKey(new Date());
    const archive = localStorage.getItem("completionArchive");
    const archiveData: Record<string, Record<string, CompletionEntry>> = archive
      ? (safeJSONParse(archive, {}) as Record<
          string,
          Record<string, CompletionEntry>
        >)
      : {};

    archiveData[today] = {
      ...(archiveData[today] || {}),
      ...Object.keys(completionState).reduce<Record<string, CompletionEntry>>(
        (acc, k) => {
          acc[k] = completionState[k];
          return acc;
        },
        {},
      ),
    };
    localStorage.setItem("completionArchive", JSON.stringify(archiveData));

    resetCompletionState();
    saveState();
    updateStats();
    renderMuscleGroups();
    renderExercises();

    celebration();
    showToast(t('toast.workout_saved'), "success");

    const completedDays = Object.keys(archiveData).length;
    if (completedDays % 10 === 0) {
      showToast(
        t('toast.workout_milestone', String(completedDays)),
        "info",
        6000,
      );
    }
  }
}

function resetProgress(): void {
  if (confirm(t('confirm.reset_progress'))) {
    resetCompletionState();
    saveState();
    updateStats();
    renderMuscleGroups();
    renderExercises();
    closeModal();
  }
}

function toggleDropdown(): void {
  const dropdown = document.getElementById("header-dropdown");
  if (dropdown) {
    dropdown.classList.toggle("show");
  }
  vibrate(20);
}

function initTheme(): void {
  const saved = localStorage.getItem("theme");
  const toggle = document.getElementById("theme-toggle");

  if (saved === "light") {
    document.body.classList.add("light-theme");
    if (toggle) toggle.textContent = "☀️";
  }

  if (toggle) {
    toggle.addEventListener("click", () => {
      document.body.classList.toggle("light-theme");
      const isLight = document.body.classList.contains("light-theme");
      localStorage.setItem("theme", isLight ? "light" : "dark");
      toggle.textContent = isLight ? "☀️" : "🌙";
      vibrate(30);
    });
  }
}

// ---- Plates moved to plates.ts ----

function switchTab(tabId: string): void {
  setSelectedMuscleGroup(null);

  document
    .querySelectorAll(".nav-item")
    .forEach((btn) => btn.classList.remove("active"));
  const activeBtn = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
  if (activeBtn) activeBtn.classList.add("active");

  const mainLayout = document.querySelector(".main-layout") as HTMLElement;
  const historySection = document.getElementById("history-section");
  const plansSection = document.getElementById("plans-section");
  const bodySection = document.getElementById("body-section");
  const logbookSection = document.getElementById("logbook-section");

  const sections: (HTMLElement | null)[] = [
    mainLayout,
    historySection,
    plansSection,
    bodySection,
    logbookSection,
  ];

  if (muscleChartInstance) { muscleChartInstance.destroy(); muscleChartInstance = null; }
  if (historyChartInstance) { historyChartInstance.destroy(); historyChartInstance = null; }
  destroyBodyChart();

  sections.forEach((s) => {
    if (s) s.style.display = "none";
  });

  if (tabId === "exercises") {
    if (mainLayout) mainLayout.style.display = "flex";
    renderMuscleGroups();
    renderExercises();
  } else if (tabId === "history") {
    if (historySection) historySection.style.display = "block";
    renderHistory();
    renderHeatmap();
  } else if (tabId === "plans") {
    if (plansSection) plansSection.style.display = "block";
    renderPlans();
  } else if (tabId === "body") {
    if (bodySection) bodySection.style.display = "block";
    renderBodyStats();
    renderWaterTracker();
    loadCalorieParams();
  } else if (tabId === "logbook") {
    if (logbookSection) logbookSection.style.display = "block";
    LogbookModule.loadSelect();
  }

  if (tabId === "exercises" || tabId === "logbook") requestWakeLock();
  else releaseWakeLock();

  window.scrollTo({ top: 0, behavior: "smooth" });
  vibrate(20);
}

function switchLogbookTab(tabId: string): void {
  const tabLog = document.getElementById("logbook-tab-log");
  const tabHistory = document.getElementById("logbook-tab-history");
  const viewLog = document.getElementById("logbook-view-log");
  const viewHistory = document.getElementById("logbook-view-history");

  if (tabLog) tabLog.classList.remove("active");
  if (tabHistory) tabHistory.classList.remove("active");
  if (viewLog) viewLog.style.display = "none";
  if (viewHistory) viewHistory.style.display = "none";

  const targetTab = document.getElementById("logbook-tab-" + tabId);
  const targetView = document.getElementById("logbook-view-" + tabId);
  if (targetTab) targetTab.classList.add("active");
  if (targetView) targetView.style.display = "block";

  if (tabId === "history") {
    LogbookModule.renderHistory();
  }
}

function openCustomExerciseModal(): void {
  const modal = document.getElementById("custom-exercise-modal");
  if (modal) modal.style.display = "flex";
}

function closeCustomExerciseModal(): void {
  const modal = document.getElementById("custom-exercise-modal");
  if (modal) modal.style.display = "none";
}

function saveCustomExercise(): void {
  const nameInput = document.getElementById("ce-name") as HTMLInputElement;
  const muscleInput = document.getElementById("ce-muscle") as HTMLSelectElement;
  const descInput = document.getElementById("ce-desc") as HTMLTextAreaElement;

  const name = (nameInput?.value || "").trim();
  const muscleGroup = muscleInput?.value || "Груди";
  const description = (descInput?.value || "").trim();

  if (!name) {
    showToast(t('toast.enter_exercise_name'), "warning");
    return;
  }

  const newEx: Exercise = {
    id: Date.now(),
    name,
    muscle: muscleGroup,
    muscleGroup: muscleGroup,
    difficulty: "Середній",
    description: description,
    instructions: [t('custom_exercise.default_instructions')],
    sets: "3 x 10",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=300&auto=format&fit=crop",
  };

  customExercises.push(newEx);
  mergeCustomExercises();
  saveState();
  renderExercises();
  closeCustomExerciseModal();
  celebration();
}

function initKeyboardShortcuts(): void {
  document.addEventListener("keydown", (e) => {
    const tag = (e.target as HTMLElement).tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

    const modal = document.getElementById("exercise-modal");
    const modalVisible = modal?.style.display === "flex";

    if (e.key === "Escape") {
      if (modalVisible) closeModal();
      return;
    }

    if (e.altKey && ["1", "2", "3", "4", "5"].includes(e.key)) {
      e.preventDefault();
      const tabs: Record<string, string> = {
        "1": "exercises",
        "2": "logbook",
        "3": "history",
        "4": "plans",
        "5": "body",
      };
      switchTab(tabs[e.key]);
      return;
    }

    if (!modalVisible) return;

    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      logSet();
    }
    if (e.key === "t" || e.key === "T") {
      e.preventDefault();
      openTimerModal();
      startTimer();
    }
  });
}

function renderHistoryTableView(workouts: { date: string; count: number; exercises: (string | number)[] }[]): void {
  const historyList = document.getElementById("history-list");
  if (!historyList) return;
  const isDesktop = window.innerWidth > 900;

  const allEx = getAllExercises();

  historyList.innerHTML = isDesktop
    ? `<div class="history-table-wrapper"><table class="history-table">
        <thead>
          <tr>
            <th>${t('history.table_date')}</th>
            <th>${t('history.table_exercises')}</th>
            <th>${t('history.table_count')}</th>
            <th>${t('history.table_volume')}</th>
          </tr>
        </thead>
        <tbody>
          ${workouts.map((w) => {
            const exerciseNames = w.exercises
              .map((id) => {
                const ex = allEx.find((e) => e.id === id);
                return ex ? ex.name : "";
              })
              .filter((n) => n)
              .join(", ");

            let sessionVolume = 0;
            w.exercises.forEach((exId) => {
              const logs = exerciseLogs[exId] || [];
              logs.forEach((s) => {
                if (getDateKey(new Date(s.date)) === getDateKey(new Date(w.date))) {
                  sessionVolume += (s.weight || 0) * (s.reps || 0);
                }
              });
            });

            return `<tr>
              <td data-label="${t('history.table_date')}">${formatDate(w.date)}</td>
              <td data-label="${t('history.table_exercises')}">${escapeHtml(exerciseNames.substring(0, 80))}${exerciseNames.length > 80 ? "..." : ""}</td>
              <td data-label="${t('history.table_count')}"><span class="history-item-count">${w.count}</span></td>
              <td data-label="${t('history.table_volume')}">${sessionVolume} кг</td>
            </tr>`;
          }).join("")}
        </tbody>
      </table></div>`
    : workouts.map((w) => {
        const exerciseNames = w.exercises
          .map((id) => {
            const ex = allEx.find((e) => e.id === id);
            return ex ? ex.name : "";
          })
          .filter((n) => n)
          .join(", ");

        let sessionVolume = 0;
        w.exercises.forEach((exId) => {
          const logs = exerciseLogs[exId] || [];
          logs.forEach((s) => {
            if (getDateKey(new Date(s.date)) === getDateKey(new Date(w.date))) {
              sessionVolume += (s.weight || 0) * (s.reps || 0);
            }
          });
        });

        return `
          <div class="history-item">
            <div>
              <div class="history-item-date">${formatDate(w.date)}</div>
              <div class="history-item-exercises">${escapeHtml(exerciseNames.substring(0, 100))}${exerciseNames.length > 100 ? "..." : ""}</div>
            </div>
            <div style="text-align:right;">
              <div class="history-item-count">${w.count} ${t('history.exercises_label')}</div>
              <div style="font-size:0.8rem; color:var(--success);">${sessionVolume} кг</div>
            </div>
          </div>
        `;
      })
      .join("");
}

function initUISubscriptions(): void {
  document
    .getElementById("progression-metric")
    ?.addEventListener("change", () => {
      if (selectedExerciseId) renderProgressionChart(selectedExerciseId);
    });

  // Calculator modal tabs listeners
  document
    .getElementById("btn-calc-tab-plate")
    ?.addEventListener("click", () => switchCalcTab("plate"));
  document
    .getElementById("btn-calc-tab-1rm")
    ?.addEventListener("click", () => switchCalcTab("1rm"));

  // 1RM calculator input change listeners
  const calc1rmWeight = document.getElementById("calc-1rm-weight");
  const calc1rmReps = document.getElementById("calc-1rm-reps");

  const triggerCalculation = () => {
    calculate1RMSplits();
  };
  calc1rmWeight?.addEventListener("input", triggerCalculation);
  calc1rmReps?.addEventListener("input", triggerCalculation);

  // Initialize smart timer toggle state on startup
  const smartTimerToggle = document.getElementById("smart-timer-toggle") as HTMLInputElement | null;
  if (smartTimerToggle) {
    smartTimerToggle.checked = localStorage.getItem("gym_smart_timer") !== "false";
  }

  // Exercise search
  const searchInput = document.getElementById("exercise-search") as HTMLInputElement | null;
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => setSearchQuery(searchInput.value), 200);
    });
  }

  // Keyboard shortcuts
  initKeyboardShortcuts();
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initUISubscriptions);
  } else {
    initUISubscriptions();
  }
}

export {
  updateStats,
  renderMuscleGroups,
  filterByGroup,
  renderExercises,
  openModal,
  closeModal,
  toggleExercise,
  toggleFromModal,
  updateModalState,
  renderExerciseSetsLog,
  logSet,
  toggleProgressionChart,
  renderProgressionChart,
  renderHistory,
  filterHistory,
  renderHistoryChart,
  renderHeatmap,
  renderPlans,
  openPlanModal,
  closePlanModal,
  toggleExerciseOption,
  savePlan,
  deletePlan,
  startWorkout,
  finishWorkout,
  resetProgress,
  toggleDropdown,
  initTheme,
  switchTab,
  switchLogbookTab,
  openCustomExerciseModal,
  closeCustomExerciseModal,
  saveCustomExercise,
  calculatePlates,
  openPlateModal,
  closePlateModal,
  calculate1RMSplits,
  switchCalcTab,
};
