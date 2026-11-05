// The ninja world: young ninja and their sensei, snakes, temple gates, golden scrolls,
// the Great Dragon and the valleys of the Far East. Drawn in code like sprites.js.

import { TILE, paint, cached, drawHills } from "./sprites.js";

// ---------- Heroes ----------
// 12×14 grids on top of the shared legs (see LEGS in sprites.js); the legs are drawn in "b".

const AKIRA = [
  "...rrrrrr...",
  "..rrrrrrrr.L",
  "..rrrrrrrr.L",
  "..rsessesr.L",
  "..rrrrrrrr.L",
  "...RRRRRR..L",
  "...rrrrrr..L",
  "..rrrffrrr.L",
  ".rrrfyyfrrrL",
  ".srrrrrrrrsm",
  "..rrrrrrrr.m",
  "..kkkkkkkk..",
  "..rrrRRrrr..",
  "..RRRRRRRR..",
];

const LEO = [
  "...hhhhh....",
  "..hgggggg..L",
  "..gggggggg.L",
  "..gsessesg.L",
  "..gggggggg.L",
  "...GGGGGG..L",
  "...gggggg..L",
  "..gggyyggg.L",
  ".ggggggggggL",
  ".sggggggggsm",
  "..gggggggg.m",
  "..yyyyyyyy..",
  "..gggGGggg..",
  "..GGGGGGGG..",
];

const BRUNO = [
  "...kkkkkk...",
  "..kkkkkkkk..",
  "..kkkkkkkk..",
  "..ksessesk..",
  "..kkkkkkkk..",
  "...KKKKKK...",
  ".kkkkkkkkkk.",
  "kkkkkookkkkk",
  "kkkkooookkkk",
  "skkkkkkkkkks",
  ".kkkkkkkkkk.",
  "..gggggggg..",
  "..kkkKKkkk..",
  "..KKKKKKKK..",
];

const SENSEI = [
  ".....tt.....",
  "...tttttt...",
  "tttttttttttt",
  "...sssssss.w",
  "...sessses.w",
  "...sWWWWWs.w",
  "....WWWWW..w",
  "..rrrWWWrrrw",
  ".rrrrWWWrrrw",
  ".srrrrWrrrsw",
  "..rrrrrrrr.w",
  "..yyyyyyyy.w",
  "..rrrRRrrr.w",
  "..RRRRRRRR.w",
];

export const NINJA_HEROES = [
  {
    id: "akira", name: "Akira", house: "Fire ninja", body: AKIRA,
    palette: { r: "#c0392b", R: "#7e1f17", s: "#f1c9a5", e: "#1a1a1a", f: "#f08a24", y: "#ffe066", k: "#2a1c12", L: "#dfe6ee", m: "#5a3a20", b: "#2a1c12" },
    sparkle: { x: 9, y: -30, w: 4, h: 14, color: "#ffb347" },
  },
  {
    id: "leo", name: "Leo", house: "Green ninja", body: LEO,
    palette: { h: "#f0d060", g: "#2f9a3a", G: "#1c6326", s: "#f6d3b3", e: "#1a1a1a", y: "#e8b923", L: "#ffe066", m: "#5a3a20", b: "#1c3a1c" },
    sparkle: { x: 9, y: -30, w: 4, h: 14, color: "#b8ff8a" },
  },
  {
    id: "bruno", name: "Bruno", house: "Earth ninja", body: BRUNO,
    palette: { k: "#26262c", K: "#4a4a54", s: "#d8a47f", e: "#1a1a1a", o: "#c47a2c", g: "#7a7a84", b: "#16161a" },
    sparkle: { x: 10, y: -14, w: 6, h: 6, color: "#e0a050" },
  },
  {
    id: "bo", name: "Sensei Bo", house: "Wise sensei", body: SENSEI,
    palette: { t: "#d8b25a", s: "#f1c9a5", e: "#1a1a1a", W: "#ffffff", r: "#ece4d0", R: "#c8bc9c", y: "#d9a520", w: "#6b4423", b: "#4a3a2a" },
    sparkle: { x: 9, y: -28, w: 4, h: 6, color: "#f5d36b" },
  },
];

// ---------- Snakes, scrolls ----------

