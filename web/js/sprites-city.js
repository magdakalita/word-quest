// The city world: a police lieutenant and his friends, little crooks, townhouse doors, golden
// badges, the Mayor in his corn costume, the town hall, the police station and the streets of Brick City. Drawn in code like sprites.js.

import { TILE, paint, cached, drawHills } from "./sprites.js";

// ---------- Heroes ----------
// 12×14 grids on top of the shared legs (see LEGS in sprites.js); the legs are drawn in "b".

const DEX = [
  "...cccccc...",
  "..cccyyccc..",
  "..CCCCCCCC..",
  "..assssssa..",
  "..gleggleg..",
  "..assssssa..",
  "...ssmmss...",
  "..uuiiiiuu..",
  ".uuuiiiyuuu.",
  ".suuuiiuuus.",
  "..uuuiiuuu..",
  "..kkkkkkkk..",
  "..UUUUUUUU..",
  "..UUUUUUUU..",
];

const FRED = [
  "....hhhh....",
  "...hhyyhh...",
  ".hhhhhhhhhh.",
  "..hssssssh..",
  "...sessess..",
  "...ssssss...",
  "...kkkkkk...",
  "..kkkkkkkk..",
  ".YYYYYYYYYY.",
  ".gkkkkkkkkg.",
  "..kkkkkkkk..",
  "..YYYYYYYY..",
  "..kkkKKkkk..",
  "..KKKKKKKK..",
];

const HANK = [
  "...YYYYYY...",
  "..YYYYYYYY..",
  ".YYYYYYYYYY.",
  "..rssssssr..",
  "...sessess..",
  "..rrssssrr..",
  "...rrrrrr...",
  "..oottttoo..",
  ".oWWttttWWo.",
  ".soottttoos.",
  "..oottttoo..",
  "..kkkkkkkk..",
  "..jjjJJjjj..",
  "..JJJJJJJJ..",
];

const MAX = [
  "....mmmm....",
  "...myyyym...",
  "..hhmmmmhh..",
  "..hssssssh..",
  "...sessess..",
  "...ssssss...",
  "...mmyymm...",
  "..mmymmymm..",
  ".mmmymmymmm.",
  ".wmmymmymmw.",
  "..mmymmymm..",
  "..yyyyyyyy..",
  "..mmmMMmmm..",
  "..MMMMMMMM..",
];

export const CITY_HEROES = [
  {
    id: "dex", name: "Lieutenant Dex", house: "Police lieutenant", body: DEX,
    palette: { c: "#1c2a5a", C: "#101a3a", y: "#e8b923", a: "#1b1410", s: "#f1c9a5", m: "#c87a6a", g: "#1a1a1a", l: "#bfe0ff", e: "#1a1a1a", u: "#24346e", U: "#16204a", i: "#8ab8e8", k: "#1a1a1a", b: "#16204a" },
    sparkle: { x: 1, y: -18, w: 3, h: 3, color: "#fff6c0" },
  },
  {
    id: "fred", name: "Fred", house: "Firefighter", body: FRED,
    palette: { h: "#d0312d", y: "#e8b923", s: "#f1c9a5", e: "#1a1a1a", k: "#2a2a2e", K: "#1a1a1e", Y: "#f0d020", g: "#5a4a3a", b: "#1a1a1e" },
    sparkle: { x: 9, y: -18, w: 4, h: 6, color: "#ff9a3a" },
  },
  {
    id: "hank", name: "Hank", house: "Builder", body: HANK,
    palette: { Y: "#f2c21a", r: "#7a4a24", s: "#f3cfb0", e: "#1a1a1a", o: "#f07a1a", W: "#e0e4ea", t: "#3a6ab0", k: "#3a2a1a", j: "#3a5a9a", J: "#2a4478", b: "#3a2a1a" },
    sparkle: { x: 9, y: -18, w: 4, h: 6, color: "#ffd84a" },
  },
  {
    id: "max", name: "Max", house: "Hotel doorman", body: MAX,
    palette: { m: "#8a1a2a", M: "#5a0e18", y: "#e8b923", h: "#5a3214", s: "#f6d3b3", e: "#1a1a1a", w: "#ffffff", b: "#1a1a1a" },
    sparkle: { x: 9, y: -18, w: 4, h: 6, color: "#fff6c0" },
  },
];

// ---------- Crooks, badges ----------

const CROOK = [
  "...kkkk...",
  "..kkkkkk..",
  "..ssssss..",
  "..kwkkwk..",
  "..ssssss..",
  ".WkWkWkWSS",
  "sWkWkWkWSS",
  ".WkWkWkWSS",
  "..pppppp..",
  "..pp..pp..",
];

