import { vibrate, playBeep } from "./utils.js";

let timerInterval = null;
let timerSeconds = 90;
let timerRunning = false;
let timerDefaultSeconds = 90;

function openTimerModal() {
  const modal = document.getElementById("timer-modal");
  if (modal) modal.style.display = "flex";
  vibrate(30);
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

function closeTimerModal() {
  const modal = document.getElementById("timer-modal");
  if (modal) modal.style.display = "none";
  vibrate(20);
}

function setTimer(seconds, e) {
  timerDefaultSeconds = seconds;
  timerSeconds = seconds;
  updateTimerDisplay();
  document
    .querySelectorAll(".timer-preset")
    .forEach((btn) => btn.classList.remove("active"));
  if (e && e.target) {
    e.target.classList.add("active");
  }
}

function updateTimerDisplay() {
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

function startTimer() {
  if (timerRunning) return;
  timerRunning = true;
  const startBtn = document.getElementById("timer-start-btn");
  const pauseBtn = document.getElementById("timer-pause-btn");
  if (startBtn) startBtn.style.display = "none";
  if (pauseBtn) pauseBtn.style.display = "inline-block";
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    if (timerSeconds > 0) {
      timerSeconds--;
      updateTimerDisplay();
    } else {
      clearInterval(timerInterval);
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
  }, 1000);
}

function pauseTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  timerRunning = false;
  const startBtn = document.getElementById("timer-start-btn");
  const pauseBtn = document.getElementById("timer-pause-btn");
  if (startBtn) startBtn.style.display = "inline-block";
  if (pauseBtn) pauseBtn.style.display = "none";
  updateTimerDisplay();
}

function resetTimer() {
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
