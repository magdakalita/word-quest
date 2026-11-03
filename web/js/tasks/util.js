import { drawPic } from "../pics.js";
import { display } from "../speech.js";

export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else if (k === "text") node.textContent = v;
    else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v);
  }
  for (const c of children.flat()) if (c != null) node.append(c);
  return node;
}

export function shuffle(arr, avoidOriginal = false) {
  const a = [...arr];
  for (let tries = 0; tries < 10; tries++) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    if (!avoidOriginal || a.length < 2 || a.some((x, i) => x !== arr[i])) break;
  }
  return a;
}

// Normalize typography so that only the language matters.
export function normalize(s) {
  return String(s)
    .replace(/[„“”"]/g, '"')
    .replace(/[‚‘’`´]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.!?;:])/g, "$1")
    .trim()
    .replace(/[.!?]+$/, "")
    .trim();
}

const stripCommas = (s) => s.replace(/,/g, "").replace(/\s+/g, " ");

// Compare an answer against the accepted solutions.
// Returns { ok, note } – small slips (capitalization, a missing comma) are accepted with a note.
export function compare(answer, accepted) {
  const a = normalize(answer);
  if (!a) return { ok: false };
  const list = accepted.map(normalize);
  if (list.includes(a)) return { ok: true };
  if (list.some((s) => s.toLowerCase() === a.toLowerCase())) {
    return { ok: true, note: "Watch the big and small letters!" };
  }
  if (list.some((s) => stripCommas(s).toLowerCase() === stripCommas(a).toLowerCase())) {
    return { ok: true, note: "Almost perfect – don't forget the comma!" };
  }
  return { ok: false };
}

export function wordCount(text) {
  return (text.trim().match(/[\p{L}\p{N}]+/gu) || []).length;
}

// An item is a card shown in a task: a word or letter ("she"), a picture ({ pic: "🐶", say: "dog" }),
// a drawing in a colour ({ draw: "box", color: "blue" }), a letter sound ({ sound: "a" } – a 🔊 card
// that plays web/audio/a.m4a) or a mix ({ text: "doll", pic: "🪆" }).
export const asItem = (x) => (typeof x === "string" ? { text: x } : x);

// What the item is called – for solutions and the review list.
export function itemLabel(x) {
  const i = asItem(x);
  return display(i.text ?? i.sound ?? i.say ?? i.pic ?? [i.color, i.draw].filter(Boolean).join(" "));
}

// What the voice says for the item. A lone small letter says its sound ("[a]" = /æ/), not its name
// ("ay"). The word "I" stays a word.
export function itemSay(x) {
  const i = asItem(x);
  if (i.say) return i.say;
  if (i.sound) return `[${i.sound}]`;
  if (/^[a-z]$/.test(i.text ?? "")) return `[${i.text}]`;
  return i.text ?? [i.color, i.draw === "blob" ? "" : i.draw].filter(Boolean).join(" ");
}

// A 🔊 card means nothing until you hear it, so it always plays its sound when tapped.
export const speaksWhenTapped = (task, x) => !!(task.speak_options || asItem(x).sound);

export function renderItem(x) {
  const i = asItem(x);
  const node = el("span", { class: "item" });
  if (i.draw || i.color) node.append(drawPic(i.draw ?? "blob", i.color));
  // A sound card shows its (small) letter too – the sound and the letter always go together.
  if (i.sound) node.append(el("span", { class: "sound-letter" }, el("span", { class: "pic sound", text: "🔊", "aria-label": "sound" }), el("span", { class: "word", text: i.sound })));
  if (i.pic) node.append(el("span", { class: "pic", text: i.pic }));
  if (i.text) node.append(el("span", { class: "word", text: display(i.text) }));
  return node;
}