const BADGE = [
  "....yyyy....",
  "..yyYYYYyy..",
  ".yYYYyyYYYy.",
  ".yYYyYYyYYy.",
  ".yYyYbbYyYy.",
  ".yYYyYYyYYy.",
  "..yYYyyYYy..",
  "..yYYYYYYy..",
  "...yYYYYy...",
  "....yYYy....",
  ".....yy.....",
];

const crookSprite = () => cached("city:crook", () => paint(CROOK, { k: "#1a1a1a", s: "#f1c9a5", w: "#ffffff", W: "#f4f4f4", S: "#a07a4a", p: "#3a3a44" }, 3));
const badgeSprite = () => cached("city:badge", () => paint(BADGE, { y: "#b8860b", Y: "#f5d36b", b: "#2a5ab0" }, 2));

function drawCrook(ctx, x, y, facingRight) {
  ctx.save();
  ctx.translate(x, y);
  if (facingRight) ctx.scale(-1, 1);
  ctx.drawImage(crookSprite(), -15, -2);
  ctx.restore();
}

// ---------- Themes & tiles ----------

export const CITY_THEMES = {
  park: {
    sky: ["#4a98e0", "#90c8f2", "#d8f0ff"],
    ground: { top: "#4f9a3a", topLight: "#7cc85a", fill: "#7a5a3a", fillDark: "#5a4028", fillLight: "#94704a" },
    block: { base: "#d0312d", dark: "#8e1b1b", light: "#f05a4a" },
    plank: { base: "#a0703a", dark: "#6a4a20", light: "#c8945a" },
    floor: "earth",
  },
  townhall: {
    sky: ["#ece2cc", "#e4d6ba", "#dccaa8"],
    ground: { top: "#a8202a", topLight: "#d04050", fill: "#e8e2d6", fillDark: "#c4bcac", fillLight: "#f8f4ec" },
    block: { base: "#c8a87a", dark: "#8a7250", light: "#e4caa0" },
    plank: { base: "#c8a040", dark: "#8a6a20", light: "#f0d070" },
    floor: "marble",
  },
  precinct: {
    sky: ["#dfe5ef", "#d4dcea", "#c8d2e2"],
    ground: { top: "#3a62a8", topLight: "#6a92d8", fill: "#dcdfe6", fillDark: "#b4b8c4", fillLight: "#f0f2f6" },
    block: { base: "#2a5ab0", dark: "#183a7a", light: "#4a7ad8" },
    plank: { base: "#8a8a92", dark: "#55555c", light: "#b8b8c0" },
    floor: "tiles",
  },
  square: {
    sky: ["#3a2a6a", "#b05a8a", "#f4a060"],
    ground: { top: "#b8b0b0", topLight: "#dcd6d6", fill: "#8a8488", fillDark: "#6a6468", fillLight: "#a8a2a6" },
    block: { base: "#f2c21a", dark: "#b88a00", light: "#ffe066" },
    plank: { base: "#8a8a92", dark: "#55555c", light: "#b8b8c0" },
    floor: "pavers",
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
  } else if (style === "marble") {
    ctx.fillStyle = c.fillDark;
    ctx.fillRect(0, TILE - 1, TILE, 1);
    ctx.fillRect(TILE - 1, 0, 1, TILE);
    ctx.fillRect(6, 10, 9, 1); // veins
    ctx.fillRect(14, 11, 7, 1);
    ctx.fillRect(18, 22, 8, 1);
    ctx.fillStyle = c.fillLight;
    ctx.fillRect(0, 0, TILE, 1);
  } else if (style === "tiles") {
    // square floor tiles
    ctx.fillStyle = c.fillDark;
    ctx.fillRect(0, TILE / 2 - 1, TILE, 1);
    ctx.fillRect(0, TILE - 1, TILE, 1);
    ctx.fillRect(TILE / 2 - 1, 0, 1, TILE);
    ctx.fillRect(TILE - 1, 0, 1, TILE);
    ctx.fillStyle = c.fillLight;
    ctx.fillRect(1, 1, 6, 1);
    ctx.fillRect(17, 17, 6, 1);
  } else {
    // paving stones
    ctx.fillStyle = c.fillDark;
    for (let y = 0; y < TILE; y += 8) ctx.fillRect(0, y, TILE, 1);
    for (let r = 0; r < 4; r++) for (let x = (r % 2) * 8; x < TILE; x += 16) ctx.fillRect(x, r * 8, 1, 8);
    ctx.fillStyle = c.fillLight;
    ctx.fillRect(3, 2, 4, 1);
    ctx.fillRect(19, 18, 4, 1);
  }
}

