export interface Exercise {
  id: number | string;
  name: string;
  image: string;
  description: string;
  difficulty: string;
  instructions: string[];
  sets: string;
  muscle: string;
  muscleGroup?: string;
}

export interface MuscleGroup {
  id: string;
  name: string;
  icon: string;
  exercises: Exercise[];
}

export interface CompletionEntry {
  completed: boolean;
  date: string;
  name: string;
}

export interface LogEntry {
  date: string;
  weight: number;
  reps: number;
}

export interface BodyWeightEntry {
  date: string;
  weight: number;
}

export interface WorkoutPlan {
  id: number;
  name: string;
  exercises: (number | string)[];
}

export interface WorkoutHistoryEntry {
  date: string;
  exercises: (number | string)[];
  count: number;
}

export interface ExportData {
  version: number;
  exportDate: string;
  completionState: Record<string, CompletionEntry>;
  workoutPlans: WorkoutPlan[];
  exerciseLogs: Record<string, LogEntry[]>;
  bodyWeightHistory: BodyWeightEntry[];
  customExercises: Exercise[];
}

export interface LegacySession {
  exerciseId: string | number;
  timestamp: string;
  sets: { weight: string | number; reps: string | number }[];
}
