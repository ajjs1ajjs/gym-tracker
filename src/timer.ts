import { vibrate, playBeep } from "./utils.js";

let timerInterval: ReturnType<typeof setInterval> | null = null;
let timerSeconds = 90;
let timerRunning = false;
let timerDefaultSeconds = 90;
let targetEndTime = 0;

function openTimerModal(): void {
  const modal = document.getElementById("timer-modal");
  if (modal) modal.style.display = "flex";
  vibrate(30);

  const soundSelect = document.getElementById(
    "timer-sound-select",
  ) as HTMLSelectElement | null;
  if (soundSelect) {
    soundSelect.value = localStorage.getItem("gym_timer_sound") || "classic";
  }

  if (!timerRunning) {
    resetTimer();
  } else {
    updateTimerDisplay();
    const startBtn = document.getElementById("timer-start-btn");
    const pauseBtn = document.getElementById("timer-pause-btn");
    if (startBtn) startBtn.style.display = "none";
    if (pauseBtn) pauseBtn.style.display = "inline-block";
  }
}

function closeTimerModal(): void {
  const modal = document.getElementById("timer-modal");
  if (modal) modal.style.display = "none";
  vibrate(20);
  // Keep the timer running in the background when modal is closed
}

function setTimer(seconds: number, e: Event): void {
  timerDefaultSeconds = seconds;
  timerSeconds = seconds;
  updateTimerDisplay();
  document
    .querySelectorAll(".timer-preset")
    .forEach((btn) => btn.classList.remove("active"));
  if (e && e.target) {
    (e.target as HTMLElement).classList.add("active");
  }
}

function updateTimerDisplay(): void {
  const mins = Math.floor(timerSeconds / 60);
  const secs = timerSeconds % 60;
  const timeStr = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

  const modalDisplay = document.getElementById("timer-display");
  if (modalDisplay) {
    modalDisplay.textContent = timeStr;
  }

  const headerBtn = document.getElementById("header-timer-btn");
  if (headerBtn) {
    if (timerRunning && timerSeconds > 0) {
      headerBtn.textContent = `⏱ ${timeStr}`;
    } else {
      headerBtn.textContent = `⏱`;
    }
  }
}

function startTimer(): void {
  if (timerRunning) return;
  timerRunning = true;
  targetEndTime = Date.now() + timerSeconds * 1000;
  
  const startBtn = document.getElementById("timer-start-btn");
  const pauseBtn = document.getElementById("timer-pause-btn");
  if (startBtn) startBtn.style.display = "none";
  if (pauseBtn) pauseBtn.style.display = "inline-block";
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    const remaining = Math.max(0, Math.ceil((targetEndTime - Date.now()) / 1000));
    timerSeconds = remaining;
    
    if (timerSeconds > 0) {
      updateTimerDisplay();
    } else {
      clearInterval(timerInterval!);
      timerInterval = null;
      timerRunning = false;
      if (Notification.permission === "granted") {
        new Notification("GymProgress", { body: "Час відпочинку закінчився!" });
      }
      playBeep();
      vibrate([500, 200, 500]);

      const startBtn2 = document.getElementById("timer-start-btn");
      const pauseBtn2 = document.getElementById("timer-pause-btn");
      if (startBtn2) startBtn2.style.display = "inline-block";
      if (pauseBtn2) pauseBtn2.style.display = "none";
      updateTimerDisplay();
    }
  }, 200);
}

function pauseTimer(): void {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  timerRunning = false;
  timerSeconds = Math.max(0, Math.ceil((targetEndTime - Date.now()) / 1000));
  const startBtn = document.getElementById("timer-start-btn");
  const pauseBtn = document.getElementById("timer-pause-btn");
  if (startBtn) startBtn.style.display = "inline-block";
  if (pauseBtn) pauseBtn.style.display = "none";
  updateTimerDisplay();
}

function resetTimer(): void {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  timerRunning = false;
  timerSeconds = timerDefaultSeconds;
  updateTimerDisplay();
  const startBtn = document.getElementById("timer-start-btn");
  const pauseBtn = document.getElementById("timer-pause-btn");
  if (startBtn) startBtn.style.display = "inline-block";
  if (pauseBtn) pauseBtn.style.display = "none";
}

export {
  openTimerModal,
  closeTimerModal,
  setTimer,
  startTimer,
  pauseTimer,
  resetTimer,
  updateTimerDisplay,
};
