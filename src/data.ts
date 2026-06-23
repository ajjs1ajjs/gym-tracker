import { t } from "./i18n.js";
import { trainingData } from "./exercises.js";
import {
  safeJSONParse,
  safeSetItem,
  encryptData,
  decryptData,
  getEncryptionPassphrase,
  getDateKey,
  showToast,
} from "./utils.js";
import type {
  CompletionEntry,
  LogEntry,
  BodyWeightEntry,
  Exercise,
  WorkoutPlan,
} from "./types.js";

let completionState: Record<string, CompletionEntry> = {};
// Kept in memory (mutated, never reassigned) so external readers can import a
// stable live binding, and so the archive can be encrypted at rest like the
// rest of the journal instead of living as plaintext in localStorage.
const completionArchive: Record<string, Record<string, CompletionEntry>> = {};
// Nutrition state kept in memory so it can be encrypted at rest like the rest
// of the journal (reads are synchronous, decryption is async — a localStorage
// mirror would otherwise have to be plaintext during a session). water_goal is
// intentionally left in plaintext localStorage: it is a non-sensitive target.
let waterLogs: Record<string, number> = {};
let calorieParams: Record<string, unknown> | null = null;
let exerciseLogs: Record<string, LogEntry[]> = {};
let bodyWeightHistory: BodyWeightEntry[] = [];
let customExercises: Exercise[] = [];
let workoutPlans: WorkoutPlan[] = [];
let selectedMuscleGroup: string | null = null;
let selectedExerciseId: string | number | null = null;

// Serializes encrypted localStorage writes so multiple rapid calls
// (e.g. finishWorkout + toggleExercise) don't race against each other.
// Non-encrypted writes are synchronous and bypass the queue.
let _storageWriteQueue: Promise<unknown> = Promise.resolve();

async function _enqueueStorageWrite(
  key: string,
  data: unknown,
  passphrase: string,
): Promise<boolean> {
  try {
    const enc = await encryptData(JSON.stringify(data), passphrase);
    return safeSetItem(key, enc);
  } catch {
    return false;
  }
}

function _scheduleEncryptedWrite(
  key: string,
  data: unknown,
  passphrase: string,
): void {
  _storageWriteQueue = _storageWriteQueue.then(() =>
    _enqueueStorageWrite(key, data, passphrase),
  );
}

// Flushes pending encrypted writes. Attach to beforeunload in environments
// where the browser honours async work during unload (not guaranteed).
async function flushStorageQueue(): Promise<void> {
  await _storageWriteQueue;
}

function getAllExercises(): Exercise[] {
  return trainingData.flatMap((group) => group.exercises) as Exercise[];
}

function mergeCustomExercises(): void {
  customExercises.forEach((ce) => {
    const group = trainingData.find((g) => g.name === ce.muscleGroup);
    if (
      group &&
      !group.exercises.some((ex) => String(ex.id) === String(ce.id))
    ) {
      (group.exercises as Exercise[]).push(ce);
    }
  });
}

// Maps old local-timezone YYYY-MM-DD keys to their UTC equivalents and
// merges values when collisions occur (newer `date` wins for completion).
function _localDateKeyToUTC(key: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return key;
  const [y, m, d] = key.split("-").map(Number);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return key;
  const localMidnight = new Date(y, m - 1, d);
  if (isNaN(localMidnight.getTime())) return key;
  return getDateKey(localMidnight);
}

function _migrateCompletionObjectKeys(
  obj: Record<string, Record<string, CompletionEntry>>,
): Record<string, Record<string, CompletionEntry>> {
  const result: Record<string, Record<string, CompletionEntry>> = {};
  for (const [key, val] of Object.entries(obj)) {
    const utcKey = _localDateKeyToUTC(key);
    if (!result[utcKey]) {
      result[utcKey] = val;
    } else {
      for (const [exId, entry] of Object.entries(val)) {
        const existing = result[utcKey][exId];
        if (!existing || (entry.date && new Date(entry.date) > new Date(existing.date))) {
          result[utcKey][exId] = entry;
        }
      }
    }
  }
  return result;
}

