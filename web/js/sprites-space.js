// The space world: heroes, aliens, airlocks, star crystals, the robot guardian and outer space.
// Drawn in code like sprites.js, with the same helpers.

import { TILE, paint, cached, rand, drawMoon, drawHills } from "./sprites.js";

// ---------- Heroes ----------
// 12×14 grids on top of the shared legs (see LEGS in sprites.js); the legs are drawn in "b".

const NOVA = [
  "...WWWWWW...",
  "..WWWWWWWW..",
  "..WvvvvvvW..",
  "..WsessesW..",
  "..WvssssvW..",
  "...WWWWWW...",
  "...GGGGGG...",
  "..WWWooWWW..",
  ".WWWWWWWWWW.",
  ".GWWccccWWG.",
  "..WWWWWWWW..",
  "..WWWWWWWW..",
  "..WWWGGWWW..",
  "..GGGGGGGG..",
];

const KAI = [
  "...hhhhh....",
  "..hhhhhhh..L",
  "..hssssshh.L",
  "..hsesess..L",
  "..hsssssss.L",
  "...ssssss..L",
  "...tttttt..L",
  "..rrttttrr.L",
  ".rrrttttrrrL",
  ".srrttttrrsm",
  "..rrttttrr.m",
  "..rrryyrrr..",
  "..rrrRRrrr..",
  "..RRRRRRRR..",
];

const ZARK = [
  "...kkkkkk...",
  "..kkkkkkkk.L",
  "..kKKKKKKk.L",
  "..kkokkokk.L",
  "..kkkKKkkk.L",
  ".kkkKKKKkkkL",
  "..cckkkkcc.L",
  ".cckpqkkkccL",
  ".ckkkkkkkkcL",
  ".gkkkkkkkkgm",
  "cckkkkkkkkcm",
  "cckkkyykkkc.",
  "cckkkkkkkkc.",
  "ccKKKKKKKKc.",
];

const MOKO = [
  "............",
  "............",
  "...hgggggh..",
  ".g.gggggg.g.",
  ".ggggeggegg.",
  "..gggggggg..",
  "....gggg...w",
  "...rrrrrr..w",
  "..rrrrrrrr.w",
  "..rrrrrrrrgw",
  "..rrrrrrrr.w",
  "..rrrrrrrr.w",
  "..rrrRRrrr.w",
  "..RRRRRRRR.w",
];

export const SPACE_HEROES = [
  {
    id: "nova", name: "Nova", house: "Space explorer", body: NOVA,
    palette: { W: "#eef1f6", G: "#9aa3b2", v: "#2a5a8a", s: "#f1c9a5", e: "#1a1a1a", o: "#e8762b", c: "#3fa9f5", b: "#6b7080" },
  },
  {
    id: "kai", name: "Kai", house: "Star knight", body: KAI,
    palette: { h: "#6b4423", s: "#f3cfb0", e: "#1a1a1a", t: "#e6d6b0", r: "#8a5a2b", R: "#5e3a17", y: "#3a2a1a", L: "#8fd8ff", m: "#9aa3b2", b: "#3a2a1a" },
    sparkle: { x: 9, y: -30, w: 4, h: 14, color: "#cfefff" },
  },
  {
    id: "zark", name: "Lord Zark", house: "Dark lord", body: ZARK,
    palette: { k: "#26262f", K: "#4a4a5a", o: "#8a93a5", c: "#0c0c10", p: "#e03a3a", q: "#4cff6a", g: "#14141a", y: "#9aa3b2", L: "#ff5a5a", m: "#9aa3b2", b: "#111116" },
    sparkle: { x: 9, y: -30, w: 4, h: 14, color: "#ffc4c4" },
  },
  {
    id: "moko", name: "Master Moko", house: "Wise master", body: MOKO,
    palette: { g: "#7fae4a", h: "#e8e8e8", e: "#1a1a1a", r: "#b8996a", R: "#8a6e44", w: "#6b4423", b: "#5e8a3a" },
    sparkle: { x: 9, y: -22, w: 4, h: 6, color: "#b8f58a" },
  },
];

// ---------- Aliens, crystals ----------

