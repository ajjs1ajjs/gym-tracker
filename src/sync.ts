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
import { t } from "./i18n.js";
import {
  vibrate,
  safeJSONParse,
  calculate1RM,
  showToast,
  getEncryptionPassphrase,
  setEncryptionPassphrase,
  clearEncryptionPassphrase,
} from "./utils.js";
import { isEncrypted } from "./data.js";
import {
  renderMuscleGroups,
  renderExercises,
  renderPlans,
  updateStats,
} from "./ui.js";
import type {
  CompletionEntry,
  Exercise,
  WorkoutPlan,
  LogEntry,
  BodyWeightEntry,
} from "./types.js";

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
  const tokenInput = document.getElementById(
    "github-token",
  ) as HTMLInputElement;
  const gistInput = document.getElementById("gist-id") as HTMLInputElement;
  if (tokenInput) tokenInput.value = getStoredToken() || "";
  if (gistInput) gistInput.value = getStoredGistId() || "";
  const encryptToggle = document.getElementById(
    "encrypt-toggle",
  ) as HTMLInputElement | null;
  const encryptInput = document.getElementById(
    "encrypt-passphrase",
  ) as HTMLInputElement | null;
  const hasPassphrase = !!getEncryptionPassphrase();
  const dataEncrypted = isEncrypted(
    localStorage.getItem("trainingProgress") || "",
  );
  const encryptionOn = hasPassphrase || dataEncrypted;
  if (encryptToggle) {
    encryptToggle.checked = encryptionOn;
    encryptToggle.onchange = () => {
      if (encryptInput) encryptInput.disabled = !encryptToggle.checked;
    };
  }
  if (encryptInput) {
    encryptInput.disabled = !encryptionOn;
    encryptInput.value = hasPassphrase ? "********" : "";
    if (!hasPassphrase && dataEncrypted) {
      encryptInput.placeholder = "Введіть пароль";
    }
  }
  const smartTimerToggle = document.getElementById(
    "smart-timer-toggle",
  ) as HTMLInputElement | null;
  if (smartTimerToggle) {
    smartTimerToggle.checked = localStorage.getItem("gym_smart_timer") !== "false";
  }
}

function closeSettingsModal(): void {
  const modal = document.getElementById("settings-modal");
  if (modal) modal.style.display = "none";
}

async function saveSettings(): Promise<void> {
  const tokenInput = document.getElementById(
    "github-token",
  ) as HTMLInputElement;
  const token = (tokenInput?.value || "").trim();
  const gistInput = document.getElementById("gist-id") as HTMLInputElement;
  const gistId = (gistInput?.value || "").trim();

  if (token) {
    setStoredToken(token);
    showToast(t('toast.warning_token'), "warning");
  }
  if (gistId) setStoredGistId(gistId);

  const smartTimerToggle = document.getElementById(
    "smart-timer-toggle",
  ) as HTMLInputElement | null;
  if (smartTimerToggle) {
    localStorage.setItem("gym_smart_timer", String(smartTimerToggle.checked));
  }

  const encryptToggle = document.getElementById(
    "encrypt-toggle",
  ) as HTMLInputElement | null;
  const encryptInput = document.getElementById(
    "encrypt-passphrase",
  ) as HTMLInputElement | null;
  if (encryptToggle?.checked) {
    const passphrase = encryptInput?.value;
    if (!passphrase || passphrase.length < 8 || passphrase === "********") {
      showToast(t('toast.encrypt_too_short'), "warning");
      return;
    }
    setEncryptionPassphrase(passphrase);
    await encryptLocalData(passphrase);
    showToast(t('toast.encrypt_enabled'), "success");
  } else {
    const passphrase = getEncryptionPassphrase() || encryptInput?.value;
    const dataEncrypted = isEncrypted(
      localStorage.getItem("trainingProgress") || "",
    );
    if (dataEncrypted && (!passphrase || passphrase === "********")) {
      showToast(
        t('toast.encrypt_disabled_prompt'),
        "warning",
      );
      if (encryptInput) {
        encryptInput.disabled = false;
        encryptInput.focus();
      }
      return;
    }
    if (passphrase && passphrase !== "********") {
      const ok = await decryptLocalData(passphrase);
      if (!ok) {
        showToast(t('toast.wrong_password'), "error");
        return;
      }
    }
    clearEncryptionPassphrase();
    showToast(t('toast.encrypt_disabled'), "info");
  }

  showToast(t('toast.settings_saved'), "success");
  vibrate(50);
}

