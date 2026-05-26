import { trainingData } from "./exercises.js";
import { safeJSONParse, encryptData, decryptData, getEncryptionPassphrase } from "./utils.js";
import type {
  CompletionEntry,
  LogEntry,
  BodyWeightEntry,
  Exercise,
  WorkoutPlan,
} from "./types.js";

let completionState: Record<string, CompletionEntry> = {};
let exerciseLogs: Record<string, LogEntry[]> = {};
let bodyWeightHistory: BodyWeightEntry[] = [];
let customExercises: Exercise[] = [];
let workoutPlans: WorkoutPlan[] = [];
let selectedMuscleGroup: string | null = null;
let selectedExerciseId: string | number | null = null;

function getAllExercises(): Exercise[] {
  return trainingData.flatMap((group) => group.exercises) as Exercise[];
}

function mergeCustomExercises(): void {
  customExercises.forEach((ce) => {
    const group = trainingData.find((g) => g.name === ce.muscleGroup);
    if (group && !group.exercises.some((ex) => String(ex.id) === String(ce.id))) {
      (group.exercises as Exercise[]).push(ce);
    }
  });
}

function loadState(): void {
  const saved = localStorage.getItem("trainingProgress");
  if (saved) {
    completionState = safeJSONParse(saved, {}) as Record<string, CompletionEntry>;
  }

  const lastDate = localStorage.getItem("lastSessionDate");
  const today = new Date().toDateString();

  if (lastDate && lastDate !== today) {
    const yesterdayArchive = localStorage.getItem("completionArchive");
    const archive: Record<string, Record<string, CompletionEntry>> = yesterdayArchive ? safeJSONParse(yesterdayArchive, {}) as Record<string, Record<string, CompletionEntry>> : {};
    archive[lastDate] = completionState;
    localStorage.setItem("completionArchive", JSON.stringify(archive));
    completionState = {};
    localStorage.setItem("trainingProgress", JSON.stringify(completionState));
    pruneOldArchiveEntries(archive);
  }
  localStorage.setItem("lastSessionDate", today);

  const logs = localStorage.getItem("exerciseLogs");
  if (logs) exerciseLogs = safeJSONParse(logs, {}) as Record<string, LogEntry[]>;

  const bw = localStorage.getItem("bodyWeightHistory");
  if (bw) bodyWeightHistory = safeJSONParse(bw, []) as BodyWeightEntry[];

  const ce = localStorage.getItem("customExercises");
  if (ce) {
    customExercises = safeJSONParse(ce, []) as Exercise[];
    mergeCustomExercises();
  }

  migrateLegacyLogbook();
}

function pruneOldArchiveEntries(archive: Record<string, Record<string, CompletionEntry>>): void {
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 2);
  const cutoffStr = cutoff.toDateString();
  let pruned = 0;
  Object.keys(archive).forEach((dateStr) => {
    if (new Date(dateStr) < new Date(cutoffStr)) {
      delete archive[dateStr];
      pruned++;
    }
  });
  if (pruned > 0) {
    localStorage.setItem("completionArchive", JSON.stringify(archive));
  }
}

function saveState(): void {
  localStorage.setItem("trainingProgress", JSON.stringify(completionState));
  localStorage.setItem("exerciseLogs", JSON.stringify(exerciseLogs));
  localStorage.setItem("bodyWeightHistory", JSON.stringify(bodyWeightHistory));
  localStorage.setItem("customExercises", JSON.stringify(customExercises));
}

function isEncrypted(value: string): boolean {
  try {
    const first = value.charCodeAt(0);
    return first === 1;
  } catch { return false; }
}

async function encryptLocalData(passphrase: string): Promise<void> {
  const keys: [string, unknown][] = [
    ["trainingProgress", completionState],
    ["exerciseLogs", exerciseLogs],
    ["bodyWeightHistory", bodyWeightHistory],
    ["customExercises", customExercises],
    ["workoutPlans", workoutPlans],
  ];
  for (const [key, data] of keys) {
    const plain = JSON.stringify(data);
    const enc = await encryptData(plain, passphrase);
    localStorage.setItem(key, enc);
  }
}

async function decryptLocalData(passphrase: string): Promise<boolean> {
  try {
    const keys = ["trainingProgress", "exerciseLogs", "bodyWeightHistory", "customExercises", "workoutPlans"];
    for (const key of keys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      if (!isEncrypted(raw)) continue;
      const dec = await decryptData(raw, passphrase);
      if (dec === null) return false;
      const parsed = safeJSONParse(dec, null);
      if (parsed === null) return false;
      localStorage.setItem(key, dec);
    }
    return true;
  } catch { return false; }
}

function loadEncryptedOnStartup(): boolean {
  const passphrase = getEncryptionPassphrase();
  if (!passphrase) return false;
  const test = localStorage.getItem("trainingProgress");
  if (!test || !isEncrypted(test)) return false;
  decryptLocalData(passphrase).then((ok) => {
    if (!ok) {
      console.warn("Decryption failed on startup — wrong passphrase?");
    }
  });
  return true;
}