const ALIEN = [
  "..y....y..",
  "...g..g...",
  "...gggg...",
  "..gggggg..",
  ".ggwwwwgg.",
  ".ggwwkwgg.",
  ".ggwwwwgg.",
  "gggggggggg",
  "ggggmmgggg",
  "g.gg..gg.g",
];

const CRYSTAL = [
  "....cccc....",
  "...cCCCCc...",
  "..cCWCCCCc..",
  ".cCWCCCCCCc.",
  "cccccccccccc",
  ".cCCCCCCCCc.",
  "..cCCCCCCc..",
  "...cCCCCc...",
  "....cCCc....",
  ".....cc.....",
];

const alienSprite = () => cached("space:alien", () => paint(ALIEN, { g: "#6fd65a", y: "#f5e36b", w: "#ffffff", k: "#1a1a2a", m: "#2a5a2a" }, 3));
const crystalSprite = () => cached("space:crystal", () => paint(CRYSTAL, { c: "#2a8fc9", C: "#7fe0ff", W: "#ffffff" }, 2));

function drawAlien(ctx, x, y, facingRight) {
  ctx.save();
  ctx.translate(x, y);
  if (facingRight) ctx.scale(-1, 1);
  ctx.drawImage(alienSprite(), -15, -2);
  ctx.restore();
}

// ---------- Themes & tiles ----------

export const SPACE_THEMES = {
  launchpad: {
    sky: ["#050818", "#101a3a", "#24305e"],
    ground: { top: "#5d6b80", topLight: "#9aa9bf", fill: "#2f3848", fillDark: "#1f2633", fillLight: "#465266" },
    block: { base: "#59657a", dark: "#3a4252", light: "#8592a8" },
    plank: { base: "#c9a227", dark: "#2a2a2a", light: "#f0d060" },
    outdoor: true,
  },
  station: {
    sky: ["#0b1220", "#121c30", "#1a2740"],
    ground: { top: "#3f5a78", topLight: "#7fd0f5", fill: "#26324a", fillDark: "#18213a", fillLight: "#34425e" },
    block: { base: "#4a5a75", dark: "#2c3850", light: "#7488a8" },
    plank: { base: "#8592a8", dark: "#3a4252", light: "#c0cadb" },
    outdoor: false,
  },
  planet: {
    sky: ["#1a0b2e", "#3d1a52", "#7a3b6e"],
    ground: { top: "#b0603a", topLight: "#e08a5a", fill: "#6e3a2a", fillDark: "#4e281c", fillLight: "#8a4c36" },
    block: { base: "#7a5a4a", dark: "#52392c", light: "#a07a64" },
    plank: { base: "#8592a8", dark: "#3a4252", light: "#c0cadb" },
    outdoor: true,
    rock: true,
  },
  darkstar: {
    sky: ["#05030a", "#170818", "#2e0c1e"],
    ground: { top: "#3a3a48", topLight: "#e05050", fill: "#22222c", fillDark: "#15151c", fillLight: "#33333f" },
    block: { base: "#3a3a48", dark: "#22222c", light: "#5a5a6e" },
    plank: { base: "#5a5a6e", dark: "#22222c", light: "#e05050" },
    outdoor: true,
  },
};

// Metal floor plates with rivets.
function platePattern(ctx, c) {
  ctx.fillStyle = c.fill;
  ctx.fillRect(0, 0, TILE, TILE);
  ctx.fillStyle = c.fillDark;
  ctx.fillRect(0, TILE - 2, TILE, 2);
  ctx.fillRect(TILE - 2, 0, 2, TILE);
  ctx.fillRect(0, TILE / 2 - 1, TILE, 1);
  ctx.fillStyle = c.fillLight;
  ctx.fillRect(0, 0, TILE, 1);
  for (const [x, y] of [[4, 4], [TILE - 7, 4], [4, TILE - 8], [TILE - 7, TILE - 8]]) ctx.fillRect(x, y, 3, 3);
}

// Alien rock with little craters.
function rockPattern(ctx, c) {
  ctx.fillStyle = c.fill;
  ctx.fillRect(0, 0, TILE, TILE);
  for (const [x, y, r] of [[8, 9, 4], [23, 20, 5], [12, 26, 2], [26, 6, 2]]) {
    ctx.fillStyle = c.fillDark;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = c.fillLight;
    ctx.fillRect(x - r + 1, y + r - 1, r, 2);
  }
}

