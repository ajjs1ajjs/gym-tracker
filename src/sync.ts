import {
  completionState,
  exerciseLogs,
  bodyWeightHistory,
  customExercises,
  workoutPlans,
  getAllExercises,
  mergeCustomExercises,
  saveState,
  savePlans,
} from "./data.js";
import { vibrate, safeJSONParse, calculate1RM, showToast, getEncryptionPassphrase, setEncryptionPassphrase, clearEncryptionPassphrase } from "./utils.js";
import { renderMuscleGroups, renderExercises, renderPlans, updateStats } from "./ui.js";

function openSettingsModal() {
  const modal = document.getElementById("settings-modal");
  if (modal) modal.style.display = "flex";
  const tokenInput = document.getElementById("github-token");
  const gistInput = document.getElementById("gist-id");
  if (tokenInput) tokenInput.value = localStorage.getItem("gym_github_token") || "";
  if (gistInput) gistInput.value = localStorage.getItem("gym_gist_id") || "";
  const encryptToggle = document.getElementById("encrypt-toggle") as HTMLInputElement | null;
  const encryptInput = document.getElementById("encrypt-passphrase") as HTMLInputElement | null;
  const hasPassphrase = !!getEncryptionPassphrase();
  if (encryptToggle) {
    encryptToggle.checked = hasPassphrase;
    encryptToggle.onchange = () => {
      if (encryptInput) encryptInput.disabled = !encryptToggle.checked;
    };
  }
  if (encryptInput) {
    encryptInput.disabled = !hasPassphrase;
    encryptInput.value = hasPassphrase ? "********" : "";
  }
}

function closeSettingsModal() {
  const modal = document.getElementById("settings-modal");
  if (modal) modal.style.display = "none";
}

function saveSettings() {
  const token = document.getElementById("github-token")?.value.trim();
  const gistId = document.getElementById("gist-id")?.value.trim();

  if (token) localStorage.setItem("gym_github_token", token);
  if (gistId) localStorage.setItem("gym_gist_id", gistId);

  const encryptToggle = document.getElementById("encrypt-toggle") as HTMLInputElement | null;
  const encryptInput = document.getElementById("encrypt-passphrase") as HTMLInputElement | null;
  if (encryptToggle?.checked && encryptInput?.value && encryptInput.value !== "********") {
    if (encryptInput.value.length < 8) {
      showToast("Пароль має бути щонайменше 8 символів", "warning");
      return;
    }
    setEncryptionPassphrase(encryptInput.value);
    showToast("🔒 Шифрування увімкнено", "success");
  } else if (!encryptToggle?.checked) {
    clearEncryptionPassphrase();
    showToast("🔓 Шифрування вимкнено", "info");
  }

  showToast("Налаштування збережено!", "success");
  vibrate(50);
}

async function syncToCloud() {
  const token = localStorage.getItem("gym_github_token");
  const gistId = localStorage.getItem("gym_gist_id");

  if (!token) {
    showToast("Будь ласка, введіть GitHub Token у налаштуваннях", "warning");
    openSettingsModal();
    return;
  }

  const data = {
    completionState,
    workoutPlans,
    exerciseLogs,
    bodyWeightHistory,
    customExercises,
    lastSync: new Date().toISOString(),
  };

  const body = {
    description: "Gym Tracker Backup",
    public: false,
    files: {
      "gym-data.json": {
        content: JSON.stringify(data, null, 2),
      },
    },
  };

  try {
    const url = gistId
      ? `https://api.github.com/gists/${gistId}`
      : "https://api.github.com/gists";
    const method = gistId ? "PATCH" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      const result = await response.json();
      if (!gistId) {
        localStorage.setItem("gym_gist_id", result.id);
        const gistInput = document.getElementById("gist-id");
        if (gistInput) gistInput.value = result.id;
      }
      showToast("Синхронізація успішна! ✅", "success");
      vibrate([50, 100, 50]);
    } else {
      const err = await response.json().catch(() => ({}));
      showToast("Помилка синхронізації: " + (err.message || `HTTP ${response.status}`), "error");
    }
  } catch (e) {
    showToast("Помилка мережі: " + e.message, "error");
  }
}

