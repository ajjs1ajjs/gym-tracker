import { trainingData, completionState, exerciseLogs, customExercises, selectedMuscleGroup, selectedExerciseId, getAllExercises, saveState, savePlans, workoutPlans, getWorkoutHistory, mergeCustomExercises, resetCompletionState, markExerciseComplete, unmarkExerciseComplete, setSelectedMuscleGroup, setSelectedExerciseId, } from "./data.js";
import { formatDate, calculate1RM, vibrate, celebration, requestWakeLock, releaseWakeLock, diffClass, safeJSONParse, showToast, escapeHtml, } from "./utils.js";
import { openTimerModal, startTimer } from "./timer.js";
import { renderBodyStats } from "./stats.js";
import LogbookModule from "./logbook.js";
let progressionChart = null;
function updateStats() {
    const allExercises = getAllExercises();
    const total = allExercises.length;
    let completed = 0;
    const workoutDates = new Set();
    let totalVolume = 0;
    allExercises.forEach((ex) => {
        if (completionState[ex.id]) {
            completed++;
            if (completionState[ex.id].date) {
                workoutDates.add(new Date(completionState[ex.id].date).toDateString());
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
    if (progressEl)
        progressEl.textContent = percent + "%";
    if (fillEl)
        fillEl.style.width = percent + "%";
    const completedEl = document.getElementById("completed-exercises");
    if (completedEl)
        completedEl.textContent = String(completed);
    const workoutsEl = document.getElementById("total-workouts");
    if (workoutsEl)
        workoutsEl.textContent = String(workoutDates.size);
    const volumeEl = document.getElementById("total-volume");
    if (volumeEl) {
        volumeEl.textContent =
            totalVolume > 1000
                ? (totalVolume / 1000).toFixed(1) + "т"
                : totalVolume + "кг";
    }
}
function renderMuscleGroups() {
    const container = document.getElementById("muscle-groups");
    if (!container)
        return;
    container.innerHTML = trainingData
        .map((group) => {
        const groupExercises = group.exercises.length;
        let groupCompleted = 0;
        group.exercises.forEach((ex) => {
            if (completionState[ex.id])
                groupCompleted++;
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
function filterByGroup(groupId) {
    setSelectedMuscleGroup(selectedMuscleGroup === groupId ? null : groupId);
    renderMuscleGroups();
    renderExercises();
}
function renderExercises() {
    const container = document.getElementById("exercises-list");
    if (!container)
        return;
    const filteredGroups = selectedMuscleGroup
        ? trainingData.filter((g) => g.id === selectedMuscleGroup)
        : trainingData;
    container.innerHTML = filteredGroups
        .map((group) => `
        <div class="exercise-group">
            <h2 class="group-title">${escapeHtml(group.icon)} ${escapeHtml(group.name)}</h2>
            <div class="exercises-grid">
                ${group.exercises
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
                                ${state ? `<p class="completed-date">Виконано: ${formatDate(state.date)}</p>` : ""}
                                <button class="check-btn ${isCompleted ? "checked" : ""}" data-check-id="${ex.id}">
                                    ${isCompleted ? "✓ Виконано" : "○ Відмітити"}
                                </button>
                            </div>
                        </div>
                    `;
    })
        .join("")}
            </div>
        </div>
    `)
        .join("");
}
function toggleExercise(id) {
    const allExercises = getAllExercises();
    const exercise = allExercises.find((ex) => ex.id === id);
    if (completionState[id]) {
        unmarkExerciseComplete(id);
    }
    else {
        markExerciseComplete(id, new Date().toISOString(), exercise ? exercise.name : "");
    }
    saveState();
    updateStats();
    renderMuscleGroups();
    renderExercises();
    updateModalState();
    if (completionState[id]) {
        vibrate(80);
        const group = trainingData.find((g) => g.exercises.some((ex) => ex.id === id));
        if (group && group.exercises.every((ex) => completionState[ex.id])) {
            celebration();
        }
    }
}
function openModal(id) {
    setSelectedExerciseId(id);
    const allExercises = getAllExercises();
    const exercise = allExercises.find((ex) => ex.id === id);
    if (!exercise)
        return;
    const state = completionState[id];
    const isCompleted = !!state;
    const modalImage = document.getElementById("modal-image");
    if (modalImage)
        modalImage.src = exercise.image;
    const modalTitle = document.getElementById("modal-title");
    if (modalTitle)
        modalTitle.textContent = exercise.name;
    const modalMuscle = document.getElementById("modal-muscle");
    if (modalMuscle)
        modalMuscle.textContent = exercise.muscle;
    const modalDifficulty = document.getElementById("modal-difficulty");
    if (modalDifficulty)
        modalDifficulty.textContent = exercise.difficulty;
    const modalDescription = document.getElementById("modal-description");
    if (modalDescription)
        modalDescription.textContent = exercise.description;
    const modalSets = document.getElementById("modal-sets");
    if (modalSets)
        modalSets.textContent = exercise.sets;
    const modalInstructions = document.getElementById("modal-instructions");
    if (modalInstructions) {
        modalInstructions.innerHTML = exercise.instructions.map((i) => `<li>${escapeHtml(i)}</li>`).join("");
    }
    const checkinBtn = document.getElementById("modal-checkin-btn");
    if (checkinBtn) {
        checkinBtn.textContent = isCompleted ? "✓ Виконано" : "○ Відмітити";
        checkinBtn.className = isCompleted ? "btn-completed" : "";
    }
    const checkinDate = document.getElementById("checkin-date");
    if (checkinDate) {
        checkinDate.textContent = state ? `Дата: ${formatDate(state.date)}` : "";
    }
    renderExerciseSetsLog(id);
    const modal = document.getElementById("exercise-modal");
    if (modal)
        modal.style.display = "flex";
    const chartWrapper = document.getElementById("progression-chart-wrapper");
    if (chartWrapper)
        chartWrapper.style.display = "none";
}
function closeModal() {
    const modal = document.getElementById("exercise-modal");
    if (modal)
        modal.style.display = "none";
    setSelectedExerciseId(null);
}
function updateModalState() {
    if (!selectedExerciseId)
        return;
    openModal(selectedExerciseId);
}
function toggleFromModal() {
    if (selectedExerciseId) {
        toggleExercise(selectedExerciseId);
    }
}
function renderExerciseSetsLog(id) {
    const logContainer = document.getElementById("exercise-sets-log");
    if (!logContainer)
        return;
    const logs = exerciseLogs[id] || [];
    const today = new Date().toDateString();
    const todaySets = logs.filter((l) => new Date(l.date).toDateString() === today);
    let max1RM = 0;
    if (todaySets.length > 0) {
        max1RM = Math.max(...todaySets.map((s) => calculate1RM(s.weight, s.reps)));
    }
    logContainer.innerHTML =
        todaySets.length > 0
            ? `
            <div style="margin-bottom:10px; color:var(--success); font-weight:bold; font-size:0.9rem;">
                🏆 Кращий 1RM сьогодні: ${max1RM}кг
            </div>
            ${todaySets
                .map((s, i) => {
                const oneRM = calculate1RM(s.weight, s.reps);
                return `
                    <div class="exercise-set-item">
                        <span>Підхід ${i + 1} <small style="color:#888;">(1RM: ${oneRM}кг)</small></span>
                        <span>${s.weight} кг x ${s.reps}</span>
                    </div>
                `;
            })
                .join("")}
        `
            : '<p style="color:var(--text-secondary); font-size:0.8rem;">Підходів за сьогодні немає</p>';
}
function logSet() {
    if (!selectedExerciseId)
        return;
    const weightInput = document.getElementById("set-weight");
    const repsInput = document.getElementById("set-reps");
    if (!weightInput || !repsInput)
        return;
    const weight = parseFloat(weightInput.value);
    const reps = parseInt(repsInput.value);
    if (isNaN(weight) || isNaN(reps)) {
        showToast("Введіть вагу та повтори", "warning");
        return;
    }
    if (weight <= 0 || reps <= 0) {
        showToast("Вага та повтори мають бути більше 0", "warning");
        return;
    }
    if (!exerciseLogs[selectedExerciseId])
        exerciseLogs[selectedExerciseId] = [];
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
    const isSmartTimer = document.getElementById("smart-timer-toggle")?.checked;
    if (isSmartTimer) {
        openTimerModal();
        startTimer();
    }
}
function toggleProgressionChart() {
    const wrapper = document.getElementById("progression-chart-wrapper");
    const btn = document.querySelector(".btn-toggle-chart");
    if (!wrapper || !btn)
        return;
    if (wrapper.style.display === "none") {
        wrapper.style.display = "block";
        btn.textContent = "▲ Сховати прогрес";
        if (selectedExerciseId)
            renderProgressionChart(selectedExerciseId);
    }
    else {
        wrapper.style.display = "none";
        btn.textContent = "📈 Показати прогрес";
    }
}
function renderProgressionChart(id) {
    const canvas = document.getElementById("progression-chart");
    if (!canvas)
        return;
    const ctx = canvas.getContext("2d");
    if (!ctx)
        return;
    const logs = exerciseLogs[id] || [];
    if (logs.length === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }
    if (progressionChart)
        progressionChart.destroy();
    const entries = {};
    logs.forEach((l) => {
        const d = new Date(l.date).toLocaleDateString();
        if (!entries[d] || l.weight > entries[d])
            entries[d] = l.weight;
    });
    const labels = Object.keys(entries).slice(-7);
    const datasets = labels.map((l) => entries[l]);
    progressionChart = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "Максимальна вага (кг)",
                    data: datasets,
                    borderColor: "#28a745",
                    tension: 0.1,
                    fill: false,
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
function renderHistory() {
    const historyList = document.getElementById("history-list");
    if (!historyList)
        return;
    const period = document.getElementById("history-period")?.value || "all";
    const workouts = getWorkoutHistory(period);
    if (workouts.length === 0) {
        historyList.innerHTML =
            '<div class="history-item"><p>Історія тренувань порожня</p></div>';
        return;
    }
    const allEx = getAllExercises();
    const page = parseInt(historyList.dataset.page || "1");
    const perPage = 20;
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const pageWorkouts = workouts.slice(start, end);
    historyList.innerHTML = pageWorkouts
        .map((w) => {
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
                if (new Date(s.date).toDateString() === new Date(w.date).toDateString()) {
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
                    <div class="history-item-count">${w.count} вправ</div>
                    <div style="font-size:0.8rem; color:var(--success);">${sessionVolume} кг</div>
                </div>
            </div>
        `;
    })
        .join("");
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
        if (existingNav)
            existingNav.remove();
        historyList.appendChild(nav);
    }
    renderHistoryChart(workouts);
}
function filterHistory() {
    const historyList = document.getElementById("history-list");
    if (historyList)
        historyList.dataset.page = "1";
    renderHistory();
}
function renderHistoryChart(workouts) {
    const canvas = document.getElementById("history-chart");
    if (!canvas)
        return;
    const ctx = canvas.getContext("2d");
    if (!ctx)
        return;
    const container = canvas.parentElement;
    const containerWidth = container?.clientWidth ?? 0;
    canvas.width = containerWidth;
    canvas.height = 200;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (workouts.length === 0)
        return;
    const last7 = workouts.slice(0, 7).reverse();
    const maxCount = Math.max(...last7.map((w) => w.count || 1));
    const barWidth = (canvas.width - 40) / Math.max(last7.length, 1);
    const scale = (canvas.height - 40) / Math.max(maxCount, 1);
    last7.forEach((w, i) => {
        const x = 20 + i * barWidth;
        const height = (w.count || 0) * scale;
        const y = canvas.height - 20 - height;
        ctx.fillStyle = "#00d4ff";
        ctx.fillRect(x, y, barWidth - 10, height);
        ctx.fillStyle = "#888";
        ctx.font = "11px sans-serif";
        ctx.textAlign = "center";
        const date = new Date(w.date);
        ctx.fillText(`${date.getDate()}.${date.getMonth() + 1}`, x + (barWidth - 10) / 2, canvas.height - 5);
        ctx.fillStyle = "#fff";
        ctx.fillText(String(w.count), x + (barWidth - 10) / 2, y - 5);
    });
}
function renderHeatmap() {
    const container = document.getElementById("activity-heatmap");
    if (!container)
        return;
    const activity = {};
    Object.values(completionState).forEach((val) => {
        if (val.date) {
            const d = new Date(val.date).toDateString();
            activity[d] = (activity[d] || 0) + 1;
        }
    });
    const now = new Date();
    const days = [];
    for (let i = 364; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dayStr = d.toDateString();
        const count = activity[dayStr] || 0;
        let level = 0;
        if (count > 0)
            level = 1;
        if (count > 3)
            level = 2;
        if (count > 6)
            level = 3;
        if (count > 9)
            level = 4;
        days.push(`<div class="heatmap-day level-${level}" title="${d.toLocaleDateString()}: ${count} вправ"></div>`);
    }
    container.innerHTML = days.join("");
}
function renderPlans() {
    const container = document.getElementById("plans-list");
    if (!container)
        return;
    if (workoutPlans.length === 0) {
        container.innerHTML =
            '<div class="plan-card"><h3>Немає планів</h3><p>Створіть свій перший план тренувань!</p></div>';
        return;
    }
    const allEx = getAllExercises();
    container.innerHTML = workoutPlans
        .map((plan, planIndex) => {
        const exerciseNames = plan.exercises
            .map((id) => {
            const ex = allEx.find((e) => e.id === id);
            return ex ? { id, name: ex.name } : null;
        })
            .filter((n) => n !== null);
        return `
            <div class="plan-card">
                <h3>${escapeHtml(plan.name)}</h3>
                <div class="plan-card-exercises">
                    ${exerciseNames
            .slice(0, 5)
            .map((ex) => `<span class="plan-exercise-mini">${escapeHtml(ex.name)}</span>`)
            .join("")}
                    ${exerciseNames.length > 5 ? `<span class="plan-exercise-mini">+${exerciseNames.length - 5}</span>` : ""}
                </div>
                <div class="plan-card-actions">
                    <button class="btn-start-plan" data-plan-index="${planIndex}">▶ Почати тренування</button>
                    <button class="btn-delete-plan" data-plan-index="${planIndex}">🗑 Видалити</button>
                </div>
            </div>
        `;
    })
        .join("");
}
function openPlanModal() {
    const modal = document.getElementById("plan-modal");
    if (modal)
        modal.style.display = "flex";
    const nameInput = document.getElementById("plan-name");
    if (nameInput)
        nameInput.value = "";
    const allEx = getAllExercises();
    const container = document.getElementById("plan-exercises-select");
    if (container) {
        container.innerHTML = allEx
            .map((ex) => `
        <label class="plan-exercise-option" data-plan-check="${ex.id}">
            <input type="checkbox" value="${ex.id}">
            <span>${escapeHtml(ex.name)} (${escapeHtml(ex.muscle)})</span>
        </label>
    `)
            .join("");
    }
}
function closePlanModal() {
    const modal = document.getElementById("plan-modal");
    if (modal)
        modal.style.display = "none";
}
function toggleExerciseOption(element) {
    element.classList.toggle("selected");
}
function savePlan() {
    const nameInput = document.getElementById("plan-name");
    const name = (nameInput?.value || "").trim();
    if (!name) {
        showToast("Введіть назву плану", "warning");
        return;
    }
    const selected = document.querySelectorAll("#plan-exercises-select input:checked");
    const exerciseIds = Array.from(selected).map((cb) => parseInt(cb.value));
    if (exerciseIds.length === 0) {
        showToast("Оберіть хоча б одну вправу", "warning");
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
function deletePlan(index) {
    if (confirm("Видалити цей план?")) {
        workoutPlans.splice(index, 1);
        savePlans();
        renderPlans();
    }
}
function startWorkout(planIndex) {
    const plan = workoutPlans[planIndex];
    if (!plan)
        return;
    const planExIds = plan.exercises;
    if (!planExIds.length) {
        showToast("План не містить вправ", "warning");
        return;
    }
    setSelectedExerciseId(planExIds[0]);
    openModal(planExIds[0]);
    const planInfo = document.createElement("div");
    planInfo.className = "workout-progress";
    planInfo.innerHTML = `
        <p style="margin: 10px 20px; color: #00d4ff;">План: ${escapeHtml(plan.name)} (${planExIds.length} вправ)</p>
    `;
    const modalContent = document.querySelector(".modal-content");
    if (modalContent) {
        modalContent.insertBefore(planInfo, modalContent.querySelector(".modal-checkin"));
    }
}
function finishWorkout() {
    const completedCount = Object.keys(completionState).length;
    if (completedCount === 0) {
        showToast("Ви ще не відмітили жодної вправи сьогодні!", "warning");
        return;
    }
    if (confirm(`Завершити тренування? Ви виконали ${completedCount} вправ.`)) {
        const today = new Date().toDateString();
        const archive = localStorage.getItem("completionArchive");
        const archiveData = archive ? safeJSONParse(archive, {}) : {};
        archiveData[today] = {
            ...(archiveData[today] || {}),
            ...Object.keys(completionState).reduce((acc, k) => {
                acc[k] = completionState[k];
                return acc;
            }, {}),
        };
        localStorage.setItem("completionArchive", JSON.stringify(archiveData));
        resetCompletionState();
        saveState();
        updateStats();
        renderMuscleGroups();
        renderExercises();
        celebration();
        showToast("Тренування збережено в історію! Гарна робота! 💪", "success");
        const completedDays = Object.keys(archiveData).length;
        if (completedDays % 10 === 0) {
            showToast(`💾 Виконано ${completedDays} тренувань! Зробіть експорт.`, "info", 6000);
        }
    }
}
function resetProgress() {
    if (confirm("Скинути весь прогрес? Цю дію не можна відновити.")) {
        resetCompletionState();
        saveState();
        updateStats();
        renderMuscleGroups();
        renderExercises();
        closeModal();
    }
}
function toggleDropdown() {
    const dropdown = document.getElementById("header-dropdown");
    if (dropdown) {
        dropdown.classList.toggle("show");
    }
    vibrate(20);
}
function initTheme() {
    const saved = localStorage.getItem("theme");
    const toggle = document.getElementById("theme-toggle");
    if (saved === "light") {
        document.body.classList.add("light-theme");
        if (toggle)
            toggle.textContent = "☀️";
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
function calculatePlates() {
    const weightInput = document.getElementById("plate-weight-input");
    const totalWeight = weightInput ? parseFloat(weightInput.value) || 0 : 0;
    const barWeight = 20;
    let weightToDistribute = (totalWeight - barWeight) / 2;
    if (weightToDistribute < 0)
        weightToDistribute = 0;
    const availablePlates = [25, 20, 15, 10, 5, 2.5, 1.25];
    const result = [];
    let temp = weightToDistribute;
    availablePlates.forEach((p) => {
        const count = Math.floor(temp / p);
        if (count > 0) {
            for (let i = 0; i < count; i++)
                result.push(p);
            temp %= p;
        }
    });
    const visualizer = document.getElementById("plate-visualizer");
    if (visualizer) {
        visualizer.innerHTML = `
        <div class="barbell">
            <div class="plates-stack">
                ${result.map((p) => `<div class="plate p${String(p).replace(".", "_")}" title="${p}kg">${p}</div>`).join("")}
            </div>
        </div>
    `;
    }
    const resultsArea = document.getElementById("plate-results");
    if (resultsArea) {
        resultsArea.innerHTML =
            result.length > 0
                ? `<p>З кожного боку: ${result.join("kg, ")}kg</p>`
                : `<p>Тільки гриф (20кг)</p>`;
    }
}
function openPlateModal() {
    const modal = document.getElementById("plate-modal");
    if (modal)
        modal.style.display = "flex";
    calculatePlates();
}
function closePlateModal() {
    const modal = document.getElementById("plate-modal");
    if (modal)
        modal.style.display = "none";
}
function switchTab(tabId) {
    setSelectedMuscleGroup(null);
    document
        .querySelectorAll(".nav-item")
        .forEach((btn) => btn.classList.remove("active"));
    const activeBtn = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
    if (activeBtn)
        activeBtn.classList.add("active");
    const mainLayout = document.querySelector(".main-layout");
    const historySection = document.getElementById("history-section");
    const plansSection = document.getElementById("plans-section");
    const bodySection = document.getElementById("body-section");
    const logbookSection = document.getElementById("logbook-section");
    const sections = [
        mainLayout,
        historySection,
        plansSection,
        bodySection,
        logbookSection,
    ];
    sections.forEach((s) => {
        if (s)
            s.style.display = "none";
    });
    if (tabId === "exercises") {
        if (mainLayout)
            mainLayout.style.display = "flex";
        renderMuscleGroups();
        renderExercises();
    }
    else if (tabId === "history") {
        if (historySection)
            historySection.style.display = "block";
        renderHistory();
        renderHeatmap();
    }
    else if (tabId === "plans") {
        if (plansSection)
            plansSection.style.display = "block";
        renderPlans();
    }
    else if (tabId === "body") {
        if (bodySection)
            bodySection.style.display = "block";
        renderBodyStats();
    }
    else if (tabId === "logbook") {
        if (logbookSection)
            logbookSection.style.display = "block";
        LogbookModule.loadSelect();
    }
    if (tabId === "exercises" || tabId === "logbook")
        requestWakeLock();
    else
        releaseWakeLock();
    window.scrollTo({ top: 0, behavior: "smooth" });
    vibrate(20);
}
function switchLogbookTab(tabId) {
    const tabLog = document.getElementById("logbook-tab-log");
    const tabHistory = document.getElementById("logbook-tab-history");
    const viewLog = document.getElementById("logbook-view-log");
    const viewHistory = document.getElementById("logbook-view-history");
    if (tabLog)
        tabLog.classList.remove("active");
    if (tabHistory)
        tabHistory.classList.remove("active");
    if (viewLog)
        viewLog.style.display = "none";
    if (viewHistory)
        viewHistory.style.display = "none";
    const targetTab = document.getElementById("logbook-tab-" + tabId);
    const targetView = document.getElementById("logbook-view-" + tabId);
    if (targetTab)
        targetTab.classList.add("active");
    if (targetView)
        targetView.style.display = "block";
    if (tabId === "history") {
        LogbookModule.renderHistory();
    }
}
function openCustomExerciseModal() {
    const modal = document.getElementById("custom-exercise-modal");
    if (modal)
        modal.style.display = "flex";
}
function closeCustomExerciseModal() {
    const modal = document.getElementById("custom-exercise-modal");
    if (modal)
        modal.style.display = "none";
}
function saveCustomExercise() {
    const nameInput = document.getElementById("ce-name");
    const muscleInput = document.getElementById("ce-muscle");
    const descInput = document.getElementById("ce-desc");
    const name = (nameInput?.value || "").trim();
    const muscleGroup = muscleInput?.value || "Груди";
    const description = (descInput?.value || "").trim();
    if (!name) {
        showToast("Введіть назву вправи", "warning");
        return;
    }
    const newEx = {
        id: Date.now(),
        name,
        muscle: muscleGroup,
        muscleGroup: muscleGroup,
        difficulty: "Середній",
        description: description,
        instructions: ["Користувацька вправа"],
        sets: "3 x 10",
        image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=300&auto=format&fit=crop",
    };
    customExercises.push(newEx);
    mergeCustomExercises();
    saveState();
    renderExercises();
    closeCustomExerciseModal();
    celebration();
}
export { updateStats, renderMuscleGroups, filterByGroup, renderExercises, openModal, closeModal, toggleExercise, toggleFromModal, updateModalState, renderExerciseSetsLog, logSet, toggleProgressionChart, renderProgressionChart, renderHistory, filterHistory, renderHistoryChart, renderHeatmap, renderPlans, openPlanModal, closePlanModal, toggleExerciseOption, savePlan, deletePlan, startWorkout, finishWorkout, resetProgress, toggleDropdown, initTheme, calculatePlates, openPlateModal, closePlateModal, switchTab, switchLogbookTab, openCustomExerciseModal, closeCustomExerciseModal, saveCustomExercise, };