async function syncToCloud(): Promise<void> {
  const token = getStoredToken();
  const gistId = getStoredGistId();

  if (!token) {
    showToast(t('toast.need_github_token'), "warning");
    openSettingsModal();
    return;
  }

  showToast(t('toast.syncing'), "info", 60000);

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
      const result = (await response.json()) as { id?: string };
      if (!gistId && result.id) {
        setStoredGistId(result.id);
        const gistInput = document.getElementById(
          "gist-id",
        ) as HTMLInputElement;
        if (gistInput) gistInput.value = result.id;
      }
      showToast(t('toast.sync_success'), "success");
      vibrate([50, 100, 50]);
    } else {
      const err = (await response.json().catch(() => ({}))) as {
        message?: string;
      };
      showToast(
        t('toast.sync_error', err.message || `HTTP ${response.status}`),
        "error",
      );
    }
  } catch (e: unknown) {
    const err = e as { message: string };
    showToast(t('toast.network_error', err.message), "error");
  }
}

async function fetchFromCloud(): Promise<void> {
  const token = getStoredToken();
  const gistId = getStoredGistId();

  if (!token || !gistId) {
    showToast(t('toast.need_token_and_gist'), "warning");
    return;
  }

  showToast(t('toast.downloading'), "info", 60000);

  try {
    const response = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: { Authorization: `token ${token}` },
    });

    if (response.ok) {
      const result = (await response.json()) as {
        files?: Record<string, { content: string }>;
      };
      if (!result.files?.["gym-data.json"]) {
        showToast(t('toast.no_gist_file'), "warning");
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

      if (confirm(t('confirm.sync_merge'))) {
        const remoteCompletion = data.completionState || {};
        for (const [key, remoteVal] of Object.entries(remoteCompletion)) {
          const localVal = completionState[key];
          if (!localVal) {
            completionState[key] = remoteVal;
          } else if (remoteVal.date && localVal.date) {
            if (new Date(remoteVal.date) > new Date(localVal.date)) {
              completionState[key] = remoteVal;
            }
          }
        }

        const remoteLogs = data.exerciseLogs || {};
        for (const [key, remoteArr] of Object.entries(remoteLogs)) {
          if (!exerciseLogs[key]) {
            exerciseLogs[key] = remoteArr;
          } else {
            const localArr = exerciseLogs[key];
            const merged = [...localArr];
            for (const rLog of remoteArr) {
              const exists = merged.some((l) => l.date === rLog.date && l.weight === rLog.weight && l.reps === rLog.reps);
              if (!exists) merged.push(rLog);
            }
            merged.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            exerciseLogs[key] = merged;
          }
        }

        const remoteBw = data.bodyWeightHistory || [];
        const mergedBw = [...bodyWeightHistory];
        for (const rBw of remoteBw) {
          const exists = mergedBw.some((l) => l.date === rBw.date);
          if (!exists) mergedBw.push(rBw);
        }
        mergedBw.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        bodyWeightHistory.length = 0;
        bodyWeightHistory.push(...mergedBw);

        const remoteCe = data.customExercises || [];
        for (const rCe of remoteCe) {
          const existsIdx = customExercises.findIndex((ce) => String(ce.id) === String(rCe.id));
          if (existsIdx === -1) {
            customExercises.push(rCe);
          } else {
            customExercises[existsIdx] = rCe;
          }
        }

        const remoteWp = data.workoutPlans || [];
        for (const rWp of remoteWp) {
          const existsIdx = workoutPlans.findIndex((wp) => String(wp.id) === String(rWp.id));
          if (existsIdx === -1) {
            workoutPlans.push(rWp);
          } else {
            workoutPlans[existsIdx] = rWp;
          }
        }

        mergeCustomExercises();
        saveState();
        savePlans();
        updateStats();
        renderMuscleGroups();
        renderExercises();
        showToast(t('toast.data_updated'), "success");
        vibrate([300, 100, 300]);
      }
    } else {
      showToast(
        t('toast.fetch_error', String(response.status)),
        "error",
      );
    }
  } catch (e: unknown) {
    const err = e as { message: string };
    showToast(t('toast.network_error', err.message), "error");
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

      if (!confirm(t('confirm.import_merge'))) {
        return;
      }

      const remoteCompletion = data.completionState || {};
      for (const [key, remoteVal] of Object.entries(remoteCompletion)) {
        const localVal = completionState[key];
        if (!localVal) {
          completionState[key] = remoteVal;
        } else if (remoteVal.date && localVal.date) {
          if (new Date(remoteVal.date) > new Date(localVal.date)) {
            completionState[key] = remoteVal;
          }
        }
      }

      const remoteLogs = data.exerciseLogs || {};
      for (const [key, remoteArr] of Object.entries(remoteLogs)) {
        if (!exerciseLogs[key]) {
          exerciseLogs[key] = remoteArr;
        } else {
          const localArr = exerciseLogs[key];
          const merged = [...localArr];
          for (const rLog of remoteArr) {
            const exists = merged.some((l) => l.date === rLog.date && l.weight === rLog.weight && l.reps === rLog.reps);
            if (!exists) merged.push(rLog);
          }
          merged.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          exerciseLogs[key] = merged;
        }
      }

      const remoteBw = data.bodyWeightHistory || [];
      const mergedBw = [...bodyWeightHistory];
      for (const rBw of remoteBw) {
        const exists = mergedBw.some((l) => l.date === rBw.date);
        if (!exists) mergedBw.push(rBw);
      }
      mergedBw.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      bodyWeightHistory.length = 0;
      bodyWeightHistory.push(...mergedBw);

      const remoteCe = data.customExercises || [];
      for (const rCe of remoteCe) {
        const existsIdx = customExercises.findIndex((ce) => String(ce.id) === String(rCe.id));
        if (existsIdx === -1) {
          customExercises.push(rCe);
        } else {
          customExercises[existsIdx] = rCe;
        }
      }

      const remoteWp = data.workoutPlans || [];
      for (const rWp of remoteWp) {
        const existsIdx = workoutPlans.findIndex((wp) => String(wp.id) === String(rWp.id));
        if (existsIdx === -1) {
          workoutPlans.push(rWp);
        } else {
          workoutPlans[existsIdx] = rWp;
        }
      }

      mergeCustomExercises();
      saveState();
      savePlans();
      updateStats();
      renderMuscleGroups();
      renderExercises();
      renderPlans();
      showToast(t('toast.import_success'), "success");
    } catch (_err) {
      showToast(t('toast.import_error'), "error");
    }
  };
  reader.readAsText(file);
  target.value = "";
}

