import { loadState, loadPlans, pruneOldLogs, loadEncryptedOnStartup } from "./data.js";
import { updateStats, renderMuscleGroups, renderExercises, filterByGroup, openModal, closeModal, toggleExercise, toggleFromModal, logSet, toggleProgressionChart, finishWorkout, resetProgress, toggleDropdown, initTheme, openPlateModal, closePlateModal, calculatePlates, switchTab, switchLogbookTab, openCustomExerciseModal, closeCustomExerciseModal, saveCustomExercise, renderPlans, openPlanModal, closePlanModal, savePlan, deletePlan, startWorkout, renderHistory, filterHistory, toggleExerciseOption, } from "./ui.js";
import { openTimerModal, closeTimerModal, setTimer, startTimer, pauseTimer, resetTimer, } from "./timer.js";
import { openSettingsModal, closeSettingsModal, saveSettings, syncToCloud, fetchFromCloud, exportData, importData, exportToCSV, } from "./sync.js";
import { saveBodyWeight } from "./stats.js";
import { requestNotifications } from "./utils.js";
import LogbookModule from "./logbook.js";
function init() {
    loadState();
    loadPlans();
    loadEncryptedOnStartup();
    pruneOldLogs(365);
    updateStats();
    renderMuscleGroups();
    renderExercises();
    initTheme();
    requestNotifications();
    LogbookModule.init();
    // --- Header ---
    byId("header-timer-btn")?.addEventListener("click", openTimerModal);
    const dd = byId("header-dropdown");
    if (dd) {
        dd.querySelector("[data-action='plate']")?.addEventListener("click", openPlateModal);
        dd.querySelector("[data-action='export']")?.addEventListener("click", exportData);
        dd.querySelector("[data-action='settings']")?.addEventListener("click", openSettingsModal);
        dd.querySelector("[data-action='reset']")?.addEventListener("click", resetProgress);
        dd.querySelector("input[type='file']")?.addEventListener("change", importData);
    }
    // Close dropdown on outside click
    document.addEventListener("click", (e) => {
        if (!e.target.closest(".dropdown")) {
            document.querySelectorAll(".dropdown-content.show").forEach((el) => el.classList.remove("show"));
        }
    });
    document.querySelector(".btn-settings")?.addEventListener("click", toggleDropdown);
    byId("finish-workout-btn")?.addEventListener("click", finishWorkout);
    // --- Bottom Nav ---
    document.querySelectorAll(".nav-item").forEach((btn) => {
        btn.addEventListener("click", () => {
            const tabId = btn.dataset.tab;
            if (tabId)
                switchTab(tabId);
        });
    });
    // --- Sidebar ---
    document.getElementById("muscle-groups")?.addEventListener("click", (e) => {
        const group = e.target.closest("[data-muscle-id]");
        if (group) {
            filterByGroup(group.dataset.muscleId);
        }
    });
    // --- Exercises Grid (event delegation) ---
    document.getElementById("exercises-list")?.addEventListener("click", (e) => {
        const card = e.target.closest(".exercise-card");
        const checkBtn = e.target.closest(".check-btn");
        if (checkBtn) {
            e.stopPropagation();
            toggleExercise(parseInt(checkBtn.dataset.checkId));
        }
        else if (card) {
            openModal(parseInt(card.dataset.exId));
        }
    });
    // --- Exercise Modal ---
    byId("exercise-modal").addEventListener("click", (e) => {
        if (e.target.id === "exercise-modal")
            closeModal();
    });
    byId("modal-close-btn")?.addEventListener("click", closeModal);
    byId("modal-checkin-btn")?.addEventListener("click", toggleFromModal);
    byId("set-log-btn")?.addEventListener("click", logSet);
    byId("progression-toggle-btn")?.addEventListener("click", toggleProgressionChart);
    // --- Timer Modal ---
    byId("timer-modal").addEventListener("click", (e) => {
        if (e.target.id === "timer-modal")
            closeTimerModal();
    });
    byId("timer-modal-close")?.addEventListener("click", closeTimerModal);
    byId("timer-start-btn")?.addEventListener("click", startTimer);
    byId("timer-pause-btn")?.addEventListener("click", pauseTimer);
    byId("timer-reset-btn")?.addEventListener("click", resetTimer);
    // Timer presets
    document.querySelectorAll(".timer-preset").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            setTimer(parseInt(btn.dataset.seconds), e);
        });
    });
    // --- Plans Modal ---
    byId("plan-modal-close")?.addEventListener("click", closePlanModal);
    // --- Plans ---
    byId("plans-list")?.addEventListener("click", (e) => {
        const startBtn = e.target.closest(".btn-start-plan");
        const delBtn = e.target.closest(".btn-delete-plan");
        if (startBtn)
            startWorkout(parseInt(startBtn.dataset.planIndex));
        if (delBtn)
            deletePlan(parseInt(delBtn.dataset.planIndex));
    });
    byId("plan-modal").addEventListener("click", (e) => {
        if (e.target.id === "plan-modal")
            closePlanModal();
    });
    byId("plan-exercises-select")?.addEventListener("click", (e) => {
        const option = e.target.closest("[data-plan-check]");
        if (option) {
            option.classList.toggle("selected");
        }
    });
    byId("plan-save-btn")?.addEventListener("click", savePlan);
    // --- Plate Modal ---
    byId("plate-modal").addEventListener("click", (e) => {
        if (e.target.id === "plate-modal")
            closePlateModal();
    });
    byId("plate-modal-close")?.addEventListener("click", closePlateModal);
    byId("plate-weight-input")?.addEventListener("input", calculatePlates);
    // --- Settings Modal ---
    byId("settings-modal").addEventListener("click", (e) => {
        if (e.target.id === "settings-modal")
            closeSettingsModal();
    });
    byId("settings-modal-close")?.addEventListener("click", closeSettingsModal);
    // --- Custom Exercise Modal ---
    byId("custom-exercise-modal").addEventListener("click", (e) => {
        if (e.target.id === "custom-exercise-modal")
            closeCustomExerciseModal();
    });
    byId("custom-ex-modal-close")?.addEventListener("click", closeCustomExerciseModal);
    // Syncing
    document.querySelector("[data-action='save-settings']")?.addEventListener("click", saveSettings);
    document.querySelector("[data-action='sync-upload']")?.addEventListener("click", syncToCloud);
    document.querySelector("[data-action='sync-download']")?.addEventListener("click", fetchFromCloud);
    document.querySelector("[data-action='export-csv']")?.addEventListener("click", exportToCSV);
    // Custom exercise form
    document.querySelector("[data-action='save-custom-ex']")?.addEventListener("click", saveCustomExercise);
    document.querySelector("[data-action='save-body-weight']")?.addEventListener("click", saveBodyWeight);
    // Plans page
    document.querySelector("[data-action='add-plan']")?.addEventListener("click", openPlanModal);
    // History
    byId("history-period")?.addEventListener("change", filterHistory);
    // Custom exercise button
    byId("open-custom-ex-btn")?.addEventListener("click", openCustomExerciseModal);
    // Logbook tabs
    document.querySelectorAll("[data-logbook-tab]").forEach((btn) => {
        btn.addEventListener("click", () => {
            switchLogbookTab(btn.dataset.logbookTab);
        });
    });
    // Create custom exercise from logbook
    document.querySelector("[data-action='create-logbook-ex']")?.addEventListener("click", () => {
        LogbookModule.createExercise();
    });
    // Register Service Worker
    if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
            navigator.serviceWorker
                .register("./sw.js")
                .then((registration) => {
                console.log("SW registered:", registration.scope);
                registration.addEventListener("updatefound", () => {
                    const installingWorker = registration.installing;
                    if (!installingWorker)
                        return;
                    installingWorker.addEventListener("statechange", () => {
                        if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
                            const banner = document.getElementById("update-banner");
                            if (banner)
                                banner.classList.remove("hidden");
                        }
                    });
                });
            })
                .catch((error) => {
                console.log("SW registration failed:", error);
            });
        });
        navigator.serviceWorker.addEventListener("controllerchange", () => {
            window.location.reload();
        });
        document.getElementById("update-btn")?.addEventListener("click", () => {
            navigator.serviceWorker.getRegistration().then((r) => r?.waiting?.postMessage("SKIP_WAITING"));
        });
        document.getElementById("update-dismiss-btn")?.addEventListener("click", () => {
            const banner = document.getElementById("update-banner");
            if (banner)
                banner.classList.add("hidden");
        });
    }
    // Online / Offline indicator
    const offlineIndicator = document.getElementById("offline-indicator");
    function updateOnlineStatus() {
        if (!offlineIndicator)
            return;
        offlineIndicator.classList.toggle("hidden", navigator.onLine);
    }
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    updateOnlineStatus();
    // Wake Lock on visibility change
    document.addEventListener("visibilitychange", async () => {
        const activeTab = document.querySelector(".nav-item.active")?.dataset.tab;
        if (document.visibilityState === "visible" && (activeTab === "exercises" || activeTab === "logbook")) {
            const { requestWakeLock } = await import("./utils.js");
            requestWakeLock();
        }
        else {
            const { releaseWakeLock } = await import("./utils.js");
            releaseWakeLock();
        }
    });
    console.log("GymProgress initialized ✅");
}
function byId(id) {
    const el = document.getElementById(id);
    if (!el)
        console.warn(`Element #${id} not found`);
    return el;
}
// Expose for inline onclick compatibility (some may still exist)
window.filterByGroup = filterByGroup;
window.openModal = openModal;
window.toggleExercise = toggleExercise;
window.closeModal = closeModal;
window.toggleFromModal = toggleFromModal;
window.logSet = logSet;
window.toggleProgressionChart = toggleProgressionChart;
window.finishWorkout = finishWorkout;
window.resetProgress = resetProgress;
window.toggleDropdown = toggleDropdown;
window.openPlateModal = openPlateModal;
window.closePlateModal = closePlateModal;
window.calculatePlates = calculatePlates;
window.switchTab = switchTab;
window.switchLogbookTab = switchLogbookTab;
window.openCustomExerciseModal = openCustomExerciseModal;
window.closeCustomExerciseModal = closeCustomExerciseModal;
window.saveCustomExercise = saveCustomExercise;
window.openTimerModal = openTimerModal;
window.closeTimerModal = closeTimerModal;
window.setTimer = setTimer;
window.startTimer = startTimer;
window.pauseTimer = pauseTimer;
window.resetTimer = resetTimer;
window.openSettingsModal = openSettingsModal;
window.closeSettingsModal = closeSettingsModal;
window.saveSettings = saveSettings;
window.syncToCloud = syncToCloud;
window.fetchFromCloud = fetchFromCloud;
window.exportData = exportData;
window.importData = importData;
window.exportToCSV = exportToCSV;
window.saveBodyWeight = saveBodyWeight;
window.filterHistory = filterHistory;
window.openPlanModal = openPlanModal;
window.closePlanModal = closePlanModal;
window.toggleExerciseOption = toggleExerciseOption;
window.savePlan = savePlan;
window.deletePlan = deletePlan;
window.startWorkout = startWorkout;
window.renderHistory = renderHistory;
window.renderPlans = renderPlans;
// Legacy compatibility (for any remaining inline events)
window.LogbookModule = LogbookModule;
window.createLogbookCustomExercise = () => LogbookModule.createExercise();
window.loadLogbookSelect = () => LogbookModule.loadSelect();
window.renderLogbookSets = () => LogbookModule.renderSets();
// Wait for DOM
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
}
else {
    init();
}
