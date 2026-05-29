import type { LogEntry } from "./types.js";

function safeJSONParse(str: string, fallback: unknown = null): unknown {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

function formatDate(timestamp: string): string {
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

function calculate1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

function vibrate(pattern: number | number[] = 50): void {
  if ("vibrate" in navigator) {
    const p = Array.isArray(pattern) ? pattern : [pattern];
    navigator.vibrate(p);
  }
}

let audioCtx: AudioContext | null = null;

function initAudio(): void {
  if (audioCtx) return;
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    audioCtx = new AudioContextClass();
    const ctx = audioCtx;
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
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
    document.body.addEventListener(evt, initAudio, { once: true }),
  );
}

function playBeep(): void {
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
  } catch (_e) {
    /* silently ignore audio errors */
  }
}

function celebration(): void {
  if (typeof confetti !== "function") return;
  const duration = 3 * 1000;
  const end = Date.now() + duration;
  let iterations = 0;
  const MAX_FRAMES = 300;
  (function frame() {
    if (iterations++ >= MAX_FRAMES) return;
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

let wakeLock: { release(): Promise<void> } | null = null;

async function requestWakeLock(): Promise<void> {
  try {
    if ("wakeLock" in navigator) {
      wakeLock = await navigator.wakeLock.request("screen");
    }
  } catch (err: unknown) {
    const e = err as { name: string; message: string };
    console.log(`${e.name}, ${e.message}`);
  }
}

function releaseWakeLock(): void {
  if (wakeLock !== null) {
    wakeLock.release().catch(() => {
      /* ignore release errors */
    });
    wakeLock = null;
  }
}

function requestNotifications(): void {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}

const DIFFICULTY_CLASS: Record<string, string> = {
  Легкий: "easy",
  Середній: "medium",
  Складний: "hard",
};

function diffClass(difficulty: string): string {
  return DIFFICULTY_CLASS[difficulty] ?? difficulty;
}

function escapeHtml(str: string): string {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

function showToast(
  message: string,
  type: "success" | "error" | "info" | "warning" = "info",
  duration = 4000,
): void {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const icons: Record<string, string> = {
    success: "✅",
    error: "❌",
    info: "ℹ️",
    warning: "⚠️",
  };
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || ""}</span><span class="toast-message">${escapeHtml(message)}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => {
      if (toast.parentNode) toast.remove();
    }, 300);
  }, duration);
}

async function deriveKey(
  passphrase: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(passphrase) as BufferSource,
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as unknown as BufferSource,
      iterations: 600000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

async function encryptData(
  plaintext: string,
  passphrase: string,
): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);
  const encoder = new TextEncoder();
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as unknown as BufferSource },
    key,
    encoder.encode(plaintext) as BufferSource,
  );
  const combined = new Uint8Array(
    1 + salt.length + iv.length + ciphertext.byteLength,
  );
  combined[0] = 1;
  combined.set(salt, 1);
  combined.set(iv, 1 + salt.length);
  combined.set(new Uint8Array(ciphertext), 1 + salt.length + iv.length);
  let bin = "";
  for (let i = 0; i < combined.length; i++)
    bin += String.fromCharCode(combined[i]);
  return btoa(bin);
}

async function decryptData(
  ciphertextB64: string,
  passphrase: string,
): Promise<string | null> {
  try {
    const combined = Uint8Array.from(atob(ciphertextB64), (c) =>
      c.charCodeAt(0),
    );
    if (combined[0] !== 1) return null;
    const salt = combined.slice(1, 17);
    const iv = combined.slice(17, 29);
    const data = combined.slice(29);
    const key = await deriveKey(passphrase, salt);
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv as unknown as BufferSource },
      key,
      data as unknown as BufferSource,
    );
    return new TextDecoder().decode(decrypted);
  } catch {
    return null;
  }
}

function getEncryptionPassphrase(): string | null {
  const p = sessionStorage.getItem("gym_encrypt_passphrase");
  return p && p.length >= 8 ? p : null;
}

function setEncryptionPassphrase(passphrase: string): void {
  if (passphrase.length >= 8) {
    sessionStorage.setItem("gym_encrypt_passphrase", passphrase);
  }
}

function clearEncryptionPassphrase(): void {
  sessionStorage.removeItem("gym_encrypt_passphrase");
}

function getLastSessionSets(logs: LogEntry[]): LogEntry[] {
  if (!logs || logs.length === 0) return [];
  const today = new Date().toDateString();

  // Group sets by date string (ignoring time)
  const groups: Record<string, LogEntry[]> = {};
  logs.forEach((log) => {
    const dateStr = new Date(log.date).toDateString();
    if (dateStr === today) return; // skip today's logged sets
    if (!groups[dateStr]) groups[dateStr] = [];
    groups[dateStr].push(log);
  });

  const dates = Object.keys(groups);
  if (dates.length === 0) return [];

  // Sort dates descending to get the most recent one before today
  dates.sort((a, b) => +new Date(b) - +new Date(a));
  const lastDate = dates[0];
  return groups[lastDate];
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
  showToast,
  escapeHtml,
  encryptData,
  decryptData,
  getEncryptionPassphrase,
  setEncryptionPassphrase,
  clearEncryptionPassphrase,
  getLastSessionSets,
};
