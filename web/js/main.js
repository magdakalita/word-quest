import { Game } from "./engine/game.js";
import { Input } from "./engine/input.js";
import { Sfx } from "./engine/sfx.js";
import { LEVELS } from "./levels/levels.js";
import { buildLevel } from "./levels/builder.js";
import { drawCharacterPreview } from "./sprites.js";
import { WORLDS, worldById, levelDef } from "./worlds.js";
import { openTasks } from "./tasks/modal.js";
import { el } from "./tasks/util.js";
import { speech } from "./speech.js";
import { loadProgress, saveProgress, resetProgress, unitProgress, worldStickers } from "./storage.js";
import { unitBooks } from "./stickers.js";
import { levelSlots, drawLevel } from "./pool.js";

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
const UNLOCK_ALL = params.has("all");

const input = new Input();
const sfx = new Sfx();
const progress = loadProgress();
let units = [];
let world = worldById(params.get("world") ?? progress.world);
let unit = null; // { id, title, data, books } – the books hold the stickers of the current world
let levelTasks = []; // the tasks drawn for the doors of the current level, in order
let levelStickers = []; // stickers won on the current level
let currentLevel = null;
let toastTimer = null;

const game = new Game($("game"), input, sfx, {
  onTask: runTasks,
  onFinish: showSummary,
  onHud: updateHud,
  onToast: toast,
  onBookNear: callBook,
});
if (params.has("debug")) window.spiel = { game, startLevel: (n) => startLevel(n) };

// ---------- Boot ----------

async function boot() {
  input.bindTouch($("touch"));
  units = await fetchJson("data/units.json");
  const select = $("unit-select");
  for (const u of units) select.append(el("option", { value: u.id, text: `Unit ${Number(u.id)} – ${u.title}` }));
  const wanted = params.get("unit") ?? progress.lastUnit ?? units.at(-1).id;
  select.value = units.some((u) => u.id === wanted) ? wanted : units.at(-1).id;
  select.addEventListener("change", () => selectUnit(select.value));

  $("player-name").value = progress.name;
  $("player-name").addEventListener("input", (e) => {
    progress.name = e.target.value.trim();
    saveProgress(progress);
  });

  renderWorlds();
  applyWorld();
  await selectUnit(select.value);
  wireButtons();
}

async function fetchJson(url) {
  const res = await fetch(url, { cache: "no-cache" });
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  return res.json();
}

async function selectUnit(id) {
  const meta = units.find((u) => u.id === id);
  const data = await fetchJson(`data/${meta.file}`);
  unit = { id, title: meta.title, data, books: unitBooks(data, world.stickers) };
  progress.lastUnit = id;
  saveProgress(progress);
  renderLevels();
}

// ---------- Menu ----------

function renderWorlds() {
  const box = $("worlds");
  box.replaceChildren();
  for (const w of WORLDS) {
    const card = el("button", { class: "card world", type: "button" }, el("div", { class: "world-pic", text: w.pic }), el("div", { class: "name", text: w.name }));
    card.classList.toggle("selected", w === world);
    card.addEventListener("click", () => {
      speech.say(w.name);
      if (w === world) return;
      world = w;
      progress.world = w.id;
      saveProgress(progress);
      renderWorlds();
      applyWorld();
      unit.books = unitBooks(unit.data, world.stickers);
      renderLevels();
    });
    box.append(card);
  }
}

// The menu dressed for the current world: its look, subtitle and heroes.
function applyWorld() {
  document.body.dataset.world = world.id;
  $("menu-subtitle").textContent = world.subtitle;
  $("hero-heading").textContent = world.chooseHero;
  renderCharacters();
}

const heroOf = () => world.characters.find((c) => c.id === progress.heroes[world.id]) ?? world.characters[0];

function renderCharacters() {
  const box = $("characters");
  box.replaceChildren();
  const chosen = heroOf();
  for (const ch of world.characters) {
    const canvas = el("canvas", { width: "24", height: "32" });
    drawCharacterPreview(canvas, ch);
    const card = el("button", { class: "card", type: "button" }, canvas, el("div", { class: "name", text: ch.name }), el("div", { class: "house", text: ch.house }));
    card.classList.toggle("selected", chosen === ch);
    card.addEventListener("click", () => {
      progress.heroes[world.id] = ch.id;
      saveProgress(progress);
      speech.say(ch.name);
      renderCharacters();
    });
    box.append(card);
  }
}

