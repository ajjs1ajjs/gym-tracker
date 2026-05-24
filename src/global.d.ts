/* eslint-disable */

// ---- External libs ----
interface Chart {
  destroy(): void;
}
declare var Chart: {
  new (ctx: CanvasRenderingContext2D, config: Record<string, unknown>): Chart;
};

declare function confetti(config: Record<string, unknown>): void;

// ---- Wake Lock API ----
interface WakeLockSentinel {
  release(): Promise<void>;
}
interface Navigator {
  wakeLock?: { request(type: "screen"): Promise<WakeLockSentinel> };
}

// ---- Patch Element missing properties ----
interface Element {
  dataset: DOMStringMap;
  closest(selectors: string): Element | null;
  style: CSSStyleDeclaration;
  id: string;
  value?: string;
  src?: string;
  checked?: boolean;
}

// ---- Patch EventTarget ----
interface EventTarget {
  closest?(selectors: string): Element | null;
  dataset?: DOMStringMap;
  id?: string;
}

// ---- Window globals set by main.ts ----
interface Window {
  filterByGroup: (id: string) => void;
  openModal: (id: number | string) => void;
  toggleExercise: (id: number | string) => void;
  closeModal: () => void;
  toggleFromModal: () => void;
  logSet: () => void;
  toggleProgressionChart: () => void;
  finishWorkout: () => void;
  resetProgress: () => void;
  toggleDropdown: () => void;
  openPlateModal: () => void;
  closePlateModal: () => void;
  calculatePlates: () => void;
  switchTab: (tab: string) => void;
  switchLogbookTab: (tab: string) => void;
  openCustomExerciseModal: () => void;
  closeCustomExerciseModal: () => void;
  saveCustomExercise: () => void;
  openTimerModal: () => void;
  closeTimerModal: () => void;
  setTimer: (s: number, e?: Event) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  saveSettings: () => void;
  syncToCloud: () => void;
  fetchFromCloud: () => void;
  exportData: () => void;
  importData: (e: Event) => void;
  exportToCSV: () => void;
  saveBodyWeight: () => void;
  filterHistory: () => void;
  openPlanModal: () => void;
  closePlanModal: () => void;
  toggleExerciseOption: (el: HTMLElement) => void;
  savePlan: () => void;
  deletePlan: (i: number) => void;
  startWorkout: (i: number) => void;
  renderHistory: () => void;
  renderPlans: () => void;
  createLogbookCustomExercise: () => void;
  loadLogbookSelect: () => void;
  renderLogbookSets: () => void;
  LogbookModule: Record<string, unknown>;
}

// ---- Canvas helpers ----
interface HTMLElement {
  getContext?: (id: string) => CanvasRenderingContext2D | null;
}
interface HTMLCanvasElement {
  width: number;
  height: number;
}
