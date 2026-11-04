import { Game } from "./engine/game.js";
import { Input } from "./engine/input.js";
import { Sfx } from "./engine/sfx.js";
import { LEVELS } from "./levels/levels.js";
import { buildLevel } from "./levels/builder.js";
import { CHARACTERS, drawCharacterPreview } from "./sprites.js";
import { openTasks } from "./tasks/modal.js";
import { el } from "./tasks/util.js";
import { speech } from "./speech.js";
import { loadProgress, saveProgress, unitProgress } from "./storage.js";
import { unitBooks } from "./stickers.js";

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
const UNLOCK_ALL = params.has("all");

const input = new Input();
const sfx = new Sfx();
const progress = loadProgress();
let units = [];
let unit = null; // { id, title, tasks, books }
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

  renderCharacters();
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
  unit = { id, title: meta.title, tasks: data.tasks, books: unitBooks(data.tasks) };
  progress.lastUnit = id;
  saveProgress(progress);
  renderLevels();
}

// ---------- Menu ----------

function renderCharacters() {
  const box = $("characters");
  box.replaceChildren();
  for (const ch of CHARACTERS) {
    const canvas = el("canvas", { width: "24", height: "32" });
    drawCharacterPreview(canvas, ch);
    const card = el("button", { class: "card", type: "button" }, canvas, el("div", { class: "name", text: ch.name }), el("div", { class: "house", text: ch.house }));
    card.classList.toggle("selected", progress.character === ch.id);
    card.addEventListener("click", () => {
      progress.character = ch.id;
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
  for (const def of LEVELS) {
    const count = unit.tasks.filter((t) => t.level === def.n).length;
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
  const owned = new Set(unitProgress(progress, unit.id).stickers);
  const box = $("album");
  box.replaceChildren();
  for (const def of LEVELS) {
    const books = unit.books.filter((b) => b.level === def.n);
    if (!books.length) continue;
    const row = el("div", { class: "album-row" }, el("span", { class: "album-level", text: `Level ${def.n}` }));
    for (const b of books) row.append(stickerButton(b.sticker, owned.has(b.taskId)));
    box.append(row);
  }
  $("album-count").textContent = `${owned.size}/${unit.books.length}`;
}

function stickerButton(sticker, owned) {
  const b = el("button", { class: `sticker${owned ? "" : " missing"}`, type: "button", text: owned ? sticker.pic : "?" });
  b.addEventListener("click", () => speech.say(owned ? sticker.say : "Find this sticker in a magic book!"));
  return b;
}

const bookOf = (taskId) => unit.books.find((b) => b.taskId === taskId);
const hasSticker = (taskId) => unitProgress(progress, unit.id).stickers.includes(taskId);

function callBook(trigger) {
  const win = !hasSticker(trigger.taskIds[0]);
  toast(win ? "A magic book! Jump up and win a sticker!" : "A magic book! Jump up and open it!");
  speech.say(win ? "A magic book! Jump up and win a sticker!" : "A magic book! Jump up and open it!");
}

function wireButtons() {
  $("btn-pause").addEventListener("click", () => setPause(true));
  $("pause-resume").addEventListener("click", () => setPause(false));
  $("pause-menu").addEventListener("click", backToMenu);
  $("summary-menu").addEventListener("click", backToMenu);
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
  const def = LEVELS.find((l) => l.n === n);
  const tasks = unit.tasks.filter((t) => t.level === n);
  const character = CHARACTERS.find((c) => c.id === progress.character) ?? CHARACTERS[0];
  currentLevel = n;
  const map = buildLevel(def, tasks);
  // A book still holding its sticker shows it above the book.
  for (const tr of map.triggers) if (tr.kind === "book" && !hasSticker(tr.taskIds[0])) tr.sticker = bookOf(tr.taskIds[0])?.sticker.pic;
  levelStickers = [];
  game.load(def, map, character, tasks.length);
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
  const tasks = trigger.taskIds.map((id) => unit.tasks.find((t) => t.id === id));
  const allTasks = unit.tasks.filter((t) => t.level === currentLevel);
  const label = (i) => {
    if (trigger.kind === "sphinx") return `The Sphinx asks · Question ${i + 1} of ${tasks.length}`;
    const pos = allTasks.indexOf(tasks[i]) + 1;
    if (trigger.kind === "book") return `Magic book (bonus) · Task ${pos} of ${allTasks.length}`;
    return `Magic door · Task ${pos} of ${allTasks.length}`;
  };
  if (trigger.kind === "sphinx") {
    toast("The Sphinx: “Answer my questions, then you may pass!”");
    speech.say("I am the Sphinx! Answer my questions, then you may pass!");
    await new Promise((r) => setTimeout(r, 3500));
  }
  const results = await openTasks(tasks, { label, onProgress, sfx });
  if (trigger.kind === "book") rewardBook(trigger, results);
  return results;
}

// After a magic book: a sticker for a right answer (first or second try) and the super wizard.
function rewardBook(trigger, results) {
  const taskId = trigger.taskIds[0];
  const book = bookOf(taskId);
  const won = book && results.length && results.every((r) => r.stars > 0) && !hasSticker(taskId);
  if (won) {
    unitProgress(progress, unit.id).stickers.push(taskId);
    saveProgress(progress);
    levelStickers.push(book.sticker);
  }
  toast(won ? `New sticker! ${book.sticker.pic} · Super wizard! ✨` : "Super wizard! ✨");
  speech.say([won ? `You got a sticker! ${book.sticker.say[0].toUpperCase()}${book.sticker.say.slice(1)}!` : null, "You are a super wizard!"]);
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

  const total = unit.tasks.filter((t) => t.level === currentLevel).length;
  const firstTry = stats.results.filter((r) => r.firstTry).length;
  const mm = Math.floor(stats.seconds / 60);
  const ss = String(stats.seconds % 60).padStart(2, "0");
  const last = currentLevel >= LEVELS.length;

  $("summary-title").textContent = last ? `Unit ${Number(unit.id)} complete! 🎓` : `Level ${currentLevel} complete! 🎉`;
  speech.say(last ? `Hooray${progress.name ? `, ${progress.name}` : ""}! You finished the whole unit! You are a real wizard!` : `Well done${progress.name ? `, ${progress.name}` : ""}! Level ${currentLevel} complete!`);
  const stat = (value, label) => el("div", { class: "stat" }, el("div", { class: "value", text: value }), el("div", { class: "label", text: label }));
  $("summary-stats").replaceChildren(
    stat(`★ ${stats.stars}`, "Stars"),
    stat(`${firstTry}/${total}`, "right the first time"),
    stat(`${mm}:${ss}`, "Time"),
  );
  const books = unit.books.filter((b) => b.level === currentLevel);
  if (books.length) {
    const owned = books.filter((b) => hasSticker(b.taskId)).length;
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
