import { trainingData } from "./exercises.js";
import { safeJSONParse, safeSetItem, encryptData, decryptData, getEncryptionPassphrase, } from "./utils.js";
let completionState = {};
let exerciseLogs = {};
let bodyWeightHistory = [];
let customExercises = [];
let workoutPlans = [];
let selectedMuscleGroup = null;
let selectedExerciseId = null;
function getAllExercises() {
    return trainingData.flatMap((group) => group.exercises);
}
function mergeCustomExercises() {
    customExercises.forEach((ce) => {
        const group = trainingData.find((g) => g.name === ce.muscleGroup);
        if (group &&
            !group.exercises.some((ex) => String(ex.id) === String(ce.id))) {
            group.exercises.push(ce);
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
        const archive = yesterdayArchive
            ? safeJSONParse(yesterdayArchive, {})
            : {};
        archive[lastDate] = completionState;
        localStorage.setItem("completionArchive", JSON.stringify(archive));
        completionState = {};
        localStorage.setItem("trainingProgress", JSON.stringify(completionState));
        pruneOldArchiveEntries(archive);
    }
    localStorage.setItem("lastSessionDate", today);
    const logs = localStorage.getItem("exerciseLogs");
    if (logs)
        exerciseLogs = safeJSONParse(logs, {});
    const bw = localStorage.getItem("bodyWeightHistory");
    if (bw)
        bodyWeightHistory = safeJSONParse(bw, []);
    const ce = localStorage.getItem("customExercises");
    if (ce) {
        customExercises = safeJSONParse(ce, []);
        mergeCustomExercises();
    }
    migrateLegacyLogbook();
}
function pruneOldArchiveEntries(archive) {
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
function saveState() {
    const ok = safeSetItem("trainingProgress", JSON.stringify(completionState)) &&
        safeSetItem("exerciseLogs", JSON.stringify(exerciseLogs)) &&
        safeSetItem("bodyWeightHistory", JSON.stringify(bodyWeightHistory)) &&
        safeSetItem("customExercises", JSON.stringify(customExercises));
    return ok;
}
function isEncrypted(value) {
    return value.startsWith("#1#");
}
async function encryptLocalData(passphrase) {
    const keys = [
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
    const waterRaw = localStorage.getItem("gym_water_logs") || "{}";
    const calRaw = localStorage.getItem("gym_calorie_calculator_params") || "{}";
    const extraKeys = [
        ["gym_water_logs", waterRaw],
        ["gym_calorie_calculator_params", calRaw],
    ];
    for (const [key, raw] of extraKeys) {
        const enc = await encryptData(raw, passphrase);
        localStorage.setItem(key, enc);
    }
}
async function decryptLocalData(passphrase) {
    try {
        const rawProgress = localStorage.getItem("trainingProgress");
        if (rawProgress && isEncrypted(rawProgress)) {
            const dec = await decryptData(rawProgress, passphrase);
            if (dec === null)
                return false;
            const parsed = safeJSONParse(dec, {});
            if (parsed === null)
                return false;
            Object.keys(completionState).forEach((k) => delete completionState[k]);
            Object.assign(completionState, parsed);
        }
        const rawLogs = localStorage.getItem("exerciseLogs");
        if (rawLogs && isEncrypted(rawLogs)) {
            const dec = await decryptData(rawLogs, passphrase);
            if (dec === null)
                return false;
            const parsed = safeJSONParse(dec, {});
            if (parsed === null)
                return false;
            Object.keys(exerciseLogs).forEach((k) => delete exerciseLogs[k]);
            Object.assign(exerciseLogs, parsed);
        }
        const rawBw = localStorage.getItem("bodyWeightHistory");
        if (rawBw && isEncrypted(rawBw)) {
            const dec = await decryptData(rawBw, passphrase);
            if (dec === null)
                return false;
            const parsed = safeJSONParse(dec, []);
            if (parsed === null)
                return false;
            bodyWeightHistory.length = 0;
            bodyWeightHistory.push(...parsed);
        }
        const rawCe = localStorage.getItem("customExercises");
        if (rawCe && isEncrypted(rawCe)) {
            const dec = await decryptData(rawCe, passphrase);
            if (dec === null)
                return false;
            const parsed = safeJSONParse(dec, []);
            if (parsed === null)
                return false;
            customExercises.length = 0;
            customExercises.push(...parsed);
        }
        const rawWp = localStorage.getItem("workoutPlans");
        if (rawWp && isEncrypted(rawWp)) {
            const dec = await decryptData(rawWp, passphrase);
            if (dec === null)
                return false;
            const parsed = safeJSONParse(dec, []);
            if (parsed === null)
                return false;
            workoutPlans.length = 0;
            workoutPlans.push(...parsed);
        }
        const rawWater = localStorage.getItem("gym_water_logs");
        if (rawWater && isEncrypted(rawWater)) {
            const dec = await decryptData(rawWater, passphrase);
            if (dec === null)
                return false;
            localStorage.setItem("gym_water_logs", dec);
        }
        const rawCal = localStorage.getItem("gym_calorie_calculator_params");
        if (rawCal && isEncrypted(rawCal)) {
            const dec = await decryptData(rawCal, passphrase);
            if (dec === null)
                return false;
            localStorage.setItem("gym_calorie_calculator_params", dec);
        }
        return true;
    }
    catch {
        return false;
    }
}
async function loadEncryptedOnStartup() {
    const passphrase = getEncryptionPassphrase();
    if (!passphrase)
        return false;
    const test = localStorage.getItem("trainingProgress");
    if (!test || !isEncrypted(test))
        return false;
    const ok = await decryptLocalData(passphrase);
    if (ok) {
        saveState();
        mergeCustomExercises();
        console.log("Encrypted data loaded successfully on startup");
    }
    else {
        console.warn("Decryption failed on startup — wrong passphrase?");
    }
    return ok;
}
function migrateLegacyLogbook() {
    const rawData = localStorage.getItem("my_custom_logbook");
    if (!rawData)
        return;
    try {
        const data = JSON.parse(rawData);
        const legacyExercises = data.exercises || [];
        const legacySessions = data.sessions || [];
        const legacyIdMap = {};
        legacyExercises.forEach((ex) => {
            const existingEx = getAllExercises().find((e) => e.name.toLowerCase().trim() === ex.name.toLowerCase().trim());
            if (existingEx) {
                legacyIdMap[ex.id] = existingEx.id;
            }
            else {
                const newEx = {
                    id: ex.id,
                    name: ex.name,
                    muscle: "Груди",
                    muscleGroup: "Груди",
                    difficulty: "Середній",
                    description: "Користувацька вправа з Журналу",
                    instructions: ["Користувацька вправа"],
                    sets: "3 x 10",
                    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=300&auto=format&fit=crop",
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
                    const alreadyExists = exerciseLogs[targetExId].some((logged) => logged.date === setTime &&
                        logged.weight === parseFloat(String(set.weight)) &&
                        logged.reps === parseInt(String(set.reps)));
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
    }
    catch (e) {
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
    return safeSetItem("workoutPlans", JSON.stringify(workoutPlans));
}
function getWorkoutHistory(period) {
    const exerciseDates = {};
    const allEx = getAllExercises();
    const processedDates = new Set();
    const processEntry = (state) => {
        allEx.forEach((ex) => {
            if (state[ex.id] && state[ex.id].date) {
                const dateStr = new Date(state[ex.id].date).toDateString();
                if (processedDates.has(dateStr))
                    return;
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
        const archiveData = safeJSONParse(archive, {});
        Object.keys(archiveData).forEach((dateStr) => {
            processEntry(archiveData[dateStr]);
        });
    }
    let workouts = Object.values(exerciseDates);
    if (period === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        workouts = workouts.filter((w) => new Date(w.date) >= weekAgo);
    }
    else if (period === "month") {
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
        exerciseLogs[exId] = exerciseLogs[exId].filter((s) => new Date(s.date).getTime() > cutoff);
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
export { trainingData, completionState, exerciseLogs, bodyWeightHistory, customExercises, workoutPlans, selectedMuscleGroup, selectedExerciseId, getAllExercises, mergeCustomExercises, loadState, saveState, loadPlans, savePlans, getWorkoutHistory, pruneOldLogs, resetCompletionState, markExerciseComplete, unmarkExerciseComplete, setSelectedMuscleGroup, setSelectedExerciseId, encryptLocalData, decryptLocalData, loadEncryptedOnStartup, isEncrypted, };