function _migrateScalarObjectKeys(obj: Record<string, number>): Record<string, number> {
  const result: Record<string, number> = {};
  for (const [key, val] of Object.entries(obj)) {
    const utcKey = _localDateKeyToUTC(key);
    result[utcKey] = Math.max(result[utcKey] || 0, val);
  }
  return result;
}

const UTC_MIGRATION_FLAG = "gym_utc_migration_done";

// Converts persisted date keys from local timezone to UTC. Runs once (flag).
// Handles both plaintext and in-memory data after decryption.
function migrateDateKeysToUTC(): void {
  if (localStorage.getItem(UTC_MIGRATION_FLAG)) return;

  // --- lastSessionDate ---
  const oldLast = localStorage.getItem("lastSessionDate");
  if (oldLast && /^\d{4}-\d{2}-\d{2}$/.test(oldLast)) {
    localStorage.setItem("lastSessionDate", _localDateKeyToUTC(oldLast));
  }

  // --- completionArchive on disk (plaintext only; ciphertext is migrated
  //     in loadEncryptedOnStartup via the in-memory path below) ---
  const rawArchive = localStorage.getItem("completionArchive");
  if (rawArchive && !isEncrypted(rawArchive)) {
    const parsed = safeJSONParse(rawArchive, {}) as Record<string, Record<string, CompletionEntry>>;
    const migrated = _migrateCompletionObjectKeys(parsed);
    localStorage.setItem("completionArchive", JSON.stringify(migrated));
    setArchive(migrated);
  }

  // --- completionArchive in memory (covers the encrypted path where
  //     decryptLocalData already loaded it into the live object) ---
  const archiveChanged =
    Object.keys(completionArchive).some((k) => _localDateKeyToUTC(k) !== k);
  if (archiveChanged) {
    const migrated = _migrateCompletionObjectKeys(completionArchive);
    setArchive(migrated);
    saveArchive();
  }

  // --- waterLogs on disk (plaintext) ---
  const rawWater = localStorage.getItem("gym_water_logs");
  if (rawWater && !isEncrypted(rawWater)) {
    const parsed = safeJSONParse(rawWater, {}) as Record<string, number>;
    const migrated = _migrateScalarObjectKeys(parsed);
    localStorage.setItem("gym_water_logs", JSON.stringify(migrated));
    waterLogs = migrated;
  } else {
    // In-memory (encrypted path)
    const waterChanged =
      Object.keys(waterLogs).some((k) => _localDateKeyToUTC(k) !== k);
    if (waterChanged) {
      waterLogs = _migrateScalarObjectKeys(waterLogs);
      saveWaterLogs();
    }
  }

  localStorage.setItem(UTC_MIGRATION_FLAG, "1");
}

function migrateDateKeys(): void {
  const lastDate = localStorage.getItem("lastSessionDate");
  if (lastDate && lastDate.includes(" ")) {
    const parsed = new Date(lastDate);
    if (!isNaN(parsed.getTime())) {
      const newKey = getDateKey(parsed);
      localStorage.setItem("lastSessionDate", newKey);
    }
  }
  const archive = localStorage.getItem("completionArchive");
  if (archive) {
    try {
      const parsed = JSON.parse(archive);
      const migrated: Record<string, unknown> = {};
      let changed = false;
      for (const key of Object.keys(parsed)) {
        const d = new Date(key);
        const newKey = d instanceof Date && !isNaN(d.getTime()) ? getDateKey(d) : key;
        if (newKey !== key) changed = true;
        migrated[newKey] = parsed[key];
      }
      if (changed) {
        localStorage.setItem("completionArchive", JSON.stringify(migrated));
      }
    } catch {
      // ignore parse errors
    }
  }
}

// Replaces the in-memory archive contents with `data` (mutate, don't reassign,
// to preserve the live binding for importers).
function setArchive(data: Record<string, Record<string, CompletionEntry>>): void {
  Object.keys(completionArchive).forEach((k) => delete completionArchive[k]);
  Object.assign(completionArchive, data);
}

