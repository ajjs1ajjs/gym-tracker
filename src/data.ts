import { trainingData } from "./exercises.js";
import { safeJSONParse } from "./utils.js";
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

function getAllExercises() {
  return trainingData.flatMap((group) => group.exercises);
}

function mergeCustomExercises() {
  customExercises.forEach((ce) => {
    const group = trainingData.find((g) => g.name === ce.muscleGroup);
    if (group && !group.exercises.some((ex) => String(ex.id) === String(ce.id))) {
      group.exercises.push(ce as any);
    }
  });
}

function loadState() {
  const saved = localStorage.getItem("trainingProgress");
  if (saved) {
    completionState = safeJSONParse(saved, {});
  }

  const lastDate = localStorage.getItem("lastSessionDate");
  const today = new Date().toDateString();

  if (lastDate && lastDate !== today) {
    const yesterdayArchive = localStorage.getItem("completionArchive");
    let archive = yesterdayArchive ? safeJSONParse(yesterdayArchive, {}) : {};
    archive[lastDate] = completionState;
    localStorage.setItem("completionArchive", JSON.stringify(archive));
    completionState = {};
    localStorage.setItem("trainingProgress", JSON.stringify(completionState));
  }
  localStorage.setItem("lastSessionDate", today);

  const logs = localStorage.getItem("exerciseLogs");
  if (logs) exerciseLogs = safeJSONParse(logs, {});

  const bw = localStorage.getItem("bodyWeightHistory");
  if (bw) bodyWeightHistory = safeJSONParse(bw, []);

  const ce = localStorage.getItem("customExercises");
  if (ce) {
    customExercises = safeJSONParse(ce, []);
    mergeCustomExercises();
  }

  migrateLegacyLogbook();
}

function saveState() {
  localStorage.setItem("trainingProgress", JSON.stringify(completionState));
  localStorage.setItem("exerciseLogs", JSON.stringify(exerciseLogs));
  localStorage.setItem("bodyWeightHistory", JSON.stringify(bodyWeightHistory));
  localStorage.setItem("customExercises", JSON.stringify(customExercises));
}

function migrateLegacyLogbook() {
  const rawData = localStorage.getItem("my_custom_logbook");
  if (!rawData) return;
  try {
    const data = JSON.parse(rawData);
    const legacyExercises = data.exercises || [];
    const legacySessions = data.sessions || [];
    const legacyIdMap = {};

    legacyExercises.forEach((ex) => {
      const existingEx = getAllExercises().find(
        (e) => e.name.toLowerCase().trim() === ex.name.toLowerCase().trim()
      );
      if (existingEx) {
        legacyIdMap[ex.id] = existingEx.id;
      } else {
        const newEx = {
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
              logged.weight === parseFloat(set.weight) &&
              logged.reps === parseInt(set.reps)
          );
          if (!alreadyExists) {
            exerciseLogs[targetExId].push({
              date: setTime,
              weight: parseFloat(set.weight),
              reps: parseInt(set.reps),
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

function loadPlans() {
  const saved = localStorage.getItem("workoutPlans");
  if (saved) {
    workoutPlans = safeJSONParse(saved, []);
  }
}

function savePlans() {
  localStorage.setItem("workoutPlans", JSON.stringify(workoutPlans));
}

function getWorkoutHistory(period) {
  const exerciseDates: Record<string, { date: string; count: number; exercises: (string | number)[] }> = {};
  const allEx = getAllExercises();

  allEx.forEach((ex) => {
    if (completionState[ex.id] && completionState[ex.id].date) {
      const dateStr = new Date(completionState[ex.id].date).toDateString();
      if (!exerciseDates[dateStr]) {
        exerciseDates[dateStr] = {
          date: completionState[ex.id].date,
          exercises: [],
          count: 0,
        };
      }
      exerciseDates[dateStr].exercises.push(ex.id);
      exerciseDates[dateStr].count++;
    }
  });

  const archive = localStorage.getItem("completionArchive");
  if (archive) {
    const archiveData = safeJSONParse(archive, {});
    Object.keys(archiveData).forEach((dateStr) => {
      const dayState = archiveData[dateStr];
      allEx.forEach((ex) => {
        if (dayState[ex.id] && dayState[ex.id].date) {
          const archivedDateStr = new Date(dayState[ex.id].date).toDateString();
          if (!exerciseDates[archivedDateStr]) {
            exerciseDates[archivedDateStr] = {
              date: dayState[ex.id].date,
              exercises: [],
              count: 0,
            };
          }
          exerciseDates[archivedDateStr].exercises.push(ex.id);
          exerciseDates[archivedDateStr].count++;
        }
      });
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

function resetCompletionState() {
  Object.keys(completionState).forEach((k) => delete completionState[k]);
}

function markExerciseComplete(id, date, name) {
  completionState[id] = { completed: true, date, name };
}

function unmarkExerciseComplete(id) {
  delete completionState[id];
}

function setSelectedMuscleGroup(id) {
  selectedMuscleGroup = id;
}

function setSelectedExerciseId(id) {
  selectedExerciseId = id;
}

function pruneOldLogs(maxAgeDays = 365) {
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
};
