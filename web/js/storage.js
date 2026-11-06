// Player progress in localStorage. Every access is guarded – the game also works without storage.

const KEY = "wordquest.progress";

// heroes: the character chosen in each world. Unlocked levels and best stars are shared by
// all worlds, the stickers are kept per world.
export function loadProgress() {
  let p = null;
  try {
    p = JSON.parse(localStorage.getItem(KEY));
  } catch {
    // ignore
  }
  if (!p || typeof p !== "object") p = {};
  p = { name: "", world: "castle", units: {}, ...p };
  p.heroes ??= { castle: p.character ?? "milo" }; // saved before there were worlds
  delete p.character;
  return p;
}

export function saveProgress(p) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // ignore
  }
}

// Start again: unlocked levels, best stars and stickers of every unit and world are gone.
// The name, the world and the chosen heroes stay.
export function resetProgress(p) {
  p.units = {};
  saveProgress(p);
}

export function unitProgress(p, id) {
  p.units[id] ??= { unlocked: 1, best: {} };
  const up = p.units[id];
  if (Array.isArray(up.stickers)) up.stickers = { castle: up.stickers }; // saved before there were worlds
  up.stickers ??= {};
  up.bags ??= {}; // the tasks of each group still to come – see pool.js
  return up;
}

// The slots of the solved magic books of a unit in a world (see pool.js). Saved before there
// were task pools, they were the ids of the books' tasks – the same names, so the stickers stay.
export function worldStickers(p, unitId, worldId) {
  const all = unitProgress(p, unitId).stickers;
  all[worldId] ??= [];
  return all[worldId];
}