const SNAKE = [
  "..........",
  "..........",
  "..gggg....",
  ".gggggg...",
  ".gkggkg...",
  ".gggggg...",
  "..gyyg....",
  "...gyg....",
  "..gggggg..",
  ".ggggggggg",
];

const SCROLL = [
  "..oooooooo..",
  ".oOOOOOOOOo.",
  "..pppppppp..",
  "..pkkkkkkp..",
  "..pppppppp..",
  "..pkkkpppp..",
  "..pppppppp..",
  "..ppppprrp..",
  "..pppppppp..",
  ".oOOOOOOOOo.",
  "..oooooooo..",
];

const snakeSprite = () => cached("ninja:snake", () => paint(SNAKE, { g: "#4fa83a", y: "#c8e06a", k: "#1a1a1a" }, 3));
const scrollSprite = () => cached("ninja:scroll", () => paint(SCROLL, { o: "#b8860b", O: "#f5d36b", p: "#f6ecd0", k: "#3a2a1a", r: "#c0392b" }, 2));

function drawSnake(ctx, x, y, facingRight, t) {
  ctx.save();
  ctx.translate(x, y);
  if (facingRight) ctx.scale(-1, 1);
  ctx.drawImage(snakeSprite(), -15, -2);
  if (Math.sin(t * 6) > 0.3) {
    ctx.fillStyle = "#e03a3a"; // the tongue flicks
    ctx.fillRect(-19, 16, 4, 2);
  }
  ctx.restore();
}

// ---------- Themes & tiles ----------

export const NINJA_THEMES = {
  bamboo: {
    sky: ["#123222", "#2f6a46", "#9cc488"],
    ground: { top: "#4f8a3a", topLight: "#8cc061", fill: "#6b4a2e", fillDark: "#4e331e", fillLight: "#87613d" },
    block: { base: "#8a8478", dark: "#5e5a50", light: "#b0aa9c" },
    plank: { base: "#9cbf4a", dark: "#5e7a2a", light: "#d0e68a" },
    floor: "earth",
  },
  dojo: {
    sky: ["#2a1a10", "#3a2414", "#4a2e18"],
    ground: { top: "#a0703a", topLight: "#d0a060", fill: "#6a4422", fillDark: "#4a2e16", fillLight: "#845630" },
    block: { base: "#5a3a20", dark: "#3a2412", light: "#7a5230" },
    plank: { base: "#b08040", dark: "#6a4a20", light: "#d8aa60" },
    floor: "wood",
  },
  mountains: {
    sky: ["#3a4a6e", "#8a98b8", "#e8cfdc"],
    ground: { top: "#5e8a5a", topLight: "#8ab07a", fill: "#6a6a72", fillDark: "#4a4a52", fillLight: "#86868e" },
    block: { base: "#7a7a82", dark: "#55555c", light: "#a0a0a8" },
    plank: { base: "#9cbf4a", dark: "#5e7a2a", light: "#d0e68a" },
    floor: "stone",
  },
  temple: {
    sky: ["#2a0a1a", "#8a2a2a", "#f0a050"],
    ground: { top: "#8a2a20", topLight: "#d04a30", fill: "#5a5048", fillDark: "#3e3630", fillLight: "#766a60" },
    block: { base: "#8a8478", dark: "#5e5a50", light: "#b0aa9c" },
    plank: { base: "#b03020", dark: "#5a1810", light: "#e05a3a" },
    floor: "stone",
  },
};

function floorPattern(ctx, style, c) {
  ctx.fillStyle = c.fill;
  ctx.fillRect(0, 0, TILE, TILE);
  if (style === "earth") {
    for (const [x, y, w] of [[5, 6, 4], [20, 12, 5], [10, 22, 3], [25, 27, 4]]) {
      ctx.fillStyle = c.fillLight;
      ctx.fillRect(x, y, w, 3);
      ctx.fillStyle = c.fillDark;
      ctx.fillRect(x, y + 3, w, 1);
    }
  } else if (style === "wood") {
    ctx.fillStyle = c.fillDark;
    for (let y = 7; y < TILE; y += 8) ctx.fillRect(0, y, TILE, 1);
    ctx.fillRect(10, 0, 1, 8);
    ctx.fillRect(24, 8, 1, 8);
    ctx.fillRect(6, 16, 1, 8);
    ctx.fillRect(20, 24, 1, 8);
    ctx.fillStyle = c.fillLight;
    for (let y = 0; y < TILE; y += 8) ctx.fillRect(0, y, TILE, 1);
  } else {
    // big flat stones
    ctx.fillStyle = c.fillDark;
    ctx.fillRect(0, TILE / 2 - 1, TILE, 2);
    ctx.fillRect(TILE - 2, 0, 2, TILE / 2);
    ctx.fillRect(TILE / 2, TILE / 2, 2, TILE / 2);
    ctx.fillStyle = c.fillLight;
    ctx.fillRect(2, 2, 10, 2);
    ctx.fillRect(18, 19, 8, 2);
  }
}