function renderLevels() {
  const box = $("levels");
  box.replaceChildren();
  const up = unitProgress(progress, unit.id);
  for (const { n } of LEVELS) {
    const def = levelDef(world, n);
    const count = levelSlots(unit.data, def.n).length;
    const locked = !UNLOCK_ALL && def.n > up.unlocked;
    const best = up.best[def.n];
    const card = el("button", { class: `card${locked ? " locked" : ""}`, type: "button" },
      el("div", { class: "num", text: `Level ${def.n}${locked ? " 🔒" : ""}` }),
      el("div", { class: "title", text: def.title }),
      el("div", { class: "topic", text: `${def.topic} · ${count} tasks` }),
      best !== undefined ? el("div", { class: "best", text: `★ ${best}` }) : null,
    );
    card.disabled = locked || count === 0;
    card.addEventListener("click", () => startLevel(def.n));
    box.append(card);
  }
  renderAlbum();
}

// The sticker album: one row per level, a grey "?" for every sticker still hidden in a book.
function renderAlbum() {
  const owned = new Set(worldStickers(progress, unit.id, world.id));
  const box = $("album");
  box.replaceChildren();
  for (const def of LEVELS) {
    const books = unit.books.filter((b) => b.level === def.n);
    if (!books.length) continue;
    const row = el("div", { class: "album-row" }, el("span", { class: "album-level", text: `Level ${def.n}` }));
    for (const b of books) row.append(stickerButton(b.sticker, owned.has(b.slot)));
    box.append(row);
  }
  $("album-count").textContent = `${owned.size}/${unit.books.length}`;
}

function stickerButton(sticker, owned) {
  const b = el("button", { class: `sticker${owned ? "" : " missing"}`, type: "button", text: owned ? sticker.pic : "?" });
  b.addEventListener("click", () => speech.say(owned ? sticker.say : world.text.stickerHidden));
  return b;
}

const bookOf = (slot) => unit.books.find((b) => b.slot === slot);
const hasSticker = (slot) => worldStickers(progress, unit.id, world.id).includes(slot);

function callBook(trigger) {
  const msg = hasSticker(trigger.slots[0]) ? world.text.bonusNear : world.text.bonusNearSticker;
  toast(msg);
  speech.say(msg);
}

function wireButtons() {
  $("btn-pause").addEventListener("click", () => setPause(true));
  $("pause-resume").addEventListener("click", () => setPause(false));
  $("pause-menu").addEventListener("click", backToMenu);
  $("summary-menu").addEventListener("click", backToMenu);
  $("btn-reset").addEventListener("click", () => {
    if (!confirm("Start again from the beginning? All unlocked levels, stars and stickers will be lost.")) return;
    resetProgress(progress);
    renderLevels();
  });
  $("summary-next").addEventListener("click", () => {
    if (currentLevel < LEVELS.length) startLevel(currentLevel + 1);
    else backToMenu();
  });
  $("btn-sound").addEventListener("click", (e) => {
    sfx.muted = !sfx.muted;
    speech.muted = sfx.muted;
    if (speech.muted) speech.stop();
    e.currentTarget.classList.toggle("off", sfx.muted);
  });
  window.addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || currentLevel === null) return;
    if (!$("pause").hidden) setPause(false);
    else if (game.mode === "play") setPause(true);
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && game.mode === "play") setPause(true);
  });
}

// ---------- Playing ----------

function startLevel(n) {
  const def = levelDef(world, n);
  // New tasks every game: one drawn for each door (see pool.js).
  levelTasks = drawLevel(unit.data, n, unitProgress(progress, unit.id).bags);
  saveProgress(progress);
  currentLevel = n;
  const map = buildLevel(def, levelTasks);
  // A book still holding its sticker shows it above the book.
  for (const tr of map.triggers) if (tr.kind === "book" && !hasSticker(tr.slots[0])) tr.sticker = bookOf(tr.slots[0])?.sticker.pic;
  levelStickers = [];
  game.load(def, map, heroOf(), levelTasks.length, world);
  for (const id of ["menu", "summary", "pause", "task"]) $(id).hidden = true;
  $("hud").hidden = false;
  $("hud-level").textContent = `Level ${n} · ${def.title}`;
  $("touch").hidden = !matchMedia("(pointer: coarse)").matches;
  input.enabled = true;
  game.start();
  toast(`${def.title} – ${def.topic}`);
  // Speaking right after the click also unlocks the voice and the letter sounds on iPad/iPhone.
  speech.unlock();
  speech.say(def.say);
}

function setPause(paused) {
  game.setPaused(paused);
  $("pause").hidden = !paused || game.mode !== "pause";
}