function loadArchiveFromStorage(): void {
  const raw = localStorage.getItem("completionArchive");
  // Skip ciphertext — decryptLocalData() populates the archive on unlock.
  if (raw && !isEncrypted(raw)) {
    setArchive(
      safeJSONParse(raw, {}) as Record<
        string,
        Record<string, CompletionEntry>
      >,
    );
  }
}

// Rolls yesterday's completion into the archive when the day changes. Must run
// against the *real* (decrypted) state, so it is invoked from the plaintext
// path of loadState() and, for encrypted data, from loadEncryptedOnStartup().
function archivePreviousDayIfNeeded(): void {
  const lastDate = localStorage.getItem("lastSessionDate");
  const today = getDateKey(new Date());
  if (lastDate && lastDate !== today) {
    completionArchive[lastDate] = completionState;
    completionState = {};
    pruneOldArchiveEntries(completionArchive);
    saveState(); // persists reset completionState (encryption-aware)
    saveArchive(); // persists archive (encryption-aware)
  }
  localStorage.setItem("lastSessionDate", today);
}

// Loads plaintext nutrition state into memory. Ciphertext is skipped here and
// populated later by decryptLocalData() on unlock.
function loadNutrition(): void {
  const rawWater = localStorage.getItem("gym_water_logs");
  if (rawWater && !isEncrypted(rawWater)) {
    waterLogs = safeJSONParse(rawWater, {}) as Record<string, number>;
  }
  const rawCal = localStorage.getItem("gym_calorie_calculator_params");
  if (rawCal && !isEncrypted(rawCal)) {
    calorieParams = safeJSONParse(rawCal, null) as Record<
      string,
      unknown
    > | null;
  }
}

// Persists a single nutrition key. Encrypted writes are serialised through
// the storage queue (same as saveArchive) to avoid race conditions.
function persistNutritionKey(key: string, data: unknown): boolean {
  const passphrase = getEncryptionPassphrase();
  const json = JSON.stringify(data);
  if (passphrase) {
    _scheduleEncryptedWrite(key, data, passphrase);
    return true;
  }
  return safeSetItem(key, json);
}

function getWaterLogs(): Record<string, number> {
  return waterLogs;
}

function saveWaterLogs(): boolean {
  return persistNutritionKey("gym_water_logs", waterLogs);
}

function getCalorieParams(): Record<string, unknown> | null {
  return calorieParams;
}

function setCalorieParams(params: Record<string, unknown>): boolean {
  calorieParams = params;
  return persistNutritionKey("gym_calorie_calculator_params", params);
}

function loadState(): void {
  migrateDateKeys();
  loadArchiveFromStorage();
  loadNutrition();

  const saved = localStorage.getItem("trainingProgress");
  const encrypted = !!saved && isEncrypted(saved);

  // Encrypted data is loaded later by loadEncryptedOnStartup(); parsing it here
  // would yield empty objects and a premature rollover that wipes the journal.
  if (encrypted) {
    migrateLegacyLogbook();
    return;
  }

  if (saved) {
    completionState = safeJSONParse(saved, {}) as Record<
      string,
      CompletionEntry
    >;
  }

  archivePreviousDayIfNeeded();

  const logs = localStorage.getItem("exerciseLogs");
  if (logs)
    exerciseLogs = safeJSONParse(logs, {}) as Record<string, LogEntry[]>;

  const bw = localStorage.getItem("bodyWeightHistory");
  if (bw) bodyWeightHistory = safeJSONParse(bw, []) as BodyWeightEntry[];

  const ce = localStorage.getItem("customExercises");
  if (ce) {
    customExercises = safeJSONParse(ce, []) as Exercise[];
    mergeCustomExercises();
  }

  migrateLegacyLogbook();

  // One-time UTC date-key migration (local → UTC).  Must run after all
  // plaintext data is in memory but before the UI renders.
  migrateDateKeysToUTC();
}