function ninjaTile(themeName, kind) {
  return cached(`ninja:tile:${themeName}:${kind}`, () => {
    const t = NINJA_THEMES[themeName];
    const c = document.createElement("canvas");
    c.width = TILE;
    c.height = TILE;
    const ctx = c.getContext("2d");
    if (kind === "ground-top" || kind === "ground") {
      floorPattern(ctx, t.floor, t.ground);
      if (kind === "ground-top") {
        ctx.fillStyle = t.ground.top;
        ctx.fillRect(0, 0, TILE, 7);
        ctx.fillStyle = t.ground.topLight;
        ctx.fillRect(0, 0, TILE, 2);
        if (t.floor === "earth") for (let i = 2; i < TILE; i += 7) ctx.fillRect(i, 7, 2, 3); // grass
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
      if (t.floor === "wood") {
        ctx.fillRect(0, 10, TILE, 2);
        ctx.fillRect(0, 21, TILE, 2);
      } else {
        ctx.fillRect(3, 14, 18, 2);
        ctx.fillRect(20, 14, 2, 15);
      }
    } else if (kind === "plank") {
      // a pole of bamboo, or a lacquered beam in the temple
      const p = t.plank;
      ctx.fillStyle = p.base;
      ctx.fillRect(0, 1, TILE, 8);
      ctx.fillStyle = p.light;
      ctx.fillRect(0, 2, TILE, 2);
      ctx.fillStyle = p.dark;
      ctx.fillRect(0, 8, TILE, 2);
      ctx.fillRect(TILE / 2, 0, 2, 10); // a joint
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
  const flicker = 0.8 + Math.sin(t * 9 + d.col) * 0.1 + Math.sin(t * 13 + d.col * 3) * 0.1;
  if (d.kind === "stoneLantern") {
    ctx.fillStyle = "#8a8478";
    ctx.fillRect(x + 8, y + 28, 16, 4); // base
    ctx.fillRect(x + 13, y + 16, 6, 12); // post
    ctx.fillRect(x + 9, y + 6, 14, 10); // light box
    glow(ctx, x + 16, y + 11, 22, "255,190,90", 0.35 * flicker);
    ctx.fillStyle = `rgba(255,200,100,${flicker})`;
    ctx.fillRect(x + 12, y + 8, 8, 6);
    ctx.fillStyle = "#6e695e";
    ctx.beginPath(); // roof
    ctx.moveTo(x + 4, y + 7);
    ctx.lineTo(x + 16, y - 2);
    ctx.lineTo(x + 28, y + 7);
    ctx.fill();
  } else if (d.kind === "blossom") {
    ctx.fillStyle = "#5a3a2a";
    ctx.fillRect(x + 14, y + 10, 4, 22);
    ctx.fillRect(x + 8, y + 14, 8, 3);
    for (const [cx, cy, r, c] of [[10, 8, 8, "#f4a6c0"], [22, 6, 9, "#f8c0d4"], [16, 0, 8, "#f4a6c0"], [26, 14, 6, "#fbd6e3"], [6, 16, 5, "#fbd6e3"]]) {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(x + cx, y + cy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (d.kind === "paperLantern") {
    ctx.fillStyle = "#2a1c12";
    ctx.fillRect(x + 15, y - 8, 2, 10);
    glow(ctx, x + 16, y + 12, 30, "255,120,60", 0.3 * flicker);
    ctx.fillStyle = "#d03a2a";
    ctx.beginPath();
    ctx.ellipse(x + 16, y + 12, 10, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,210,120,0.5)";
    ctx.fillRect(x + 7, y + 7, 18, 1);
    ctx.fillRect(x + 7, y + 16, 18, 1);
    ctx.fillStyle = "#2a1c12";
    ctx.fillRect(x + 11, y + 1, 10, 2);
    ctx.fillRect(x + 11, y + 22, 10, 2);
  } else if (d.kind === "shoji") {
    ctx.fillStyle = "#3a2414";
    ctx.fillRect(x - 2, y - 2, 36, 58);
    ctx.fillStyle = "rgba(245,232,200,0.85)";
    ctx.fillRect(x + 1, y + 1, 30, 52);
    ctx.fillStyle = "#3a2414";
    for (let i = 1; i < 3; i++) ctx.fillRect(x + 1 + i * 10, y + 1, 2, 52);
    for (let i = 1; i < 4; i++) ctx.fillRect(x + 1, y + 1 + i * 13, 30, 2);
  } else if (d.kind === "scroll") {
    ctx.fillStyle = "#5a3a20";
    ctx.fillRect(x + 4, y - 4, 24, 3);
    ctx.fillRect(x + 4, y + 30, 24, 3);
    ctx.fillStyle = "#f3ead2";
    ctx.fillRect(x + 7, y - 1, 18, 31);
    ctx.fillStyle = "#2a1c12"; // brush strokes
    ctx.fillRect(x + 14, y + 3, 4, 2);
    ctx.fillRect(x + 15, y + 3, 2, 10);
    ctx.fillRect(x + 11, y + 9, 10, 2);
    ctx.fillRect(x + 12, y + 16, 3, 8);
    ctx.fillRect(x + 17, y + 16, 3, 8);
    ctx.fillStyle = "#c0392b";
    ctx.fillRect(x + 18, y + 25, 4, 3);
  } else if (d.kind === "dummy") {
    ctx.fillStyle = "#6b4423";
    ctx.fillRect(x + 12, y + 2, 8, 30);
    ctx.fillRect(x + 4, y + 10, 24, 4);
    ctx.fillRect(x + 6, y + 18, 20, 3);
    ctx.fillStyle = "#8a5a2b";
    ctx.fillRect(x + 13, y + 2, 3, 30);
    ctx.fillStyle = "#e8d8b0";
    ctx.fillRect(x + 11, y + 24, 10, 3);
  }
}

// ---------- Temple gate, the Great Dragon, the torii ----------

function drawGate(ctx, x, y, open, t) {
  // 1 tile wide, 2 tiles tall
  ctx.fillStyle = "#2a1208";
  ctx.fillRect(x - 3, y - 3, TILE + 6, TILE * 2 + 3);
  if (open) {
    ctx.fillStyle = "#120806";
    ctx.fillRect(x, y, TILE, TILE * 2);
    ctx.fillStyle = "rgba(255,200,110,0.2)";
    ctx.fillRect(x + 4, y + 4, TILE - 8, TILE * 2 - 4);
    return;
  }
  ctx.fillStyle = "#b03020";
  ctx.fillRect(x, y, TILE, TILE * 2);
  ctx.fillStyle = "#7e1f17";
  ctx.fillRect(x + TILE / 2 - 1, y, 2, TILE * 2);
  ctx.fillRect(x, y + 8, TILE, 3);
  ctx.fillRect(x, y + TILE * 2 - 11, TILE, 3);
  ctx.fillStyle = "#e8b923"; // studs
  for (const [sx, sy] of [[5, 16], [24, 16], [5, 48], [24, 48]]) ctx.fillRect(x + sx, y + sy, 3, 3);
  const pulse = 0.5 + Math.sin(t * 4) * 0.5;
  glow(ctx, x + TILE / 2, y + 32, 22, "255,210,90", 0.25 + pulse * 0.25);
  ctx.fillStyle = "#e8b923"; // the golden seal
  ctx.beginPath();
  ctx.arc(x + TILE / 2, y + 32, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#b03020";
  ctx.fillRect(x + TILE / 2 - 3, y + 31, 6, 2);
  ctx.fillRect(x + TILE / 2 - 1, y + 28, 2, 8);
}

function drawDragon(ctx, x, y, solvedCount, total, t) {
  // occupies 2 tiles wide, 3 tall; (x, y) is the top-left; the dragon looks left at the child
  const sway = Math.round(Math.sin(t * 2) * 2);
  ctx.fillStyle = "rgba(255,255,255,0.9)"; // a cloud to sit on
  for (const [cx, cy, r] of [[8, 90, 8], [22, 88, 11], [40, 90, 10], [56, 89, 8]]) {
    ctx.beginPath();
    ctx.arc(x + cx, y + cy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  const body = [[46, 34], [54, 46], [50, 58], [40, 66], [28, 72], [22, 80], [32, 86], [48, 84]];
  for (const [bx, by] of body) {
    ctx.fillStyle = "#c0392b";
    ctx.beginPath();
    ctx.arc(x + bx, y + by, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f0c040";
    ctx.beginPath();
    ctx.arc(x + bx - 2, y + by + 3, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#e8b923"; // spines
  for (const [bx, by] of body.slice(0, 6)) {
    ctx.beginPath();
    ctx.moveTo(x + bx + 2, y + by - 8);
    ctx.lineTo(x + bx + 7, y + by - 15);
    ctx.lineTo(x + bx + 8, y + by - 6);
    ctx.fill();
  }
  // the scales on its body light up, one for every right answer
  for (let i = 0; i < total; i++) {
    const [bx, by] = body[Math.min(1 + i * 2, body.length - 1)];
    const lit = i < solvedCount;
    if (lit) glow(ctx, x + bx, y + by, 14, "255,230,120", 0.6);
    ctx.fillStyle = lit ? "#fff27a" : "#5a1a14";
    ctx.beginPath();
    ctx.arc(x + bx + 2, y + by - 2, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  const hy = y + sway;
  ctx.fillStyle = "#e8b923"; // horns and mane
  ctx.beginPath();
  ctx.moveTo(x + 32, hy + 12);
  ctx.lineTo(x + 46, hy - 4);
  ctx.lineTo(x + 38, hy + 14);
  ctx.moveTo(x + 26, hy + 12);
  ctx.lineTo(x + 34, hy - 2);
  ctx.lineTo(x + 32, hy + 13);
  ctx.fill();
  ctx.fillStyle = "#f08a24";
  for (let i = 0; i < 4; i++) ctx.fillRect(x + 40 + i * 2, hy + 14 + i * 5, 6, 4);
  ctx.fillStyle = "#c0392b";
  ctx.fillRect(x + 12, hy + 12, 32, 22); // head
  ctx.fillRect(x + 2, hy + 20, 14, 12); // snout
  ctx.fillStyle = "#e05a3a";
  ctx.fillRect(x + 12, hy + 12, 32, 3);
  ctx.fillStyle = "#fff"; // teeth
  ctx.fillRect(x + 4, hy + 31, 2, 3);
  ctx.fillRect(x + 9, hy + 31, 2, 3);
  ctx.fillStyle = "#3a0e0a";
  ctx.fillRect(x + 4, hy + 22, 2, 2); // nostril
  const blink = Math.sin(t * 1.3) > 0.97;
  ctx.fillStyle = "#ffe066"; // eye
  ctx.fillRect(x + 18, hy + 17, 7, blink ? 1 : 5);
  ctx.fillStyle = "#1a1a1a";
  if (!blink) ctx.fillRect(x + 19, hy + 18, 3, 3);
  ctx.strokeStyle = "#f0c040"; // whiskers
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 3, hy + 26);
  ctx.quadraticCurveTo(x - 8, hy + 26 + Math.sin(t * 3) * 6, x - 12, hy + 40);
  ctx.moveTo(x + 6, hy + 30);
  ctx.quadraticCurveTo(x - 2, hy + 38 + Math.sin(t * 3 + 1) * 5, x - 6, hy + 48);
  ctx.stroke();
}

function drawTorii(ctx, x, y, t) {
  // a glowing gate, 2 tiles tall
  const bottom = y + TILE * 2;
  const g = ctx.createLinearGradient(0, y - 6, 0, bottom);
  const h = 35 + Math.sin(t * 2) * 15;
  g.addColorStop(0, `hsla(${h},95%,70%,0.85)`);
  g.addColorStop(1, `hsla(${h + 300},80%,60%,0.6)`);
  ctx.fillStyle = g;
  ctx.fillRect(x, y - 6, TILE, bottom - y + 6);
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  for (let i = 0; i < 4; i++) {
    const py = bottom - ((t * 40 + i * 17) % (TILE * 2));
    ctx.fillRect(x + 5 + i * 7, py, 2, 2);
  }
  ctx.fillStyle = "#c0392b";
  ctx.fillRect(x - 8, y - 12, 6, bottom - y + 12); // pillars
  ctx.fillRect(x + TILE + 2, y - 12, 6, bottom - y + 12);
  ctx.fillRect(x - 12, y - 8, TILE + 24, 4); // lower beam
  ctx.fillStyle = "#1e1410"; // top beam with upturned ends
  ctx.beginPath();
  ctx.moveTo(x - 18, y - 24);
  ctx.lineTo(x + TILE + 18, y - 24);
  ctx.lineTo(x + TILE + 12, y - 17);
  ctx.lineTo(x - 12, y - 17);
  ctx.fill();
  ctx.fillStyle = "#c0392b";
  ctx.fillRect(x - 14, y - 17, TILE + 28, 4);
}

// ---------- Backgrounds ----------

function drawNinjaSky(ctx, theme) {
  const g = ctx.createLinearGradient(0, 0, 0, 544);
  g.addColorStop(0, theme.sky[0]);
  g.addColorStop(0.6, theme.sky[1]);
  g.addColorStop(1, theme.sky[2]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 960, 544);
}

function drawSun(ctx, x, y, r, color, haze) {
  ctx.fillStyle = haze;
  ctx.beginPath();
  ctx.arc(x, y, r * 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawBambooGrove(ctx, offset, color, leaf, spacing, top, t) {
  const start = -((offset % spacing) + spacing) % spacing;
  for (let x = start; x < 960 + spacing; x += spacing) {
    const k = Math.floor((x + offset) / spacing);
    const sx = x + ((k * 37) % 23);
    const w = 8 + (k % 3) * 2;
    ctx.fillStyle = color;
    ctx.fillRect(sx, top + ((k * 53) % 60), w, 544);
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    for (let jy = top + ((k * 53) % 60) + 30; jy < 544; jy += 46) ctx.fillRect(sx - 1, jy, w + 2, 3);
    ctx.fillStyle = leaf;
    const sway = Math.sin(t * 1.2 + k) * 3;
    for (let i = 0; i < 3; i++) {
      const ly = top + 40 + ((k * 29 + i * 71) % 220);
      ctx.beginPath();
      ctx.ellipse(sx + w + 10 + sway, ly, 14, 3, 0.4, 0, Math.PI * 2);
      ctx.ellipse(sx - 10 + sway, ly + 18, 14, 3, -0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawDojoWall(ctx, offset) {
  const width = 160;
  const start = -((offset % width) + width) % width;
  for (let x = start; x < 960; x += width) {
    ctx.fillStyle = "rgba(240,224,190,0.55)"; // paper walls
    ctx.fillRect(x + 10, 120, width - 20, 300);
    ctx.fillStyle = "#2a1a10";
    for (let i = 1; i < 4; i++) ctx.fillRect(x + 10 + i * ((width - 20) / 4), 120, 3, 300);
    for (let j = 1; j < 5; j++) ctx.fillRect(x + 10, 120 + j * 60, width - 20, 3);
    ctx.fillStyle = "#3a2414"; // beams
    ctx.fillRect(x, 0, 12, 544);
  }
  ctx.fillStyle = "#3a2414";
  ctx.fillRect(0, 100, 960, 20);
  ctx.fillRect(0, 420, 960, 16);
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.fillRect(0, 0, 960, 544);
}

function drawPeaks(ctx, offset, baseY, color, snow, peaks) {
  const width = 1200;
  const start = -((offset % width) + width) % width;
  for (let k = start; k < 960 + width; k += width) {
    for (const [x, w, h] of peaks) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(k + x - w, baseY);
      ctx.lineTo(k + x, baseY - h);
      ctx.lineTo(k + x + w, baseY);
      ctx.fill();
      if (!snow) continue;
      ctx.fillStyle = snow;
      ctx.beginPath();
      ctx.moveTo(k + x - w * 0.22, baseY - h * 0.78);
      ctx.lineTo(k + x, baseY - h);
      ctx.lineTo(k + x + w * 0.22, baseY - h * 0.78);
      ctx.fill();
    }
    ctx.fillStyle = color;
    ctx.fillRect(k, baseY, width, 544 - baseY);
  }
}

function drawMist(ctx, offset, t) {
  for (let i = 0; i < 4; i++) {
    const y = 300 + i * 50 + Math.sin(t * 0.5 + i) * 6;
    ctx.fillStyle = "rgba(255,255,255,0.14)";
    ctx.fillRect(0, y, 960, 22 + i * 4);
  }
}

function drawPetals(ctx, t) {
  ctx.fillStyle = "#f8c0d4";
  for (let i = 0; i < 24; i++) {
    const x = ((i * 97 + t * 30) % 1000) - 20 + Math.sin(t + i) * 12;
    const y = (i * 53 + t * 40) % 560 - 10;
    ctx.fillRect(x, y, 3, 2);
  }
}

function drawPagodas(ctx, offset, baseY) {
  const width = 1000;
  const start = -((offset % width) + width) % width;
  ctx.fillStyle = "#2a0a12";
  for (let k = start; k < 960 + width; k += width) {
    for (const [x, floors] of [[150, 5], [520, 3], [800, 4]]) {
      for (let f = 0; f < floors; f++) {
        const w = 90 - f * 14;
        const fy = baseY - 30 - f * 34;
        ctx.fillRect(k + x - w / 2 + 12, fy, w - 24, 30); // floor
        ctx.beginPath(); // roof with upturned ends
        ctx.moveTo(k + x - w / 2 - 10, fy - 2);
        ctx.lineTo(k + x - w / 2, fy - 10);
        ctx.lineTo(k + x + w / 2, fy - 10);
        ctx.lineTo(k + x + w / 2 + 10, fy - 2);
        ctx.fill();
      }
      ctx.fillRect(k + x - 1, baseY - 30 - floors * 34 - 24, 3, 24); // spire
    }
    ctx.fillRect(k, baseY - 30, width, 30);
  }
}

function drawBackground(ctx, themeName, camX, t) {
  const theme = NINJA_THEMES[themeName];
  drawNinjaSky(ctx, theme);
  if (themeName === "bamboo") {
    drawSun(ctx, 760 - camX * 0.02, 110, 44, "#fbeec8", "rgba(255,240,200,0.18)");
    drawHills(ctx, camX * 0.1, 400, "#2a5a3e", 50, 0.004);
    drawBambooGrove(ctx, camX * 0.3, "#3e6e3a", "#4f8a46", 90, 40, t);
    drawBambooGrove(ctx, camX * 0.55, "#2a4e28", "#386a34", 130, 0, t);
  } else if (themeName === "dojo") {
    drawDojoWall(ctx, camX * 0.5);
  } else if (themeName === "mountains") {
    drawSun(ctx, 200 - camX * 0.02, 120, 36, "#fff6e8", "rgba(255,255,255,0.25)");
    drawPeaks(ctx, camX * 0.08, 380, "#6a7898", "#f4f4fa", [[150, 220, 260], [520, 260, 300], [900, 200, 220]]);
    drawMist(ctx, camX, t);
    drawPeaks(ctx, camX * 0.25, 440, "#4e5a74", null, [[300, 160, 150], [760, 180, 170], [1100, 140, 120]]);
    drawPetals(ctx, t);
  } else if (themeName === "temple") {
    drawSun(ctx, 520 - camX * 0.02, 300, 90, "#ff7a3c", "rgba(255,140,80,0.25)");
    drawHills(ctx, camX * 0.1, 420, "#4a1420", 30, 0.005);
    drawPagodas(ctx, camX * 0.25, 470);
  }
}

export const ninjaArt = {
  tile: ninjaTile,
  drawBackground,
  drawDecoration,
  drawEnemy: drawSnake,
  bonusSprite: scrollSprite,
  bonusGlow: "rgba(255,214,110,0.3)",
  drawDoor: drawGate,
  drawBoss: drawDragon,
  drawPortal: drawTorii,
};