function migrateLegacyLogbook(): void {
  const rawData = localStorage.getItem("my_custom_logbook");
  if (!rawData) return;
  try {
    const data = JSON.parse(rawData);
    const legacyExercises: { id: number | string; name: string }[] = data.exercises || [];
    const legacySessions: {
      exerciseId: string | number;
      timestamp: string;
      sets: { weight: string | number; reps: string | number }[];
    }[] = data.sessions || [];
    const legacyIdMap: Record<string | number, string | number> = {};

    legacyExercises.forEach((ex) => {
      const existingEx = getAllExercises().find(
        (e) => e.name.toLowerCase().trim() === ex.name.toLowerCase().trim()
      );
      if (existingEx) {
        legacyIdMap[ex.id] = existingEx.id;
      } else {
        const newEx: Exercise = {
          id: ex.id,
          name: ex.name,
          muscle: "Груди",
          muscleGroup: "Груди",
          difficulty: "Середній",
          description: "Користувацька вправа з Журналу",
          instructions: ["Користувацька вправа"],
          sets: "3 x 10",
          image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=300&auto=format&fit=crop"
        };
        customExercises.push(newEx);
        legacyIdMap[ex.id] = ex.id;
      }
    });

    mergeCustomExercises();

    legacySessions.forEach((sess) => {
      const targetExId = legacyIdMap[sess.exerciseId] || sess.exerciseId;
      if (!exerciseLogs[targetExId]) {
        exerciseLogs[targetExId] = [];
      }
      if (sess.sets && Array.isArray(sess.sets)) {
        sess.sets.forEach((set) => {
          const setTime = new Date(sess.timestamp).toISOString();
          const alreadyExists = exerciseLogs[targetExId].some(
            (logged) =>
              logged.date === setTime &&
              logged.weight === parseFloat(String(set.weight)) &&
              logged.reps === parseInt(String(set.reps))
          );
          if (!alreadyExists) {
            exerciseLogs[targetExId].push({
              date: setTime,
              weight: parseFloat(String(set.weight)),
              reps: parseInt(String(set.reps)),
            });
          }
        });
      }
    });

    localStorage.setItem("my_custom_logbook_backup", rawData);
    localStorage.removeItem("my_custom_logbook");
    saveState();
    console.log("Legacy logbook migrated successfully!");
  } catch (e) {
    console.error("Error migrating legacy logbook:", e);
  }
}

function loadPlans(): void {
  const saved = localStorage.getItem("workoutPlans");
  if (saved) {
    workoutPlans = safeJSONParse(saved, []) as WorkoutPlan[];
  }
}

function savePlans(): void {
  localStorage.setItem("workoutPlans", JSON.stringify(workoutPlans));
}

function getWorkoutHistory(period: string): { date: string; count: number; exercises: (string | number)[] }[] {
  const exerciseDates: Record<string, { date: string; count: number; exercises: (string | number)[] }> = {};
  const allEx = getAllExercises();

  const processedDates = new Set<string>();

  const processEntry = (state: Record<string, CompletionEntry>) => {
    allEx.forEach((ex) => {
      if (state[ex.id] && state[ex.id].date) {
        const dateStr = new Date(state[ex.id].date).toDateString();
        if (processedDates.has(dateStr)) return;
        processedDates.add(dateStr);
        if (!exerciseDates[dateStr]) {
          exerciseDates[dateStr] = {
            date: state[ex.id].date,
            exercises: [],
            count: 0,
          };
        }
      }
    });

    allEx.forEach((ex) => {
      if (state[ex.id] && state[ex.id].date) {
        const dateStr = new Date(state[ex.id].date).toDateString();
        exerciseDates[dateStr].exercises.push(ex.id);
        exerciseDates[dateStr].count++;
      }
    });
  };

  processEntry(completionState);

  const archive = localStorage.getItem("completionArchive");
  if (archive) {
    const archiveData = safeJSONParse(archive, {}) as Record<string, Record<string, CompletionEntry>>;
    Object.keys(archiveData).forEach((dateStr) => {
      processEntry(archiveData[dateStr]);
    });
  }

  let workouts = Object.values(exerciseDates);

  if (period === "week") {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    workouts = workouts.filter((w) => new Date(w.date) >= weekAgo);
  } else if (period === "month") {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    workouts = workouts.filter((w) => new Date(w.date) >= monthAgo);
  }

  return workouts.sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

function resetCompletionState(): void {
  Object.keys(completionState).forEach((k) => delete completionState[k]);
}

function markExerciseComplete(id: string | number, date: string, name: string): void {
  completionState[id] = { completed: true, date, name };
}

function unmarkExerciseComplete(id: string | number): void {
  delete completionState[id];
}

function setSelectedMuscleGroup(id: string | null): void {
  selectedMuscleGroup = id;
}

function setSelectedExerciseId(id: string | number | null): void {
  selectedExerciseId = id;
}

function pruneOldLogs(maxAgeDays = 365): void {
  const cutoff = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;
  let pruned = 0;
  Object.keys(exerciseLogs).forEach((exId) => {
    const before = exerciseLogs[exId].length;
    exerciseLogs[exId] = exerciseLogs[exId].filter(
      (s) => new Date(s.date).getTime() > cutoff,
    );
    pruned += before - exerciseLogs[exId].length;
    if (exerciseLogs[exId].length === 0) {
      delete exerciseLogs[exId];
    }
  });
  if (pruned > 0) {
    saveState();
    console.log(`Pruned ${pruned} old log entries`);
  }
}

export {
  trainingData,
  completionState,
  exerciseLogs,
  bodyWeightHistory,
  customExercises,
  workoutPlans,
  selectedMuscleGroup,
  selectedExerciseId,
  getAllExercises,
  mergeCustomExercises,
  loadState,
  saveState,
  loadPlans,
  savePlans,
  getWorkoutHistory,
  pruneOldLogs,
  resetCompletionState,
  markExerciseComplete,
  unmarkExerciseComplete,
  setSelectedMuscleGroup,
  setSelectedExerciseId,
  encryptLocalData,
  decryptLocalData,
  loadEncryptedOnStartup,
};