// Mutates `archive` in place; persistence is the caller's responsibility.
function pruneOldArchiveEntries(
  archive: Record<string, Record<string, CompletionEntry>>,
): void {
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 2);
  const cutoffStr = getDateKey(cutoff);
  Object.keys(archive).forEach((dateStr) => {
    // Compare date strings directly (safe for YYYY-MM-DD, avoids Invalid Date).
    if (dateStr < cutoffStr) {
      delete archive[dateStr];
    }
  });
}

// Canonical list of every localStorage key that carries encrypted journal
// data.  Used by both persistEncryptedMain (auto-save) and encryptLocalData
// (explicit toggle on) so they stay in sync.
const ENCRYPTED_MAIN_KEYS: [string, (() => unknown)][] = [
  ["trainingProgress", () => completionState],
  ["exerciseLogs", () => exerciseLogs],
  ["bodyWeightHistory", () => bodyWeightHistory],
  ["customExercises", () => customExercises],
  ["workoutPlans", () => workoutPlans],
  ["completionArchive", () => completionArchive],
];

const ENCRYPTED_NUTRITION_KEYS: [string, (() => unknown)][] = [
  ["gym_water_logs", () => waterLogs],
  ["gym_calorie_calculator_params", () => calorieParams ?? {}],
];

// Serialises and encrypts every entry in `keys`, writing each to localStorage.
async function _encryptKeyList(
  keys: [string, (() => unknown)][],
  passphrase: string,
): Promise<boolean> {
  let ok = true;
  for (const [key, getData] of keys) {
    const enc = await encryptData(JSON.stringify(getData()), passphrase);
    if (!safeSetItem(key, enc)) {
      console.error(`Failed to encrypt and save ${key} - storage may be full`);
      ok = false;
    }
  }
  return ok;
}

// Writes ciphertext for the journal's main keys. Serialised via the
// storage queue so concurrent calls (e.g. toggle + finishWorkout) never
// interleave and corrupt on-disk state.
async function persistEncryptedMain(passphrase: string): Promise<boolean> {
  return _encryptKeyList(ENCRYPTED_MAIN_KEYS, passphrase);
}

function saveState(): boolean {
  const passphrase = getEncryptionPassphrase();
  if (passphrase) {
    // Enqueue via the serialised write queue so rapid consecutive calls
    // don't race; the queue guarantees last-write-wins ordering.
    _storageWriteQueue = _storageWriteQueue.then(() =>
      persistEncryptedMain(passphrase),
    );
    return true;
  }
  const ok =
    safeSetItem("trainingProgress", JSON.stringify(completionState)) &&
    safeSetItem("exerciseLogs", JSON.stringify(exerciseLogs)) &&
    safeSetItem("bodyWeightHistory", JSON.stringify(bodyWeightHistory)) &&
    safeSetItem("customExercises", JSON.stringify(customExercises));
  return ok;
}

// Persists the workout archive. Encrypted writes are serialised through the
// storage queue to prevent data loss from concurrent fire-and-forget calls.
function saveArchive(): boolean {
  const passphrase = getEncryptionPassphrase();
  if (passphrase) {
    _scheduleEncryptedWrite("completionArchive", completionArchive, passphrase);
    return true;
  }
  return safeSetItem("completionArchive", JSON.stringify(completionArchive));
}

function isEncrypted(value: string): boolean {
  return value.startsWith("#1#");
}

async function encryptLocalData(passphrase: string): Promise<boolean> {
  try {
    const allKeys: [string, (() => unknown)][] = [
      ...ENCRYPTED_MAIN_KEYS,
      ...ENCRYPTED_NUTRITION_KEYS,
    ];
    const ok = await _encryptKeyList(allKeys, passphrase);
    return ok;
  } catch (e) {
    console.error("Error during encryption:", e);
    return false;
  }
}

