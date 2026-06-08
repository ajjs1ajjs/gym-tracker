function safeJSONParse(str, fallback = null) {
    try {
        return JSON.parse(str);
    }
    catch {
        return fallback;
    }
}
function formatDate(timestamp) {
    if (!timestamp)
        return "";
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
    if (reps === 1)
        return weight;
    return Math.round(weight * (1 + reps / 30));
}
function vibrate(pattern = 50) {
    if ("vibrate" in navigator) {
        const p = Array.isArray(pattern) ? pattern : [pattern];
        navigator.vibrate(p);
    }
}
let audioCtx = null;
function initAudio() {
    if (audioCtx)
        return;
    if (typeof window === "undefined")
        return;
    try {
        const AudioContextClass = window.AudioContext ||
            window
                .webkitAudioContext;
        audioCtx = new AudioContextClass();
        const ctx = audioCtx;
        const buffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        if (source.start)
            source.start(0);
        ["touchstart", "touchend", "click"].forEach((evt) => document.body.removeEventListener(evt, initAudio));
    }
    catch (e) {
        console.log("Audio init failed", e);
    }
}
if (typeof document !== "undefined" && document.body) {
    ["touchstart", "touchend", "click"].forEach((evt) => document.body.addEventListener(evt, initAudio, { once: true }));
}
function playBeep(soundName) {
    if (!audioCtx)
        initAudio();
    if (!audioCtx)
        return;
    if (audioCtx.state === "suspended") {
        audioCtx.resume();
    }
    const sound = soundName || localStorage.getItem("gym_timer_sound") || "classic";
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
        }
        else if (sound === "double") {
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
        }
        else if (sound === "low") {
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
        }
        else if (sound === "gong") {
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
        }
        else if (sound === "melody") {
            const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
            const step = 0.15;
            notes.forEach((freq, index) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.type = "sine";
                osc.frequency.setValueAtTime(freq, now + index * step);
                gain.gain.setValueAtTime(0.4, now + index * step);
                gain.gain.exponentialRampToValueAtTime(0.01, now + (index + 1) * step + (index === 2 ? 0.15 : 0));
                osc.start(now + index * step);
                osc.stop(now + (index + 1) * step + (index === 2 ? 0.15 : 0));
            });
        }
    }
    catch (_e) {
        /* silently ignore audio errors */
    }
}
function celebration() {
    if (typeof confetti !== "function")
        return;
    const duration = 3 * 1000;
    const end = Date.now() + duration;
    let iterations = 0;
    const MAX_FRAMES = 300;
    (function frame() {
        if (iterations++ >= MAX_FRAMES)
            return;
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
    }
    catch (err) {
        const e = err;
        console.log(`${e.name}, ${e.message}`);
    }
}
function releaseWakeLock() {
    if (wakeLock !== null) {
        wakeLock.release().catch(() => {
            /* ignore release errors */
        });
        wakeLock = null;
    }
}
function requestNotifications() {
    if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
    }
}
const DIFFICULTY_CLASS = {
    Легкий: "easy",
    Середній: "medium",
    Складний: "hard",
};
function diffClass(difficulty) {
    return DIFFICULTY_CLASS[difficulty] ?? difficulty;
}
function safeSetItem(key, value) {
    try {
        localStorage.setItem(key, value);
        return true;
    }
    catch (e) {
        if (e instanceof DOMException &&
            (e.name === "QuotaExceededError" || e.name === "NS_ERROR_DOM_QUOTA_REACHED")) {
            showToast("Недостатньо місця у сховищі. Зробіть експорт та очистіть дані.", "error", 6000);
        }
        else {
            showToast("Помилка збереження даних: " + e.message, "error");
        }
        return false;
    }
}
function escapeHtml(str) {
    const div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}
function showToast(message, type = "info", duration = 4000) {
    const container = document.getElementById("toast-container");
    if (!container)
        return;
    const icons = {
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
            if (toast.parentNode)
                toast.remove();
        }, 300);
    }, duration);
}
async function deriveKey(passphrase, salt) {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(passphrase), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey({
        name: "PBKDF2",
        salt: salt,
        iterations: 600000,
        hash: "SHA-256",
    }, keyMaterial, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}
async function encryptData(plaintext, passphrase) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(passphrase, salt);
    const encoder = new TextEncoder();
    const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, encoder.encode(plaintext));
    const combined = new Uint8Array(1 + salt.length + iv.length + ciphertext.byteLength);
    combined[0] = 1;
    combined.set(salt, 1);
    combined.set(iv, 1 + salt.length);
    combined.set(new Uint8Array(ciphertext), 1 + salt.length + iv.length);
    let bin = "";
    for (let i = 0; i < combined.length; i++)
        bin += String.fromCharCode(combined[i]);
    return "#1#" + btoa(bin);
}
async function decryptData(ciphertextB64, passphrase) {
    try {
        const raw = ciphertextB64.startsWith("#1#") ? ciphertextB64.slice(3) : ciphertextB64;
        const combined = Uint8Array.from(atob(raw), (c) => c.charCodeAt(0));
        if (combined[0] !== 1)
            return null;
        const salt = combined.slice(1, 17);
        const iv = combined.slice(17, 29);
        const data = combined.slice(29);
        const key = await deriveKey(passphrase, salt);
        const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, data);
        return new TextDecoder().decode(decrypted);
    }
    catch {
        return null;
    }
}
function getEncryptionPassphrase() {
    const p = sessionStorage.getItem("gym_encrypt_passphrase");
    return p && p.length >= 8 ? p : null;
}
function setEncryptionPassphrase(passphrase) {
    if (passphrase.length >= 8) {
        sessionStorage.setItem("gym_encrypt_passphrase", passphrase);
    }
}
function clearEncryptionPassphrase() {
    sessionStorage.removeItem("gym_encrypt_passphrase");
}
function getLastSessionSets(logs) {
    if (!logs || logs.length === 0)
        return [];
    const today = new Date().toDateString();
    // Group sets by date string (ignoring time)
    const groups = {};
    logs.forEach((log) => {
        const dateStr = new Date(log.date).toDateString();
        if (dateStr === today)
            return; // skip today's logged sets
        if (!groups[dateStr])
            groups[dateStr] = [];
        groups[dateStr].push(log);
    });
    const dates = Object.keys(groups);
    if (dates.length === 0)
        return [];
    // Sort dates descending to get the most recent one before today
    dates.sort((a, b) => +new Date(b) - +new Date(a));
    const lastDate = dates[0];
    return groups[lastDate];
}
export { safeJSONParse, safeSetItem, formatDate, calculate1RM, vibrate, initAudio, playBeep, celebration, requestWakeLock, releaseWakeLock, diffClass, requestNotifications, showToast, escapeHtml, encryptData, decryptData, getEncryptionPassphrase, setEncryptionPassphrase, clearEncryptionPassphrase, getLastSessionSets, };
