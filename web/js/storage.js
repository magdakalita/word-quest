// Player progress in localStorage. Every access is guarded – the game also works without storage.

const KEY = "wordquest.progress";

export function loadProgress() {
  try {
    const p = JSON.parse(localStorage.getItem(KEY));
    if (p && typeof p === "object") return { name: "", character: "mila", units: {}, ...p };
  } catch {
    // ignore
  }
  return { name: "", character: "mila", units: {} };
}

export function saveProgress(p) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // ignore
  }
}

export function unitProgress(p, id) {
  p.units[id] ??= { unlocked: 1, best: {} };
  return p.units[id];
}