async function decryptLocalData(passphrase: string): Promise<boolean> {
  const PARSE_FAILED = Symbol("parse-failed");
  try {
    const rawProgress = localStorage.getItem("trainingProgress");
    if (rawProgress && isEncrypted(rawProgress)) {
      const dec = await decryptData(rawProgress, passphrase);
      if (dec === null) return false;
      const parsed = safeJSONParse(dec, PARSE_FAILED);
      if (parsed === PARSE_FAILED) return false;
      Object.keys(completionState).forEach((k) => delete completionState[k]);
      Object.assign(completionState, parsed as Record<string, CompletionEntry>);
    }

    const rawLogs = localStorage.getItem("exerciseLogs");
    if (rawLogs && isEncrypted(rawLogs)) {
      const dec = await decryptData(rawLogs, passphrase);
      if (dec === null) return false;
      const parsed = safeJSONParse(dec, PARSE_FAILED);
      if (parsed === PARSE_FAILED) return false;
      Object.keys(exerciseLogs).forEach((k) => delete exerciseLogs[k]);
      Object.assign(exerciseLogs, parsed as Record<string, LogEntry[]>);
    }

    const rawBw = localStorage.getItem("bodyWeightHistory");
    if (rawBw && isEncrypted(rawBw)) {
      const dec = await decryptData(rawBw, passphrase);
      if (dec === null) return false;
      const parsed = safeJSONParse(dec, PARSE_FAILED);
      if (parsed === PARSE_FAILED) return false;
      bodyWeightHistory.length = 0;
      bodyWeightHistory.push(...(parsed as BodyWeightEntry[]));
    }

    const rawCe = localStorage.getItem("customExercises");
    if (rawCe && isEncrypted(rawCe)) {
      const dec = await decryptData(rawCe, passphrase);
      if (dec === null) return false;
      const parsed = safeJSONParse(dec, PARSE_FAILED);
      if (parsed === PARSE_FAILED) return false;
      customExercises.length = 0;
      customExercises.push(...(parsed as Exercise[]));
    }

    const rawWp = localStorage.getItem("workoutPlans");
    if (rawWp && isEncrypted(rawWp)) {
      const dec = await decryptData(rawWp, passphrase);
      if (dec === null) return false;
      const parsed = safeJSONParse(dec, PARSE_FAILED);
      if (parsed === PARSE_FAILED) return false;
      workoutPlans.length = 0;
      workoutPlans.push(...(parsed as WorkoutPlan[]));
    }

    const rawArchive = localStorage.getItem("completionArchive");
    if (rawArchive && isEncrypted(rawArchive)) {
      const dec = await decryptData(rawArchive, passphrase);
      if (dec === null) return false;
      const parsed = safeJSONParse(dec, PARSE_FAILED);
      if (parsed === PARSE_FAILED) return false;
      setArchive(parsed as Record<string, Record<string, CompletionEntry>>);
    }

    const rawWater = localStorage.getItem("gym_water_logs");
    if (rawWater && isEncrypted(rawWater)) {
      const dec = await decryptData(rawWater, passphrase);
      if (dec === null) return false;
      const parsed = safeJSONParse(dec, PARSE_FAILED);
      if (parsed === PARSE_FAILED) return false;
      waterLogs = parsed as Record<string, number>;
    }

    const rawCal = localStorage.getItem("gym_calorie_calculator_params");
    if (rawCal && isEncrypted(rawCal)) {
      const dec = await decryptData(rawCal, passphrase);
      if (dec === null) return false;
      const parsed = safeJSONParse(dec, PARSE_FAILED);
      if (parsed === PARSE_FAILED) return false;
      calorieParams = parsed as Record<string, unknown> | null;
    }

    return true;
  } catch {
    return false;
  }
}

async function loadEncryptedOnStartup(): Promise<boolean> {
  const passphrase = getEncryptionPassphrase();
  if (!passphrase) return false;
  const test = localStorage.getItem("trainingProgress");
  if (!test || !isEncrypted(test)) return false;
  const ok = await decryptLocalData(passphrase);
  if (ok) {
    // Do NOT call saveState() here — that would rewrite the decrypted journal
    // back to localStorage as plaintext, defeating encryption at rest.
    // The data is already populated in memory; on-disk stays ciphertext.
    // Rollover was deferred from loadState() until the real state was available.
    archivePreviousDayIfNeeded();
    mergeCustomExercises();
    // One-time UTC date-key migration for encrypted data.
    migrateDateKeysToUTC();
    console.log("Encrypted data loaded successfully on startup");
  } else {
    console.warn("Decryption failed on startup — wrong passphrase?");
  }
  return ok;
}

