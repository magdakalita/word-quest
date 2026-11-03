import { el, shuffle, renderItem, itemLabel, itemSay } from "./util.js";
import { speech } from "../speech.js";

const COLORS = ["#8e1b1b", "#1d4a7a", "#2c6a2c", "#7a5a0b", "#5a2a7a", "#0b6a6a", "#8a3a0b", "#4a4a4a"];

// { pairs: [["b", { pic: "⚽", say: "ball" }], …], speak_options?: true }
// Each side is an item (see util.js). With speak_options, tapping a card says its name.
export function render(task, body) {
  if (task.context) body.append(el("p", { class: "context", text: task.context }));
  const lefts = shuffle(task.pairs.map((p, i) => ({ i, item: p[0] })));
  const rights = shuffle(task.pairs.map((p, i) => ({ i, item: p[1] })), true);
  const links = new Map(); // left index -> right index
  let active = null;

  const leftCol = el("div", { class: "col" });
  const rightCol = el("div", { class: "col" });
  body.append(el("div", { class: "pairs" }, leftCol, rightCol));

  const leftBtns = new Map();
  const rightBtns = new Map();
  for (const l of lefts) {
    const b = el("button", { class: "pair-item", type: "button" }, el("span", { class: "tag" }), renderItem(l.item));
    b.addEventListener("click", () => {
      if (task.speak_options) speech.say(itemSay(l.item));
      links.delete(l.i);
      active = l.i;
      paint();
    });
    leftBtns.set(l.i, b);
    leftCol.append(b);
  }
  for (const r of rights) {
    const b = el("button", { class: "pair-item", type: "button" }, el("span", { class: "tag" }), renderItem(r.item));
    b.addEventListener("click", () => {
      if (task.speak_options) speech.say(itemSay(r.item));
      for (const [li, ri] of links) if (ri === r.i) links.delete(li);
      if (active !== null) {
        links.set(active, r.i);
        active = lefts.map((x) => x.i).find((i) => !links.has(i)) ?? null;
      }
      paint();
    });
    rightBtns.set(r.i, b);
    rightCol.append(b);
  }

  function paint() {
    const order = lefts.map((l) => l.i);
    for (const [i, b] of leftBtns) {
      const linked = links.has(i);
      const n = order.indexOf(i);
      b.classList.toggle("active", active === i);
      b.classList.toggle("linked", linked);
      b.classList.remove("right", "wrong");
      const tag = b.querySelector(".tag");
      tag.textContent = linked ? n + 1 : "";
      tag.style.background = linked ? COLORS[n % COLORS.length] : "";
      b.style.borderColor = linked ? COLORS[n % COLORS.length] : "";
    }
    for (const [i, b] of rightBtns) {
      const li = [...links].find(([, ri]) => ri === i)?.[0];
      const n = order.indexOf(li);
      const tag = b.querySelector(".tag");
      b.classList.toggle("linked", li !== undefined);
      b.classList.remove("right", "wrong");
      tag.textContent = li !== undefined ? n + 1 : "";
      tag.style.background = li !== undefined ? COLORS[n % COLORS.length] : "";
      b.style.borderColor = li !== undefined ? COLORS[n % COLORS.length] : "";
    }
  }

  active = lefts[0].i;
  paint();

  return {
    focus: () => leftBtns.get(lefts[0].i)?.focus(),
    check() {
      if (links.size < task.pairs.length) return { ok: false, incomplete: true, note: "Make all the pairs." };
      let ok = true;
      for (const [li, ri] of links) {
        const good = li === ri;
        if (!good) ok = false;
        leftBtns.get(li).classList.add(good ? "right" : "wrong");
        rightBtns.get(ri).classList.add(good ? "right" : "wrong");
      }
      return { ok };
    },
    reveal() {
      links.clear();
      for (const p of task.pairs.keys()) links.set(p, p);
      active = null;
      paint();
      for (const b of [...leftBtns.values(), ...rightBtns.values()]) b.classList.add("right");
    },
    solutionText: () => task.pairs.map((p) => `${itemLabel(p[0])} – ${itemLabel(p[1])}`).join("; "),
    answerText: () => [...links].map(([l, r]) => `${itemLabel(task.pairs[l][0])} – ${itemLabel(task.pairs[r][1])}`).join("; "),
  };
}