function cityTile(themeName, kind) {
  return cached(`city:tile:${themeName}:${kind}`, () => {
    const t = CITY_THEMES[themeName];
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
        if (themeName === "park") for (let i = 2; i < TILE; i += 7) ctx.fillRect(i, 7, 2, 3); // grass
      }
    } else if (kind === "block") {
      // a toy brick with two studs
      const b = t.block;
      ctx.fillStyle = b.base;
      ctx.fillRect(0, 0, TILE, TILE);
      ctx.fillStyle = b.light;
      ctx.fillRect(0, 0, TILE, 2);
      ctx.fillRect(0, 0, 2, TILE);
      ctx.fillStyle = b.dark;
      ctx.fillRect(0, TILE - 2, TILE, 2);
      ctx.fillRect(TILE - 2, 0, 2, TILE);
      for (const sx of [9, 23]) {
        ctx.fillStyle = b.dark;
        ctx.beginPath();
        ctx.arc(sx, 10, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = b.light;
        ctx.beginPath();
        ctx.arc(sx - 1, 9, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (kind === "plank") {
      // a bench plank, a brass rail or a steel girder
      const p = t.plank;
      ctx.fillStyle = p.base;
      ctx.fillRect(0, 0, TILE, 10);
      ctx.fillStyle = p.light;
      ctx.fillRect(0, 0, TILE, 2);
      ctx.fillStyle = p.dark;
      ctx.fillRect(0, 8, TILE, 2);
      if (themeName === "precinct" || themeName === "square") for (let x = 4; x < TILE; x += 9) ctx.fillRect(x, 4, 3, 3);
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

function drawDecoration(ctx, d, x, y, t, themeName) {
  if (d.kind === "streetLamp") {
    const evening = themeName === "square";
    ctx.fillStyle = "#2a3a3a";
    ctx.fillRect(x + 14, y - 20, 4, 52);
    ctx.fillRect(x + 10, y + 28, 12, 4);
    ctx.fillRect(x + 8, y - 26, 16, 6);
    if (evening) glow(ctx, x + 16, y - 16, 40, "255,220,140", 0.4);
    ctx.fillStyle = evening ? "#fff0b0" : "#f0e8c8";
    ctx.fillRect(x + 10, y - 20, 12, 6);
  } else if (d.kind === "chandelier") {
    ctx.fillStyle = "#c8a040";
    ctx.fillRect(x + 15, y - 8, 2, 10);
    glow(ctx, x + 16, y + 8, 30, "255,230,160", 0.3);
    ctx.fillRect(x + 4, y + 8, 24, 3);
    ctx.fillRect(x + 14, y + 2, 4, 10);
    for (const cx of [4, 15, 26]) {
      ctx.fillStyle = "#c8a040";
      ctx.fillRect(x + cx, y + 4, 2, 5);
      ctx.fillStyle = "#fff4c0";
      ctx.fillRect(x + cx - 1, y + 1, 4, 4);
    }
  } else if (d.kind === "flag") {
    // a banner of the city: a red flag with a golden star
    ctx.fillStyle = "#8a6a20";
    ctx.fillRect(x - 2, y - 6, 36, 4);
    ctx.fillStyle = "#c0302a";
    ctx.beginPath();
    ctx.moveTo(x + 4, y - 2);
    ctx.lineTo(x + 28, y - 2);
    ctx.lineTo(x + 28, y + 52);
    ctx.lineTo(x + 16, y + 44);
    ctx.lineTo(x + 4, y + 52);
    ctx.fill();
    ctx.fillStyle = "#e8b923";
    ctx.fillRect(x + 4, y - 2, 24, 3);
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? 3 : 7;
      const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
      ctx.lineTo(x + 16 + Math.cos(a) * r, y + 18 + Math.sin(a) * r);
    }
    ctx.fill();
  } else if (d.kind === "plant") {
    ctx.fillStyle = "#3f8a3a";
    for (const [cx, cy, rx, ry, a] of [[11, 10, 4, 10, -0.5], [21, 10, 4, 10, 0.5], [16, 6, 4, 11, 0]]) {
      ctx.beginPath();
      ctx.ellipse(x + cx, y + cy, rx, ry, a, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#c86a3a";
    ctx.fillRect(x + 8, y + 18, 16, 14);
    ctx.fillStyle = "#a8502a";
    ctx.fillRect(x + 6, y + 16, 20, 4);
  } else if (d.kind === "portrait") {
    // the Mayor in his corn costume, in a golden frame
    ctx.fillStyle = "#c8a040";
    ctx.fillRect(x + 2, y - 2, 28, 32);
    ctx.fillStyle = "#6a8ac8";
    ctx.fillRect(x + 5, y + 1, 22, 26);
    ctx.fillStyle = "#f0c830";
    ctx.beginPath();
    ctx.ellipse(x + 16, y + 18, 7, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f1c9a5";
    ctx.fillRect(x + 13, y + 9, 6, 5);
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(x + 12, y + 3, 8, 6);
    ctx.fillRect(x + 10, y + 8, 12, 1);
  } else if (d.kind === "siren") {
    // a police light on the wall, slowly turning from blue to red
    const blue = Math.sin(t * 1.5 + d.col) > 0;
    glow(ctx, x + 16, y + 10, 24, blue ? "70,130,255" : "255,80,80", 0.22);
    ctx.fillStyle = "#55555c";
    ctx.fillRect(x + 9, y + 14, 14, 4);
    ctx.fillStyle = blue ? "#5a9aff" : "#ff5a5a";
    ctx.beginPath();
    ctx.arc(x + 16, y + 14, 6, Math.PI, 0);
    ctx.fill();
  } else if (d.kind === "cityMap") {
    // a map of the city on the wall: streets, a park and the river
    ctx.fillStyle = "#5a6a88";
    ctx.fillRect(x - 1, y - 4, 34, 56);
    ctx.fillStyle = "#eef0e6";
    ctx.fillRect(x + 2, y - 1, 28, 50);
    ctx.fillStyle = "#7cc85a";
    ctx.fillRect(x + 4, y + 2, 10, 12);
    ctx.fillStyle = "#6ab0f0";
    ctx.fillRect(x + 2, y + 34, 28, 5);
    ctx.fillStyle = "#b8bcc8";
    for (const sy of [17, 27, 44]) ctx.fillRect(x + 2, y + sy, 28, 2);
    for (const sx of [15, 24]) ctx.fillRect(x + sx, y - 1, 2, 50);
    ctx.fillStyle = "#d0312d";
    ctx.beginPath(); // "you are here"
    ctx.arc(x + 20, y + 22, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (d.kind === "desk") {
    ctx.fillStyle = "#8a5a2b";
    ctx.fillRect(x, y + 14, 32, 4);
    ctx.fillRect(x + 2, y + 18, 3, 14);
    ctx.fillRect(x + 27, y + 18, 3, 14);
    ctx.fillStyle = "#2a2a34";
    ctx.fillRect(x + 8, y, 16, 11);
    ctx.fillRect(x + 14, y + 11, 4, 3);
    ctx.fillStyle = "#6ac0f0";
    ctx.fillRect(x + 10, y + 2, 12, 7);
  } else if (d.kind === "wanted") {
    ctx.fillStyle = "#f3e6c4";
    ctx.fillRect(x + 3, y - 2, 26, 32);
    ctx.fillStyle = "#3a2a1a";
    ctx.font = "bold 6px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("WANTED", x + 16, y + 3);
    ctx.fillStyle = "#1a1a1a"; // the crook: beanie and mask
    ctx.fillRect(x + 11, y + 8, 10, 4);
    ctx.fillStyle = "#f1c9a5";
    ctx.fillRect(x + 11, y + 12, 10, 8);
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(x + 11, y + 13, 10, 3);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x + 13, y + 14, 2, 1);
    ctx.fillRect(x + 17, y + 14, 2, 1);
    ctx.fillStyle = "#f4f4f4";
    ctx.fillRect(x + 9, y + 21, 14, 7);
    ctx.fillStyle = "#1a1a1a";
    for (let i = 0; i < 3; i++) ctx.fillRect(x + 10 + i * 5, y + 21, 2, 7);
  }
}

// ---------- Townhouse door, the Mayor, the police station ----------

function drawTownhouseDoor(ctx, x, y, open, t) {
  // 1 tile wide, 2 tiles tall – the front door of a brick townhouse
  ctx.fillStyle = "#9a4a32"; // brick frame
  ctx.fillRect(x - 3, y - 3, TILE + 6, TILE * 2 + 3);
  ctx.fillStyle = "#6e3022";
  for (let by = y + 4; by < y + TILE * 2; by += 7) {
    ctx.fillRect(x - 3, by, 3, 1);
    ctx.fillRect(x + TILE, by, 3, 1);
  }
  if (open) {
    // the door swung in: a warm, lit hallway and the edge of the door on its hinges
    ctx.fillStyle = "#4a3220";
    ctx.fillRect(x, y, TILE, TILE * 2);
    ctx.fillStyle = "rgba(255,206,110,0.6)";
    ctx.fillRect(x + 4, y + 4, TILE - 6, TILE * 2 - 4);
    glow(ctx, x + TILE / 2, y + TILE, 30, "255,214,120", 0.45);
    ctx.fillStyle = "#24553a";
    ctx.fillRect(x, y, 6, TILE * 2);
    ctx.fillStyle = "#f0c830";
    ctx.fillRect(x + 2, y + 38, 3, 3);
  } else {
    ctx.fillStyle = "#2f6b45"; // the green door
    ctx.fillRect(x, y, TILE, TILE * 2);
    ctx.fillStyle = "#e8dcc0"; // the little window
    ctx.fillRect(x + 7, y + 5, 18, 16);
    ctx.fillStyle = "#bfe0f0";
    ctx.fillRect(x + 9, y + 7, 14, 12);
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillRect(x + 11, y + 9, 3, 6);
    for (const py of [y + 26, y + 44]) {
      ctx.fillStyle = "#22553a"; // panels
      ctx.fillRect(x + 5, py, 22, 14);
      ctx.fillStyle = "#357a50";
      ctx.fillRect(x + 7, py + 2, 18, 10);
    }
    ctx.fillStyle = "#f0c830"; // the golden knob
    ctx.fillRect(x + 24, y + 39, 4, 4);
    ctx.fillStyle = "#fff6a0";
    ctx.fillRect(x + 24, y + 39, 2, 2);
  }
  ctx.fillStyle = "#c8c0b0"; // the step
  ctx.fillRect(x - 3, y + TILE * 2 - 3, TILE + 6, 3);
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = i % 2 ? "#2f6b45" : "#f3ead0"; // the striped awning
    ctx.fillRect(x - 6 + i * 7, y - 9, 7, 6);
  }
  ctx.fillStyle = "#1e4a30";
  ctx.fillRect(x - 6, y - 3, TILE + 12, 1);
  // a warm lamp on top of the awning, glowing softly
  const pulse = 0.5 + Math.sin(t * 2) * 0.5;
  glow(ctx, x + TILE / 2, y - 12, 22, "255,210,120", 0.35 + pulse * 0.15);
  ctx.fillStyle = "#2a2a2a";
  ctx.fillRect(x + TILE / 2 - 4, y - 16, 8, 2);
  ctx.fillStyle = "#ffd77a";
  ctx.fillRect(x + TILE / 2 - 3, y - 14, 6, 5);
}

function drawMayor(ctx, x, y, solvedCount, total, t) {
  // occupies 2 tiles wide, 3 tall; (x, y) is the top-left – the Mayor dressed up as a big corn cob
  const bob = Math.round(Math.sin(t * 2.5) * 1.5);
  const cy = y + 54 + bob;
  ctx.fillStyle = "#3a8a2a"; // husk leaves
  ctx.beginPath();
  ctx.moveTo(x + 10, y + 94);
  ctx.lineTo(x + 2, y + 48 + bob);
  ctx.lineTo(x + 26, y + 90);
  ctx.moveTo(x + 54, y + 94);
  ctx.lineTo(x + 62, y + 48 + bob);
  ctx.lineTo(x + 38, y + 90);
  ctx.fill();
  ctx.fillStyle = "#f0c830"; // the cob
  ctx.beginPath();
  ctx.ellipse(x + 32, cy, 21, 38, 0, 0, Math.PI * 2);
  ctx.fill();
  // kernels: rows light up from the bottom, one part for every right answer
  const rows = 6;
  const lit = total ? Math.round((solvedCount / total) * rows) : 0;
  for (let r = 0; r < rows; r++) {
    const ky = cy + 30 - r * 7;
    const on = r < lit;
    for (let kx = x + 16; kx <= x + 44; kx += 7) {
      if (Math.abs(kx + 2 - (x + 32)) > 19 - Math.abs(ky - cy) * 0.35) continue;
      ctx.fillStyle = on ? "#fff6a0" : "#d8a820";
      ctx.fillRect(kx, ky, 5, 5);
    }
  }
  if (lit) glow(ctx, x + 32, cy + 18, 30, "255,240,140", 0.35);
  ctx.fillStyle = "#f1c9a5"; // the face peeking out
  ctx.beginPath();
  ctx.ellipse(x + 32, y + 30 + bob, 11, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(x + 27, y + 26 + bob, 3, 3);
  ctx.fillRect(x + 34, y + 26 + bob, 3, 3);
  ctx.fillStyle = "#6a4423"; // moustache
  ctx.fillRect(x + 25, y + 32 + bob, 14, 3);
  ctx.fillStyle = "#c0392b";
  ctx.fillRect(x + 29, y + 36 + bob, 6, 2);
  ctx.fillStyle = "#1a1a1a"; // top hat
  ctx.fillRect(x + 16, y + 16 + bob, 32, 3);
  ctx.fillRect(x + 21, y + 1 + bob, 22, 16);
  ctx.fillStyle = "#c0392b";
  ctx.fillRect(x + 21, y + 12 + bob, 22, 3);
  ctx.save(); // the sash
  ctx.translate(x + 32, y + 62 + bob);
  ctx.rotate(-0.45);
  ctx.fillStyle = "#c0392b";
  ctx.fillRect(-24, -5, 48, 10);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 8px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("MAYOR", 0, 1);
  ctx.restore();
  const wave = Math.sin(t * 4) * 4; // a waving glove
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x + 4, y + 40 + bob + wave, 7, 7);
  ctx.fillStyle = "#1a1a1a"; // shoes
  ctx.fillRect(x + 20, y + 91, 10, 5);
  ctx.fillRect(x + 34, y + 91, 10, 5);
}

function drawPoliceStation(ctx, x, y, t) {
  // a lit doorway under a POLICE sign, 2 tiles tall
  const bottom = y + TILE * 2;
  ctx.fillStyle = "#5a6478";
  ctx.fillRect(x - 12, y - 30, TILE + 24, bottom - y + 30);
  const g = ctx.createLinearGradient(0, y, 0, bottom);
  g.addColorStop(0, "rgba(255,250,220,0.95)");
  g.addColorStop(1, "rgba(150,200,255,0.75)");
  ctx.fillStyle = g;
  ctx.fillRect(x, y, TILE, bottom - y);
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  for (let i = 0; i < 4; i++) {
    const py = bottom - ((t * 40 + i * 17) % (TILE * 2));
    ctx.fillRect(x + 5 + i * 7, py, 2, 2);
  }
  ctx.fillStyle = "#1c2a5a";
  ctx.fillRect(x - 10, y - 26, TILE + 20, 14);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 10px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("POLICE", x + TILE / 2, y - 18);
  const blue = Math.floor(t * 3) % 2 === 0;
  glow(ctx, x - 6, y - 4, 16, "60,120,255", blue ? 0.7 : 0.15);
  glow(ctx, x + TILE + 6, y - 4, 16, "255,60,60", blue ? 0.15 : 0.7);
  ctx.fillStyle = blue ? "#4a8aff" : "#24346e";
  ctx.fillRect(x - 9, y - 8, 6, 6);
  ctx.fillStyle = blue ? "#6a1a1a" : "#ff4a4a";
  ctx.fillRect(x + TILE + 3, y - 8, 6, 6);
}

// ---------- Backgrounds ----------

function drawCitySky(ctx, theme) {
  const g = ctx.createLinearGradient(0, 0, 0, 544);
  g.addColorStop(0, theme.sky[0]);
  g.addColorStop(0.6, theme.sky[1]);
  g.addColorStop(1, theme.sky[2]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 960, 544);
}

function drawClouds(ctx, offset, t) {
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  const width = 1100;
  const start = -(((offset + t * 8) % width) + width) % width;
  for (let k = start; k < 960 + width; k += width) {
    for (const [x, y, s] of [[120, 80, 1], [480, 50, 1.3], [820, 110, 0.9]]) {
      for (const [dx, dy, r] of [[0, 0, 22], [24, -8, 26], [50, 0, 20]]) {
        ctx.beginPath();
        ctx.arc(k + x + dx * s, y + dy * s, r * s, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

// Buildings with windows. Which windows are lit depends only on the building, the floor and the
// column, so the pattern moves with the buildings and never blinks while the child runs.
function drawSkyline(ctx, offset, baseY, color, windows) {
  const width = 1000;
  const start = -((offset % width) + width) % width;
  for (let k = start; k < 960 + width; k += width) {
    [[0, 70, 160], [80, 50, 230], [140, 90, 130], [240, 60, 280], [310, 80, 180], [400, 50, 250], [460, 100, 150], [570, 60, 300], [640, 80, 200], [730, 70, 140], [810, 60, 240], [880, 110, 170]].forEach(([x, w, h], b) => {
      ctx.fillStyle = color;
      ctx.fillRect(k + x, baseY - h, w, h);
      if (!windows) return;
      ctx.fillStyle = windows;
      let floor = 0;
      for (let wy = baseY - h + 16; wy < baseY - 20; wy += 28, floor++) {
        let col = 0;
        for (let wx = k + x + 10; wx < k + x + w - 14; wx += 20, col++) {
          if ((b * 7 + floor * 3 + col * 5) % 3 === 0) continue;
          ctx.fillRect(wx, wy, 7, 9);
        }
      }
    });
  }
}

function drawTrees(ctx, offset, baseY) {
  const width = 300;
  const start = -((offset % width) + width) % width;
  for (let x = start; x < 960 + width; x += width) {
    for (const [dx, r] of [[40, 34], [180, 44]]) {
      ctx.fillStyle = "#6a4a2a";
      ctx.fillRect(x + dx - 5, baseY - 40, 10, 40);
      ctx.fillStyle = "#3f8a3a";
      ctx.beginPath();
      ctx.arc(x + dx, baseY - 40 - r * 0.6, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#5aaa4a";
      ctx.beginPath();
      ctx.arc(x + dx - r * 0.3, baseY - 48 - r * 0.7, r * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// The street in front of the sunset: little houses with lit windows, trees and street lamps.
// Like in drawSkyline, which windows are lit depends only on the house, the floor and the column.
function drawEveningStreet(ctx, offset, baseY) {
  const width = 960;
  const start = -((offset % width) + width) % width;
  for (let k = start; k < 960 + width; k += width) {
    [[0, 90, 110, "#9a5a72", true], [100, 70, 80, "#b8705e", false], [200, 110, 130, "#6e5a8e", false], [330, 80, 95, "#a8647a", true], [520, 100, 120, "#7a6a9a", false], [630, 70, 85, "#b8705e", true], [800, 120, 105, "#8e5a7e", false]].forEach(([x, w, h, color, gable], b) => {
      const hx = k + x;
      ctx.fillStyle = "#4e3450"; // the roof
      if (gable) {
        ctx.beginPath();
        ctx.moveTo(hx - 4, baseY - h);
        ctx.lineTo(hx + w / 2, baseY - h - 28);
        ctx.lineTo(hx + w + 4, baseY - h);
        ctx.fill();
      } else {
        ctx.fillRect(hx - 3, baseY - h - 6, w + 6, 6);
      }
      ctx.fillStyle = color;
      ctx.fillRect(hx, baseY - h, w, h);
      let floor = 0;
      for (let wy = baseY - h + 14; wy < baseY - 34; wy += 26, floor++) {
        let col = 0;
        for (let wx = hx + 10; wx < hx + w - 16; wx += 22, col++) {
          ctx.fillStyle = (b * 5 + floor * 3 + col * 7) % 4 === 0 ? "#4a3a58" : "#ffd890";
          ctx.fillRect(wx, wy, 10, 12);
        }
      }
      ctx.fillStyle = "#3e2a3a"; // the front door
      ctx.fillRect(hx + w / 2 - 7, baseY - 22, 14, 22);
    });
    for (const [cx, r] of [[445, 22], [492, 18], [728, 20]]) {
      ctx.fillStyle = "#3a2a2a";
      ctx.fillRect(k + cx - 4, baseY - 30, 8, 30);
      ctx.fillStyle = "#3e5e4e";
      ctx.beginPath();
      ctx.arc(k + cx, baseY - 30 - r * 0.7, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#56765a";
      ctx.beginPath();
      ctx.arc(k + cx - r * 0.3, baseY - 36 - r * 0.9, r * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    for (const cx of [185, 318, 775, 940]) {
      ctx.fillStyle = "#2a2a3a";
      ctx.fillRect(k + cx - 2, baseY - 70, 4, 70);
      ctx.fillRect(k + cx - 6, baseY - 76, 12, 5);
      glow(ctx, k + cx, baseY - 68, 34, "255,220,140", 0.45);
      ctx.fillStyle = "#fff0b0";
      ctx.fillRect(k + cx - 4, baseY - 71, 8, 5);
    }
  }
}

// Cream stone walls with white columns.
function drawTownHallWall(ctx, offset) {
  const bw = 64;
  ctx.fillStyle = "rgba(160,130,90,0.18)";
  for (let row = 0; row < 12; row++) {
    const shift = (row % 2) * bw / 2;
    const start = -((offset + shift) % bw + bw) % bw;
    ctx.fillRect(0, row * 34, 960, 2);
    for (let x = start; x < 960; x += bw) ctx.fillRect(x, row * 34, 2, 34);
  }
  const pillars = 320;
  const pstart = -((offset % pillars) + pillars) % pillars;
  for (let x = pstart; x < 960; x += pillars) {
    ctx.fillStyle = "#f8f4ea";
    ctx.fillRect(x + 10, 70, 30, 330);
    ctx.fillStyle = "#dcd2bc";
    for (let i = 0; i < 3; i++) ctx.fillRect(x + 16 + i * 8, 80, 2, 310);
    ctx.fillStyle = "#e8e0cc";
    ctx.fillRect(x + 2, 60, 46, 12);
    ctx.fillRect(x + 4, 396, 42, 10);
  }
  ctx.fillStyle = "#c8b48a"; // panelling
  ctx.fillRect(0, 400, 960, 144);
  ctx.fillStyle = "#c8a040";
  ctx.fillRect(0, 398, 960, 3);
}

// Light walls with a cell, a big police badge and a notice board.
function drawPrecinctWall(ctx, offset) {
  ctx.fillStyle = "#9ab2d8"; // the lower half of the wall
  ctx.fillRect(0, 380, 960, 164);
  ctx.fillStyle = "#6a8ac0";
  ctx.fillRect(0, 376, 960, 5);
  const width = 600;
  const start = -((offset % width) + width) % width;
  for (let x = start; x < 960 + width; x += width) {
    // a cell with bars
    ctx.fillStyle = "#b8c0d0";
    ctx.fillRect(x + 40, 190, 170, 190);
    ctx.fillStyle = "#6a7080";
    ctx.fillRect(x + 36, 184, 178, 8);
    for (let bx = x + 48; bx < x + 210; bx += 16) ctx.fillRect(bx, 190, 4, 190);
    ctx.fillRect(x + 40, 280, 170, 4);
    // a big police badge
    const cx = x + 330;
    ctx.fillStyle = "#e8b923";
    ctx.beginPath();
    for (let i = 0; i < 12; i++) {
      const r = i % 2 ? 30 : 46;
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
      ctx.lineTo(cx + Math.cos(a) * r, 150 + Math.sin(a) * r);
    }
    ctx.fill();
    ctx.fillStyle = "#2a5ab0";
    ctx.beginPath();
    ctx.arc(cx, 150, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e8b923";
    ctx.fillRect(cx - 3, 136, 6, 28);
    // a notice board
    ctx.fillStyle = "#b08050";
    ctx.fillRect(x + 440, 230, 110, 80);
    for (const [px, py, c] of [[450, 240, "#ffffff"], [480, 250, "#fff3a0"], [515, 238, "#ffd0d0"], [460, 275, "#d0e8ff"], [500, 280, "#ffffff"]]) {
      ctx.fillStyle = c;
      ctx.fillRect(x + px, py, 24, 22);
    }
  }
}

function drawSunset(ctx, x, y, r) {
  ctx.fillStyle = "rgba(255,200,120,0.25)";
  ctx.beginPath();
  ctx.arc(x, y, r * 1.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffd27a";
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawBackground(ctx, themeName, camX, t) {
  const theme = CITY_THEMES[themeName];
  drawCitySky(ctx, theme);
  if (themeName === "park") {
    drawClouds(ctx, camX * 0.05, t);
    drawSkyline(ctx, camX * 0.15, 430, "#a8c4dc", "rgba(255,255,255,0.3)");
    drawHills(ctx, camX * 0.3, 450, "#5aa84a", 14, 0.008);
    drawTrees(ctx, camX * 0.45, 470);
  } else if (themeName === "townhall") {
    drawTownHallWall(ctx, camX * 0.5);
  } else if (themeName === "precinct") {
    drawPrecinctWall(ctx, camX * 0.5);
  } else if (themeName === "square") {
    drawSunset(ctx, 480 - camX * 0.02, 380, 60);
    drawSkyline(ctx, camX * 0.12, 430, "#8a5a8a", "rgba(255,226,160,0.4)");
    drawEveningStreet(ctx, camX * 0.3, 480);
  }
}

export const cityArt = {
  tile: cityTile,
  drawBackground,
  drawDecoration,
  drawEnemy: drawCrook,
  enemyBurst: ["#4a8aff", "#ff4a4a"],
  bonusSprite: badgeSprite,
  bonusGlow: "rgba(255,214,90,0.32)",
  drawDoor: drawTownhouseDoor,
  drawBoss: drawMayor,
  drawPortal: drawPoliceStation,
};