async function fetchFromCloud() {
  const token = localStorage.getItem("gym_github_token");
  const gistId = localStorage.getItem("gym_gist_id");

  if (!token || !gistId) {
      showToast("Налаштуйте Token та Gist ID для імпорту", "warning");
    return;
  }

  try {
    const response = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: { Authorization: `token ${token}` },
    });

    if (response.ok) {
      const result = await response.json();
      const content = result.files["gym-data.json"].content;
      const data = safeJSONParse(content, {});

      if (confirm("Дані завантажено. Перезаписати поточний прогрес?")) {
        Object.assign(completionState, data.completionState || {});
        workoutPlans.length = 0;
        workoutPlans.push(...(data.workoutPlans || []));
        Object.keys(exerciseLogs).forEach((k) => delete exerciseLogs[k]);
        Object.assign(exerciseLogs, data.exerciseLogs || {});
        bodyWeightHistory.length = 0;
        bodyWeightHistory.push(...(data.bodyWeightHistory || []));
        customExercises.length = 0;
        customExercises.push(...(data.customExercises || []));

        mergeCustomExercises();
        saveState();
        savePlans();
        updateStats();
        renderMuscleGroups();
        renderExercises();
        showToast("Дані оновлено!", "success");
        vibrate([300, 100, 300]);
      }
    } else {
      showToast("Не вдалося завантажити дані (HTTP " + response.status + ")", "error");
    }
  } catch (e) {
    showToast("Помилка мережі: " + e.message, "error");
  }
}

function exportData() {
  const data = {
    version: 2,
    exportDate: new Date().toISOString(),
    completionState,
    workoutPlans,
    exerciseLogs,
    bodyWeightHistory,
    customExercises,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `gym-tracker-full-${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = safeJSONParse(e.target.result, {});
      Object.assign(completionState, data.completionState || {});
      workoutPlans.length = 0;
      workoutPlans.push(...(data.workoutPlans || []));
      Object.keys(exerciseLogs).forEach((k) => delete exerciseLogs[k]);
      Object.assign(exerciseLogs, data.exerciseLogs || {});
      bodyWeightHistory.length = 0;
      bodyWeightHistory.push(...(data.bodyWeightHistory || []));
      customExercises.length = 0;
      customExercises.push(...(data.customExercises || []));

      mergeCustomExercises();
      saveState();
      savePlans();
      updateStats();
      renderMuscleGroups();
      renderExercises();
      renderPlans();
      showToast("Дані успішно імпортовано!", "success");
    } catch (err) {
      showToast("Помилка при читанні файлу. Перевірте формат.", "error");
    }
  };
  reader.readAsText(file);
  event.target.value = "";
}

function exportToCSV() {
  let csv = "Дата,Вправа,Група,Вага,Повтори,1RM\n";
  const allEx = getAllExercises();

  Object.keys(exerciseLogs).forEach((id) => {
    const ex = allEx.find((e) => String(e.id) === String(id));
    const name = ex ? ex.name : "Вправа " + id;
    const group = ex ? ex.muscle : "-";

    exerciseLogs[id].forEach((s) => {
      const date = new Date(s.date).toLocaleDateString();
      const oneRM = calculate1RM(s.weight, s.reps);
      csv += `${date},"${name}",${group},${s.weight},${s.reps},${oneRM}\n`;
    });
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `gym_data_${new Date().toISOString().split("T")[0]}.csv`,
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export {
  openSettingsModal,
  closeSettingsModal,
  saveSettings,
  syncToCloud,
  fetchFromCloud,
  exportData,
  importData,
  exportToCSV,
};