function spaceTile(themeName, kind) {
  return cached(`space:tile:${themeName}:${kind}`, () => {
    const t = SPACE_THEMES[themeName];
    const c = document.createElement("canvas");
    c.width = TILE;
    c.height = TILE;
    const ctx = c.getContext("2d");
    if (kind === "ground-top" || kind === "ground") {
      (t.rock ? rockPattern : platePattern)(ctx, t.ground);
      if (kind === "ground-top") {
        ctx.fillStyle = t.ground.top;
        ctx.fillRect(0, 0, TILE, 7);
        ctx.fillStyle = t.ground.topLight;
        ctx.fillRect(0, 0, TILE, 2);
        if (!t.rock) for (let i = 2; i < TILE; i += 8) ctx.fillRect(i, 4, 4, 1);
      }
    } else if (kind === "block") {
      const b = t.block;
      ctx.fillStyle = b.base;
      ctx.fillRect(0, 0, TILE, TILE);
      ctx.fillStyle = b.light;
      ctx.fillRect(0, 0, TILE, 3);
      ctx.fillRect(0, 0, 3, TILE);
      ctx.fillStyle = b.dark;
      ctx.fillRect(0, TILE - 3, TILE, 3);
      ctx.fillRect(TILE - 3, 0, 3, TILE);
      if (t.rock) {
        ctx.fillRect(9, 8, 6, 3);
        ctx.fillRect(18, 19, 7, 3);
      } else {
        ctx.fillRect(6, 6, 20, 2);
        ctx.fillRect(6, 24, 20, 2);
        ctx.fillStyle = b.light;
        for (const [x, y] of [[6, 13], [23, 13]]) ctx.fillRect(x, y, 3, 3);
      }
    } else if (kind === "plank") {
      // a metal grate
      const p = t.plank;
      ctx.fillStyle = p.base;
      ctx.fillRect(0, 0, TILE, 10);
      ctx.fillStyle = p.light;
      ctx.fillRect(0, 0, TILE, 2);
      ctx.fillStyle = p.dark;
      for (let x = 2; x < TILE; x += 6) ctx.fillRect(x, 4, 3, 4);
      ctx.fillRect(0, 8, TILE, 2);
      ctx.fillRect(4, 10, 3, 6);
      ctx.fillRect(TILE - 7, 10, 3, 6);
    }
    return c;
  });
}

// ---------- Decorations ----------