function exportToCSV(): void {
  let csv = t('csv.headers') + "\n";
  const allEx = getAllExercises();

  Object.keys(exerciseLogs).forEach((id) => {
    const ex = allEx.find((e) => String(e.id) === String(id));
    const name = ex ? ex.name : t('csv.fallback_exercise', id);
    const group = ex ? ex.muscle : "-";

    exerciseLogs[id].forEach((s) => {
      const date = new Date(s.date).toLocaleDateString("uk-UA");
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

function exportForAppleHealth(): void {
  const csvHeaders = t('csv.apple_health_headers') + "\n";
  let csv = csvHeaders;
  const allEx = getAllExercises();
  
  const groupedLogs: Record<string, { exName: string, weight: number, reps: number, time: number }[]> = {};
  
  Object.keys(exerciseLogs).forEach((id) => {
    const ex = allEx.find((e) => String(e.id) === String(id));
    const name = ex ? ex.name : "Exercise " + id;
    
    exerciseLogs[id].forEach((s) => {
      const d = new Date(s.date);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!groupedLogs[dateStr]) groupedLogs[dateStr] = [];
      groupedLogs[dateStr].push({ exName: name, weight: s.weight || 0, reps: s.reps || 0, time: d.getTime() });
    });
  });

  const sortedDates = Object.keys(groupedLogs).sort();
  
  sortedDates.forEach(dateStr => {
    const strongDate = `${dateStr} 12:00:00`;
    const workoutName = t('csv.apple_health_workout_name');
    const duration = t('csv.apple_health_duration');
    
    const dayLogs = groupedLogs[dateStr].sort((a, b) => a.time - b.time);
    const setOrders: Record<string, number> = {};
    
    dayLogs.forEach(log => {
      if (!setOrders[log.exName]) setOrders[log.exName] = 1;
      else setOrders[log.exName]++;
      
      const setOrder = setOrders[log.exName];
      csv += `"${strongDate}","${workoutName}","${duration}","${log.exName}",${setOrder},${log.weight},${log.reps},0,0,"","",\n`;
    });
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `strong_compatible_${new Date().toISOString().split("T")[0]}.csv`,
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
  exportForAppleHealth,
};
