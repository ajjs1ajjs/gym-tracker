import { t } from "./i18n.js";
import type { LogEntry } from "./types.js";

function safeJSONParse(str: string, fallback: unknown = null): unknown {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

// Like safeJSONParse but returns `undefined` on parse error, so callers
// can distinguish `null` (valid JSON literal) from a malformed input.
function safeJSONParseOrUndefined(str: string): unknown {
  try {
    return JSON.parse(str);
  } catch {
    return undefined;
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

// Unlocks the Web Audio API on the first user gesture (works around
// autoplay policies in Safari / Chrome).  Called once via click/touch
// listeners registered below; also called lazily by playBeep() as a
// fallback if a beep is requested before any gesture.
function _ensureAudioContext(): void {
  if (audioCtx) return;
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    audioCtx = new AudioContextClass();
    // Fire a short silent buffer to flip the context out of "suspended"
    // on iOS Safari.
    const buf = audioCtx.createBuffer(1, 1, 22050);
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    src.connect(audioCtx.destination);
    src.start(0);
  } catch (e) {
    console.log("Audio init failed", e);
  }
}

// One-shot unlock on the first user interaction (touch / click).
// { once: true } auto-removes the listener after the first invocation.
if (typeof document !== "undefined" && document.body) {
  ["touchstart", "touchend", "click"].forEach((evt) =>
    document.body.addEventListener(evt, _ensureAudioContext, { once: true }),
  );
}

let _lastBeepTime = 0;
const BEEP_DEBOUNCE_MS = 200;

function playBeep(soundName?: string): void {
  _ensureAudioContext();
  if (!audioCtx) return;
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  // Debounce — prevents oscillator pile-up when the timer fires while
  // the user is already double-clicking a preset button.
  const callTime = Date.now();
  if (callTime - _lastBeepTime < BEEP_DEBOUNCE_MS) return;
  _lastBeepTime = callTime;

  let sound = "classic";
  try {
    sound = soundName || localStorage.getItem("gym_timer_sound") || "classic";
  } catch (e) {
    console.log("Could not access localStorage for sound setting:", e);
  }
  const now = audioCtx.currentTime;

  try {
    if (sound === "classic") {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (sound === "double") {
      // First beep
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(880, now);
      gain1.gain.setValueAtTime(0.5, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc1.start(now);
      osc1.stop(now + 0.15);

      // Second beep
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880, now + 0.25);
      gain2.gain.setValueAtTime(0.5, now + 0.25);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc2.start(now + 0.25);
      osc2.stop(now + 0.4);
    } else if (sound === "low") {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (sound === "gong") {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = "triangle";
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 1.2);
      gain.gain.setValueAtTime(0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc.start(now);
      osc.stop(now + 1.2);
    } else if (sound === "melody") {
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      const step = 0.15;
      notes.forEach((freq, index) => {
        const osc = audioCtx!.createOscillator();
        const gain = audioCtx!.createGain();
        osc.connect(gain);
        gain.connect(audioCtx!.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + index * step);
        gain.gain.setValueAtTime(0.4, now + index * step);
        gain.gain.exponentialRampToValueAtTime(
          0.01,
          now + (index + 1) * step + (index === 2 ? 0.15 : 0),
        );
        osc.start(now + index * step);
        osc.stop(now + (index + 1) * step + (index === 2 ? 0.15 : 0));
      });
    }
  } catch (_e) {
    /* silently ignore audio errors */
  }
}

function celebration(): void {
  if (typeof confetti !== "function") return;
  const CONFETTI_DURATION_MS = 3 * 1000;
  const MAX_FRAMES = 300;
  const duration = CONFETTI_DURATION_MS;
  const end = Date.now() + duration;
  let iterations = 0;
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

function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    if (
      e instanceof DOMException &&
      (e.name === "QuotaExceededError" || e.name === "NS_ERROR_DOM_QUOTA_REACHED")
    ) {
      showToast(t('toast.storage_full'), "error", 6000);
    } else {
      showToast(t('toast.save_error', (e as Error).message), "error");
    }
    return false;
  }
}

function escapeHtml(str: string): string {
  // NB: must escape quotes too — values are interpolated into double-quoted
  // HTML attributes (e.g. src="...", data-id="..."), so an unescaped " allows
  // attribute breakout / DOM-XSS via imported or synced data.
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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
  const PBKDF2_ITERATIONS = 600_000;
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
      iterations: PBKDF2_ITERATIONS,
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
  return "#1#" + btoa(bin);
}

async function decryptData(
  ciphertextB64: string,
  passphrase: string,
): Promise<string | null> {
  try {
    const raw = ciphertextB64.startsWith("#1#") ? ciphertextB64.slice(3) : ciphertextB64;
    const combined = Uint8Array.from(atob(raw), (c) =>
      c.charCodeAt(0),
    );
    if (combined[0] !== 1) return null;
    // FIX #8: Validate buffer length to prevent corruption
    if (combined.length < 29) {
      console.error("Invalid encrypted data: buffer too short");
      return null;
    }
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

function getDateKey(d: Date): string {
  // UTC-based to keep date keys consistent across timezones
  // (critical for cloud-sync merge correctness).
  return d.toISOString().split("T")[0];
}

// Backward-compat alias — kept exported so existing consumers still compile.
const initAudio = _ensureAudioContext;

export {
  safeJSONParse,
  safeJSONParseOrUndefined,
  safeSetItem,
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
  getDateKey,
};