function glow(ctx, x, y, r, rgb, alpha) {
  const g = ctx.createRadialGradient(x, y, 1, x, y, r);
  g.addColorStop(0, `rgba(${rgb},${alpha})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

function drawDecoration(ctx, d, x, y, t) {
  const blink = 0.5 + Math.sin(t * 3 + d.col) * 0.5;
  if (d.kind === "beacon") {
    ctx.fillStyle = "#3a4252";
    ctx.fillRect(x + 14, y + 6, 4, 26);
    ctx.fillRect(x + 10, y + 28, 12, 4);
    glow(ctx, x + 16, y + 4, 22, "255,80,80", 0.45 * blink);
    ctx.fillStyle = `rgba(255,${90 + blink * 80},${90 + blink * 60},1)`;
    ctx.beginPath();
    ctx.arc(x + 16, y + 4, 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (d.kind === "plant") {
    ctx.fillStyle = "#2f6b4a";
    ctx.fillRect(x + 15, y + 12, 3, 20);
    ctx.beginPath();
    ctx.ellipse(x + 10, y + 24, 7, 3, -0.5, 0, Math.PI * 2);
    ctx.ellipse(x + 23, y + 20, 7, 3, 0.5, 0, Math.PI * 2);
    ctx.fill();
    glow(ctx, x + 16, y + 10, 18, "200,120,255", 0.35 + blink * 0.2);
    ctx.fillStyle = "#c06bff";
    ctx.beginPath();
    ctx.arc(x + 16, y + 10, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f0d0ff";
    ctx.fillRect(x + 14, y + 7, 2, 2);
  } else if (d.kind === "lamp") {
    glow(ctx, x + 16, y + 14, 30, "120,220,255", 0.25 + blink * 0.1);
    ctx.fillStyle = "#3a4252";
    ctx.fillRect(x + 9, y + 8, 14, 10);
    ctx.fillStyle = "#bff0ff";
    ctx.fillRect(x + 11, y + 14, 10, 3);
  } else if (d.kind === "porthole") {
    const cx = x + 16;
    const cy = y + 26;
    ctx.fillStyle = "#5d6b80";
    ctx.beginPath();
    ctx.arc(cx, cy, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#050818";
    ctx.beginPath();
    ctx.arc(cx, cy, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.clip();
    ctx.fillStyle = "#fff";
    for (let i = 0; i < 6; i++) ctx.fillRect(cx - 12 + ((i * 7 + d.col * 3) % 24), cy - 12 + ((i * 11) % 24), 1, 1);
    const px = cx - 6 + Math.sin(t * 0.3 + d.col) * 4;
    ctx.fillStyle = ["#e8762b", "#3fa9f5", "#7fae4a"][d.col % 3];
    ctx.beginPath();
    ctx.arc(px, cy + 4, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = "#8592a8";
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ctx.fillRect(cx + Math.cos(a) * 18 - 1, cy + Math.sin(a) * 18 - 1, 2, 2);
    }
  } else if (d.kind === "screen") {
    ctx.fillStyle = "#2a3140";
    ctx.fillRect(x, y + 2, 32, 24);
    ctx.fillStyle = "#0d2a3a";
    ctx.fillRect(x + 3, y + 5, 26, 18);
    ctx.fillStyle = "#4cff6a";
    for (let i = 0; i < 5; i++) {
      const h = 3 + Math.abs(Math.sin(t * 2 + i * 1.3 + d.col)) * 12;
      ctx.fillRect(x + 5 + i * 5, y + 21 - h, 3, h);
    }
  } else if (d.kind === "crate") {
    ctx.fillStyle = "#5d6b80";
    ctx.fillRect(x + 4, y + 10, 24, 22);
    ctx.fillStyle = "#3a4252";
    ctx.fillRect(x + 4, y + 30, 24, 2);
    ctx.fillRect(x + 26, y + 10, 2, 22);
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = i % 2 ? "#2a2a2a" : "#f0c020";
      ctx.fillRect(x + 4 + i * 6, y + 10, 6, 4);
    }
    ctx.fillStyle = "#8592a8";
    ctx.fillRect(x + 10, y + 18, 12, 2);
    ctx.fillRect(x + 10, y + 24, 12, 2);
  }
}

// ---------- Airlock, robot guardian, teleporter ----------

function drawAirlock(ctx, x, y, open, t) {
  // 1 tile wide, 2 tiles tall
  ctx.fillStyle = "#2a3140";
  ctx.fillRect(x - 3, y - 3, TILE + 6, TILE * 2 + 3);
  if (open) {
    ctx.fillStyle = "#05080f";
    ctx.fillRect(x, y, TILE, TILE * 2);
    ctx.fillStyle = "rgba(90,220,255,0.15)";
    ctx.fillRect(x + 4, y + 4, TILE - 8, TILE * 2 - 4);
    ctx.fillStyle = "#4cff6a";
    ctx.fillRect(x + TILE / 2 - 3, y - 2, 6, 3);
    return;
  }
  ctx.fillStyle = "#6b7890";
  ctx.fillRect(x, y, TILE, TILE * 2);
  ctx.fillStyle = "#3d4658";
  ctx.fillRect(x + TILE / 2 - 1, y, 2, TILE * 2);
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = i % 2 ? "#2a2a2a" : "#f0c020";
    ctx.fillRect(x + i * 8, y + TILE * 2 - 6, 8, 6);
  }
  const pulse = 0.5 + Math.sin(t * 4) * 0.5;
  // the force field: bright lines running down the door
  for (let i = 0; i < 4; i++) {
    const ly = y + ((t * 30 + i * 16) % (TILE * 2 - 8));
    ctx.fillStyle = `rgba(120,230,255,${0.35 + pulse * 0.3})`;
    ctx.fillRect(x + 2, ly, TILE - 4, 2);
  }
  ctx.fillStyle = `rgba(255,70,70,${0.6 + pulse * 0.4})`;
  ctx.fillRect(x + TILE / 2 - 3, y + 26, 6, 6);
  ctx.fillStyle = `rgba(120,230,255,${0.12 * pulse})`;
  ctx.fillRect(x - 6, y - 6, TILE + 12, TILE * 2 + 6);
}

function drawRobot(ctx, x, y, solvedCount, total, t) {
  // occupies 2 tiles wide, 3 tall; (x, y) is the top-left
  const blink = 0.5 + Math.sin(t * 5) * 0.5;
  ctx.fillStyle = "#3a4252";
  ctx.fillRect(x + 31, y - 4, 2, 10);
  ctx.fillStyle = `rgba(255,80,80,${0.5 + blink * 0.5})`;
  ctx.beginPath();
  ctx.arc(x + 32, y - 6, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#8592a8";
  ctx.fillRect(x + 12, y + 6, 40, 30); // head
  ctx.fillStyle = "#b5c0d2";
  ctx.fillRect(x + 12, y + 6, 40, 3);
  ctx.fillStyle = "#101826";
  ctx.fillRect(x + 16, y + 13, 32, 10); // visor
  const ex = x + 18 + (Math.sin(t * 2) * 0.5 + 0.5) * 22;
  ctx.fillStyle = "rgba(255,90,90,0.95)";
  ctx.fillRect(ex, y + 15, 6, 6);
  ctx.fillStyle = "#3a4252";
  for (let i = 0; i < 5; i++) ctx.fillRect(x + 22 + i * 4, y + 27, 2, 5); // grill
  ctx.fillRect(x + 26, y + 36, 12, 6); // neck
  ctx.fillStyle = "#6b7890";
  ctx.fillRect(x + 4, y + 42, 56, 44); // body
  ctx.fillStyle = "#9aa9bf";
  ctx.fillRect(x + 4, y + 42, 56, 3);
  ctx.fillStyle = "#4a5568";
  ctx.fillRect(x - 2, y + 46, 6, 28); // arms
  ctx.fillRect(x + 60, y + 46, 6, 28);
  ctx.fillStyle = "#2a3140";
  ctx.fillRect(x + 8, y + 52, 48, 22); // chest panel
  // lights show progress
  for (let i = 0; i < total; i++) {
    ctx.fillStyle = i < solvedCount ? "#4cff6a" : "#5a1c1c";
    ctx.fillRect(x + 12 + i * 12, y + 60, 8, 8);
  }
  ctx.fillStyle = "#3a4252";
  ctx.fillRect(x + 2, y + 86, 60, 10); // tracks
  ctx.fillStyle = "#1f2633";
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(x + 9 + i * 11.5, y + 91, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawTeleporter(ctx, x, y, t) {
  // 2 tiles tall beam between an emitter and a pad
  const bottom = y + TILE * 2;
  const g = ctx.createLinearGradient(0, y - 8, 0, bottom);
  g.addColorStop(0, "rgba(120,220,255,0.65)");
  g.addColorStop(1, "rgba(180,120,255,0.35)");
  ctx.fillStyle = g;
  ctx.fillRect(x, y - 8, TILE, bottom - y);
  ctx.strokeStyle = "rgba(255,255,255,0.75)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    const ry = bottom - 8 - ((t * 50 + i * 22) % (TILE * 2));
    ctx.beginPath();
    ctx.ellipse(x + TILE / 2, ry, TILE / 2 + 4, 4, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = "#3a4252";
  ctx.fillRect(x - 10, y - 16, TILE + 20, 8);
  ctx.fillRect(x - 10, bottom - 8, TILE + 20, 8);
  ctx.fillStyle = "#7fe0ff";
  ctx.fillRect(x - 10, bottom - 8, TILE + 20, 2);
  ctx.fillRect(x - 10, y - 10, TILE + 20, 2);
}

// ---------- Backgrounds ----------

const stars = (() => {
  const r = rand(7);
  return Array.from({ length: 160 }, () => ({ x: r() * 960, y: r() * 420, s: r() * 2 + 1, p: r() * 6 }));
})();

function drawSpaceSky(ctx, theme, t, starsVisible) {
  const g = ctx.createLinearGradient(0, 0, 0, 544);
  g.addColorStop(0, theme.sky[0]);
  g.addColorStop(0.6, theme.sky[1]);
  g.addColorStop(1, theme.sky[2]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 960, 544);
  if (!starsVisible) return;
  for (const s of stars) {
    ctx.globalAlpha = 0.5 + Math.sin(t * 2 + s.p) * 0.5;
    ctx.fillStyle = "#fff";
    ctx.fillRect(s.x, s.y, s.s, s.s);
  }
  ctx.globalAlpha = 1;
}

function drawRingedPlanet(ctx, x, y, r) {
  ctx.fillStyle = "#c97b4a";
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e0a070";
  ctx.fillRect(x - r * 0.9, y - r * 0.35, r * 1.8, r * 0.15);
  ctx.fillRect(x - r * 0.8, y + r * 0.2, r * 1.6, r * 0.12);
  ctx.strokeStyle = "rgba(240,220,180,0.8)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(x, y, r * 1.7, r * 0.35, -0.25, 0, Math.PI * 2);
  ctx.stroke();
}

function drawRockets(ctx, offset, baseY, t) {
  const width = 900;
  const start = -((offset % width) + width) % width;
  for (let k = start; k < 960 + width; k += width) {
    ctx.fillStyle = "#141a33";
    ctx.fillRect(k, baseY - 40, width, 40);
    for (const [x, hgt, wd] of [[120, 200, 40], [430, 140, 30], [700, 240, 48]]) {
      ctx.fillStyle = "#141a33";
      ctx.fillRect(k + x, baseY - hgt, wd, hgt); // rocket
      ctx.beginPath();
      ctx.moveTo(k + x, baseY - hgt);
      ctx.lineTo(k + x + wd / 2, baseY - hgt - wd * 1.2);
      ctx.lineTo(k + x + wd, baseY - hgt);
      ctx.fill();
      ctx.fillRect(k + x - 12, baseY - 30, wd + 24, 30); // fins
      ctx.fillStyle = "#1c2444";
      for (let gy = baseY - hgt; gy < baseY; gy += 16) ctx.fillRect(k + x + wd + 10, gy, 14, 3); // tower
      ctx.fillRect(k + x + wd + 10, baseY - hgt, 3, hgt);
      ctx.fillRect(k + x + wd + 21, baseY - hgt, 3, hgt);
      ctx.fillStyle = `rgba(255,80,80,${0.5 + Math.sin(t * 3 + x) * 0.5})`;
      ctx.fillRect(k + x + wd + 15, baseY - hgt - 6, 4, 4);
    }
    for (const [x, r] of [[300, 50], [560, 36], [820, 44]]) {
      ctx.fillStyle = "#18203d";
      ctx.beginPath();
      ctx.arc(k + x, baseY - 40, r, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = "rgba(127,224,255,0.5)";
      ctx.fillRect(k + x - 6, baseY - 40 - r / 2, 12, 6);
    }
  }
}

function drawStationWall(ctx, offset, t) {
  const pw = 128;
  const ph = 96;
  const start = -((offset % pw) + pw) % pw;
  for (let x = start; x < 960; x += pw) {
    const col = Math.floor((x + offset) / pw);
    for (let row = 0; row < 6; row++) {
      ctx.fillStyle = (col + row) % 2 ? "#18233a" : "#1c2a44";
      ctx.fillRect(x + 2, row * ph + 2, pw - 4, ph - 4);
      ctx.fillStyle = "#26324a";
      ctx.fillRect(x + 8, row * ph + 8, 4, 4);
      ctx.fillRect(x + pw - 12, row * ph + 8, 4, 4);
      if ((col * 3 + row) % 4 === 0) {
        ctx.fillStyle = `rgba(127,224,255,${0.4 + Math.sin(t * 2 + col + row) * 0.3})`;
        ctx.fillRect(x + 20, row * ph + ph - 20, 30, 4);
      }
    }
  }
  // a long window with stars
  ctx.fillStyle = "#04060e";
  ctx.fillRect(0, 70, 960, 90);
  for (const s of stars) {
    const sx = ((s.x - offset * 0.2) % 960 + 960) % 960;
    if (s.y > 80) continue;
    ctx.fillStyle = `rgba(255,255,255,${0.5 + Math.sin(t * 2 + s.p) * 0.4})`;
    ctx.fillRect(sx, 74 + s.y, s.s, s.s);
  }
  ctx.fillStyle = "#3f5a78";
  ctx.fillRect(0, 66, 960, 6);
  ctx.fillRect(0, 158, 960, 6);
  const wstart = -((offset % 160) + 160) % 160;
  for (let x = wstart; x < 960; x += 160) ctx.fillRect(x, 70, 6, 90);
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.fillRect(0, 0, 960, 544);
}

function drawNebula(ctx, camX, t) {
  for (const [x, y, r, rgb] of [[200, 160, 260, "150,40,120"], [700, 300, 300, "60,30,140"], [480, 80, 200, "180,40,60"]]) {
    const g = ctx.createRadialGradient(x - camX * 0.02, y, 10, x - camX * 0.02, y, r);
    g.addColorStop(0, `rgba(${rgb},${0.28 + Math.sin(t * 0.5 + x) * 0.04})`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 960, 544);
  }
}

function drawDarkPlanet(ctx, x, y, r, t) {
  ctx.fillStyle = "#0e0a14";
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,70,70,0.55)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, r, -2.6, 0.2);
  ctx.stroke();
  ctx.fillStyle = "#1a1422";
  ctx.fillRect(x - r, y - 3, r * 2, 6);
  for (let i = 0; i < 12; i++) {
    ctx.fillStyle = `rgba(255,190,90,${0.4 + Math.sin(t * 1.5 + i) * 0.3})`;
    ctx.fillRect(x - r * 0.8 + ((i * 37) % (r * 1.6)), y - r * 0.6 + ((i * 53) % (r * 1.2)), 2, 2);
  }
}

function drawAsteroids(ctx, offset, t) {
  const width = 1200;
  const start = -((offset % width) + width) % width;
  ctx.fillStyle = "#1c1420";
  for (let k = start; k < 960 + width; k += width) {
    for (const [x, y, r] of [[100, 300, 22], [380, 220, 14], [620, 340, 30], [900, 260, 18], [1080, 360, 12]]) {
      const bob = Math.sin(t * 0.8 + x) * 4;
      ctx.beginPath();
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2;
        const rr = r * (0.75 + ((i * 13 + x) % 5) * 0.08);
        ctx.lineTo(k + x + Math.cos(a) * rr, y + bob + Math.sin(a) * rr);
      }
      ctx.fill();
    }
  }
}

function drawBackground(ctx, themeName, camX, t) {
  const theme = SPACE_THEMES[themeName];
  if (themeName === "launchpad") {
    drawSpaceSky(ctx, theme, t, true);
    drawRingedPlanet(ctx, 740 - camX * 0.02, 120, 46);
    drawRockets(ctx, camX * 0.15, 420, t);
    drawHills(ctx, camX * 0.4, 460, "#0f1428", 10, 0.01);
  } else if (themeName === "station") {
    drawSpaceSky(ctx, theme, t, false);
    drawStationWall(ctx, camX * 0.5, t);
  } else if (themeName === "planet") {
    drawSpaceSky(ctx, theme, t, true);
    drawMoon(ctx, 180 - camX * 0.02, 90, 26);
    drawMoon(ctx, 780 - camX * 0.03, 150, 14);
    drawHills(ctx, camX * 0.15, 400, "#2a1238", 60, 0.005);
    drawHills(ctx, camX * 0.4, 450, "#4a1e3a", 24, 0.012);
  } else if (themeName === "darkstar") {
    drawSpaceSky(ctx, theme, t, true);
    drawNebula(ctx, camX, t);
    drawDarkPlanet(ctx, 700 - camX * 0.03, 180, 110, t);
    drawAsteroids(ctx, camX * 0.3, t);
  }
}

export const spaceArt = {
  tile: spaceTile,
  drawBackground,
  drawDecoration,
  drawEnemy: drawAlien,
  bonusSprite: crystalSprite,
  bonusGlow: "rgba(120,220,255,0.3)",
  drawDoor: drawAirlock,
  drawBoss: drawRobot,
  drawPortal: drawTeleporter,
};