function backToMenu() {
  game.stop();
  game.mode = "idle";
  input.enabled = false;
  currentLevel = null;
  speech.stop();
  for (const id of ["summary", "pause", "task", "hud", "touch"]) $(id).hidden = true;
  $("menu").hidden = false;
  renderLevels();
}

async function runTasks(trigger, onProgress) {
  const tasks = trigger.taskIds.map((id) => levelTasks.find((t) => t.id === id));
  const label = (i) => {
    if (trigger.kind === "sphinx") return `${world.text.boss} · Question ${i + 1} of ${tasks.length}`;
    const pos = levelTasks.indexOf(tasks[i]) + 1;
    if (trigger.kind === "book") return `${world.text.bonus} · Task ${pos} of ${levelTasks.length}`;
    return `${world.text.door} · Task ${pos} of ${levelTasks.length}`;
  };
  if (trigger.kind === "sphinx") {
    toast(world.text.bossToast);
    speech.say(world.text.bossSay);
    await new Promise((r) => setTimeout(r, 3500));
  }
  const results = await openTasks(tasks, { label, onProgress, sfx });
  if (trigger.kind === "book") rewardBook(trigger, results);
  return results;
}

// After a magic book: a sticker for a right answer (first or second try) and the super wizard
// (or the world's own super hero).
function rewardBook(trigger, results) {
  const slot = trigger.slots[0];
  const book = bookOf(slot);
  const won = book && results.length && results.every((r) => r.stars > 0) && !hasSticker(slot);
  if (won) {
    worldStickers(progress, unit.id, world.id).push(slot);
    saveProgress(progress);
    levelStickers.push(book.sticker);
  }
  toast(won ? `New sticker! ${book.sticker.pic} · ${world.text.power}` : world.text.power);
  speech.say([won ? `You got a sticker! ${book.sticker.say[0].toUpperCase()}${book.sticker.say.slice(1)}!` : null, world.text.powerSay]);
}

function updateHud(s) {
  $("hud-hearts").textContent = "♥".repeat(s.hearts) + "♡".repeat(s.maxHearts - s.hearts);
  $("hud-stars").textContent = `★ ${s.stars}`;
  $("hud-tasks").textContent = `✦ ${s.done}/${s.total}`;
  $("hud-power").hidden = !s.power;
  $("hud-power").textContent = `✨ ${s.power}`;
}

function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.hidden = true), 2800);
}

// ---------- Summary ----------

function showSummary(stats) {
  const up = unitProgress(progress, unit.id);
  up.unlocked = Math.max(up.unlocked, currentLevel + 1);
  up.best[currentLevel] = Math.max(up.best[currentLevel] ?? 0, stats.stars);
  saveProgress(progress);

  const total = levelTasks.length;
  const firstTry = stats.results.filter((r) => r.firstTry).length;
  const mm = Math.floor(stats.seconds / 60);
  const ss = String(stats.seconds % 60).padStart(2, "0");
  const last = currentLevel >= LEVELS.length;

  $("summary-title").textContent = last ? `Unit ${Number(unit.id)} complete! ${world.text.unitDone}` : `Level ${currentLevel} complete! 🎉`;
  speech.say(last ? `Hooray${progress.name ? `, ${progress.name}` : ""}! You finished the whole unit! ${world.text.unitDoneSay}` : `Well done${progress.name ? `, ${progress.name}` : ""}! Level ${currentLevel} complete!`);
  const stat = (value, label) => el("div", { class: "stat" }, el("div", { class: "value", text: value }), el("div", { class: "label", text: label }));
  $("summary-stats").replaceChildren(
    stat(`★ ${stats.stars}`, "Stars"),
    stat(`${firstTry}/${total}`, "right the first time"),
    stat(`${mm}:${ss}`, "Time"),
  );
  const books = unit.books.filter((b) => b.level === currentLevel);
  if (books.length) {
    const owned = books.filter((b) => hasSticker(b.slot)).length;
    $("summary-stats").append(stat(`${owned}/${books.length}`, "stickers"));
  }
  $("summary-stickers").hidden = !levelStickers.length;
  $("summary-stickers").replaceChildren(
    el("span", { class: "label", text: "New stickers:" }),
    ...levelStickers.map((st) => stickerButton(st, true)),
  );

  $("summary-next").textContent = last ? "Menu" : "Next level ➜";
  $("hud").hidden = true;
  $("touch").hidden = true;
  $("summary").hidden = false;
}

boot().catch((err) => {
  console.error(err);
  document.body.append(el("p", { style: "color:#fff;padding:20px", text: `Could not load the game: ${err.message}` }));
});