function migrateLegacyLogbook(): void {
  const rawData = localStorage.getItem("my_custom_logbook");
  if (!rawData) return;
  try {
    const data = JSON.parse(rawData);
    const legacyExercises: { id: number | string; name: string }[] =
      data.exercises || [];
    const legacySessions: {
      exerciseId: string | number;
      timestamp: string;
      sets: { weight: string | number; reps: string | number }[];
    }[] = data.sessions || [];
    const legacyIdMap: Record<string | number, string | number> = {};

    legacyExercises.forEach((ex) => {
      const existingEx = getAllExercises().find(
        (e) => e.name.toLowerCase().trim() === ex.name.toLowerCase().trim(),
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
          description: t('custom_exercise.default_description'),
          instructions: [t('custom_exercise.default_instructions')],
          sets: "3 x 10",
          image:
            "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=300&auto=format&fit=crop",
        };
        customExercises.push(newEx);
        legacyIdMap[ex.id] = ex.id;
      }
    });

    mergeCustomExercises();

    legacySessions.forEach((sess) => {
      // A single malformed/invalid timestamp must not abort migration of the
      // remaining sessions (new Date(bad).toISOString() throws RangeError).
      const ts = new Date(sess.timestamp);
      if (isNaN(ts.getTime())) {
        console.warn("Skipping legacy session with invalid timestamp:", sess.timestamp);
        return;
      }
      const setTime = ts.toISOString();
      const targetExId = legacyIdMap[sess.exerciseId] || sess.exerciseId;
      if (!exerciseLogs[targetExId]) {
        exerciseLogs[targetExId] = [];
      }
      if (sess.sets && Array.isArray(sess.sets)) {
        sess.sets.forEach((set) => {
          const alreadyExists = exerciseLogs[targetExId].some(
            (logged) =>
              logged.date === setTime &&
              logged.weight === parseFloat(String(set.weight)) &&
              logged.reps === parseInt(String(set.reps)),
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

function savePlans(): boolean {
  const passphrase = getEncryptionPassphrase();
  if (passphrase) {
    _storageWriteQueue = _storageWriteQueue.then(() =>
      persistEncryptedMain(passphrase),
    );
    return true;
  }
  return safeSetItem("workoutPlans", JSON.stringify(workoutPlans));
}

function getWorkoutHistory(
  period: string,
): { date: string; count: number; exercises: (string | number)[] }[] {
  const exerciseDates: Record<
    string,
    { date: string; count: number; exercises: (string | number)[] }
  > = {};
  const allEx = getAllExercises();

  const processEntry = (state: Record<string, CompletionEntry>) => {
    for (const ex of allEx) {
      const entry = state[ex.id];
      if (!entry?.date) continue;
      const dateStr = getDateKey(new Date(entry.date));
      if (!exerciseDates[dateStr]) {
        exerciseDates[dateStr] = {
          date: entry.date,
          exercises: [],
          count: 0,
        };
      }
      exerciseDates[dateStr].exercises.push(ex.id);
      exerciseDates[dateStr].count++;
    }
  };

  processEntry(completionState);

  for (const dateStr of Object.keys(completionArchive)) {
    processEntry(completionArchive[dateStr]);
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

function markExerciseComplete(
  id: string | number,
  date: string,
  name: string,
): void {
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
    showToast(t('toast.logs_pruned', String(pruned)), "info", 8000);
  }
}

export {
  trainingData,
  completionState,
  completionArchive,
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
  saveArchive,
  loadPlans,
  savePlans,
  getWorkoutHistory,
  getWaterLogs,
  saveWaterLogs,
  getCalorieParams,
  setCalorieParams,
  pruneOldLogs,
  resetCompletionState,
  markExerciseComplete,
  unmarkExerciseComplete,
  setSelectedMuscleGroup,
  setSelectedExerciseId,
  encryptLocalData,
  decryptLocalData,
  loadEncryptedOnStartup,
  isEncrypted,
  flushStorageQueue,
};
