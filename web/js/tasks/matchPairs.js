import { el, shuffle, renderItem, itemLabel, itemSay, speaksWhenTapped } from "./util.js";
import { speech } from "../speech.js";

const COLORS = ["#8e1b1b", "#1d4a7a", "#2c6a2c", "#7a5a0b", "#5a2a7a", "#0b6a6a", "#8a3a0b", "#4a4a4a"];

// { pairs: [["b", { pic: "⚽", say: "ball" }], …], speak_options?: true }
// Each side is an item (see util.js). With speak_options, tapping a card says its name (🔊 cards always do).
// A pair can start on either side: tap a card, then a card in the other column. Another card in the
// same column only changes which card is chosen.
export function render(task, body) {
  if (task.context) body.append(el("p", { class: "context", text: task.context }));
  const lefts = shuffle(task.pairs.map((p, i) => ({ i, item: p[0] })));
  const rights = shuffle(task.pairs.map((p, i) => ({ i, item: p[1] })), true);
  const links = new Map(); // left index -> right index
  let active = null; // the chosen card: { side: "left" | "right", i }

  const leftCol = el("div", { class: "col" });
  const rightCol = el("div", { class: "col" });
  body.append(el("div", { class: "pairs" }, leftCol, rightCol));

  function tap(side, i, item) {
    if (speaksWhenTapped(task, item)) speech.say(itemSay(item));
    if (active?.side === side && active.i === i) active = null; // the same card again: not chosen any more
    else if (!active || active.side === side) active = { side, i }; // the old pair stays until the other side is chosen
    else {
      const [li, ri] = side === "left" ? [i, active.i] : [active.i, i];
      for (const [l, r] of links) if (r === ri) links.delete(l);
      links.set(li, ri);
      active = null; // nothing is chosen until the child taps the next card
    }
    paint();
  }

  const leftBtns = new Map();
  const rightBtns = new Map();
  for (const [side, cards, btns, col] of [["left", lefts, leftBtns, leftCol], ["right", rights, rightBtns, rightCol]]) {
    for (const c of cards) {
      const b = el("button", { class: "pair-item", type: "button" }, el("span", { class: "tag" }), renderItem(c.item));
      b.addEventListener("click", () => tap(side, c.i, c.item));
      btns.set(c.i, b);
      col.append(b);
    }
  }

  function paint() {
    const order = lefts.map((l) => l.i);
    for (const [i, b] of leftBtns) {
      const linked = links.has(i);
      const n = order.indexOf(i);
      b.classList.toggle("active", active?.side === "left" && active.i === i);
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
      b.classList.toggle("active", active?.side === "right" && active.i === i);
      b.classList.toggle("linked", li !== undefined);
      b.classList.remove("right", "wrong");
      tag.textContent = li !== undefined ? n + 1 : "";
      tag.style.background = li !== undefined ? COLORS[n % COLORS.length] : "";
      b.style.borderColor = li !== undefined ? COLORS[n % COLORS.length] : "";
    }
  }

  paint();

  return {
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
