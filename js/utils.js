function safeJSONParse(str, fallback = null) {
  try { return JSON.parse(str); } catch { return fallback; }
}

function formatDate(timestamp) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function calculate1RM(weight, reps) {
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

function vibrate(pattern = [50]) {
  if ("vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}

let audioCtx = null;

function initAudio() {
  if (audioCtx) return;
  if (typeof window === "undefined") return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
    const buffer = audioCtx.createBuffer(1, 1, 22050);
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
    if (source.start) source.start(0);
    ["touchstart", "touchend", "click"].forEach((evt) =>
      document.body.removeEventListener(evt, initAudio),
    );
  } catch (e) {
    console.log("Audio init failed", e);
  }
}

if (typeof document !== "undefined" && document.body) {
  ["touchstart", "touchend", "click"].forEach((evt) =>
    document.body.addEventListener(evt, initAudio),
  );
}

function playBeep() {
  if (!audioCtx) initAudio();
  if (!audioCtx) return;
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  try {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioCtx.currentTime + 0.5,
    );
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.5);
  } catch (e) {}
}

function celebration() {
  if (typeof confetti !== "function") return;
  const duration = 3 * 1000;
  const end = Date.now() + duration;
  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ["#00d4ff", "#28a745", "#ffc107"],
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ["#00d4ff", "#28a745", "#ffc107"],
    });
    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
  vibrate([200, 100, 200, 100, 200]);
}

let wakeLock = null;

async function requestWakeLock() {
  try {
    if ("wakeLock" in navigator) {
      wakeLock = await navigator.wakeLock.request("screen");
    }
  } catch (err) {
    console.log(`${err.name}, ${err.message}`);
  }
}

function releaseWakeLock() {
  if (wakeLock !== null) {
    wakeLock.release();
    wakeLock = null;
  }
}

const DIFFICULTY_CLASS = {
  "Легкий": "easy",
  "Середній": "medium",
  "Складний": "hard",
};

function diffClass(difficulty) {
  return DIFFICULTY_CLASS[difficulty] || "medium";
}

function requestNotifications() {
  if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
  }
}

export {
  safeJSONParse,
  formatDate,
  calculate1RM,
  vibrate,
  initAudio,
  playBeep,
  celebration,
  requestWakeLock,
  releaseWakeLock,
  diffClass,
  requestNotifications,
};
