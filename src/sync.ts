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
  encryptLocalData,
  decryptLocalData,
} from "./data.js";
import { vibrate, safeJSONParse, calculate1RM, showToast, getEncryptionPassphrase, setEncryptionPassphrase, clearEncryptionPassphrase } from "./utils.js";
import { renderMuscleGroups, renderExercises, renderPlans, updateStats } from "./ui.js";
import type { CompletionEntry, Exercise, WorkoutPlan, LogEntry, BodyWeightEntry } from "./types.js";

const TOKEN_KEY = "gym_github_token";
const GIST_KEY = "gym_gist_id";

function getStoredToken(): string | null {
  const raw = localStorage.getItem(TOKEN_KEY);
  return raw || null;
}

function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

function getStoredGistId(): string | null {
  return localStorage.getItem(GIST_KEY);
}

function setStoredGistId(id: string): void {
  localStorage.setItem(GIST_KEY, id);
}

function openSettingsModal(): void {
  const modal = document.getElementById("settings-modal");
  if (modal) modal.style.display = "flex";
  const tokenInput = document.getElementById("github-token") as HTMLInputElement;
  const gistInput = document.getElementById("gist-id") as HTMLInputElement;
  if (tokenInput) tokenInput.value = getStoredToken() || "";
  if (gistInput) gistInput.value = getStoredGistId() || "";
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

function closeSettingsModal(): void {
  const modal = document.getElementById("settings-modal");
  if (modal) modal.style.display = "none";
}

async function saveSettings(): Promise<void> {
  const tokenInput = document.getElementById("github-token") as HTMLInputElement;
  const token = (tokenInput?.value || "").trim();
  const gistInput = document.getElementById("gist-id") as HTMLInputElement;
  const gistId = (gistInput?.value || "").trim();

  if (token) setStoredToken(token);
  if (gistId) setStoredGistId(gistId);

  const encryptToggle = document.getElementById("encrypt-toggle") as HTMLInputElement | null;
  const encryptInput = document.getElementById("encrypt-passphrase") as HTMLInputElement | null;
  if (encryptToggle?.checked) {
    const passphrase = encryptInput?.value;
    if (!passphrase || passphrase.length < 8 || passphrase === "********") {
      showToast("Введіть пароль (мінімум 8 символів)", "warning");
      return;
    }
    setEncryptionPassphrase(passphrase);
    await encryptLocalData(passphrase);
    showToast("🔒 Дані зашифровано!", "success");
  } else {
    if (getEncryptionPassphrase()) {
      const passphrase = getEncryptionPassphrase()!;
      const ok = await decryptLocalData(passphrase);
      if (!ok) {
        showToast("Помилка розшифрування — неправильний пароль?", "error");
        return;
      }
    }
    clearEncryptionPassphrase();
    showToast("🔓 Шифрування вимкнено", "info");
  }

  showToast("Налаштування збережено!", "success");
  vibrate(50);
}

async function syncToCloud(): Promise<void> {
  const token = getStoredToken();
  const gistId = getStoredGistId();

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
      const result = await response.json() as { id?: string };
      if (!gistId && result.id) {
        setStoredGistId(result.id);
        const gistInput = document.getElementById("gist-id") as HTMLInputElement;
        if (gistInput) gistInput.value = result.id;
      }
      showToast("Синхронізація успішна! ✅", "success");
      vibrate([50, 100, 50]);
    } else {
      const err = await response.json().catch(() => ({})) as { message?: string };
      showToast("Помилка синхронізації: " + (err.message || `HTTP ${response.status}`), "error");
    }
  } catch (e: unknown) {
    const err = e as { message: string };
    showToast("Помилка мережі: " + err.message, "error");
  }
}

async function fetchFromCloud(): Promise<void> {
  const token = getStoredToken();
  const gistId = getStoredGistId();

  if (!token || !gistId) {
    showToast("Налаштуйте Token та Gist ID для імпорту", "warning");
    return;
  }

  try {
    const response = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: { Authorization: `token ${token}` },
    });

    if (response.ok) {
      const result = await response.json() as { files?: Record<string, { content: string }> };
      if (!result.files?.["gym-data.json"]) {
        showToast("Gist не містить файлу gym-data.json", "warning");
        return;
      }
      const content = result.files["gym-data.json"].content;
      const data = safeJSONParse(content, {}) as {
        completionState?: Record<string, CompletionEntry>;
        workoutPlans?: WorkoutPlan[];
        exerciseLogs?: Record<string, LogEntry[]>;
        bodyWeightHistory?: BodyWeightEntry[];
        customExercises?: Exercise[];
      };

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
  } catch (e: unknown) {
    const err = e as { message: string };
    showToast("Помилка мережі: " + err.message, "error");
  }
}

function exportData(): void {
  const data = {
    version: 3,
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

function importData(event: Event): void {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const result = (e.target as FileReader).result as string;
      const data = safeJSONParse(result, {}) as {
        completionState?: Record<string, CompletionEntry>;
        workoutPlans?: WorkoutPlan[];
        exerciseLogs?: Record<string, LogEntry[]>;
        bodyWeightHistory?: BodyWeightEntry[];
        customExercises?: Exercise[];
      };

      if (
        !confirm(
          "Це перезапише всі ваші локальні дані. Продовжити?"
        )
      ) {
        return;
      }

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
    } catch (_err) {
      showToast("Помилка при читанні файлу. Перевірте формат.", "error");
    }
  };
  reader.readAsText(file);
  target.value = "";
}

function exportToCSV(): void {
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
