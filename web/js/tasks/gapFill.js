import { el, shuffle, compare, asItem, renderItem, itemLabel, itemSay } from "./util.js";
import { speech, display } from "../speech.js";

// { text: "___ a boy.", answers: [["I'm"]], bank: ["I'm", "You're", …] }
// The text can also be a picture sentence (a rebus) and the bank can hold pictures:
// { text: ["It's a ", "___", " ", { pic: "🧁", say: "cupcake" }, "."], answers: [["pink"]],
//   bank: [{ color: "pink", say: "pink" }, …] }
// The gaps are filled by tapping the cards in the bank – no keyboard needed.
// With speak_options, tapping a card says it. Answers are compared by the card's name (itemLabel).
const GAP = "___";

// "It's a ___ cupcake." or a list of strings and items -> [string | item | GAP, …]
function segments(text) {
  const out = [];
  for (const part of [text].flat()) {
    if (typeof part !== "string") {
      out.push(part);
      continue;
    }
    part.split(GAP).forEach((s, i) => {
      if (i > 0) out.push(GAP);
      if (s) out.push(s);
    });
  }
  return out;
}

export function render(task, body) {
  const parts = segments(task.text);
  const gaps = []; // { node, item }
  let focused = null;

  function set(gap, item) {
    gap.item = item;
    gap.node.replaceChildren(...(item ? [renderItem(item)] : []));
    gap.node.classList.toggle("filled", !!item);
    gap.node.classList.remove("right", "wrong");
  }

  const sentence = el("p", { class: "sentence" });
  for (const part of parts) {
    if (part === GAP) {
      const gap = { node: el("button", { class: "gap", type: "button", "aria-label": `Gap ${gaps.length + 1}` }), item: null };
      gap.node.addEventListener("click", () => {
        // Tapping a filled gap empties it again.
        set(gap, null);
        focused = gap;
      });
      gaps.push(gap);
      sentence.append(gap.node);
    } else if (typeof part === "string") {
      sentence.append(display(part));
    } else {
      sentence.append(renderItem(part));
    }
  }
  if (task.context) body.append(el("p", { class: "context", text: task.context }));
  body.append(sentence);

  const chips = el("div", { class: "chips" });
  for (const card of shuffle(task.bank)) {
    chips.append(el("button", {
      class: "chip",
      type: "button",
      "data-label": itemLabel(card),
      onclick: () => {
        if (task.speak_options) speech.say(itemSay(card));
        const target = focused && !focused.item ? focused : gaps.find((g) => !g.item) ?? focused ?? gaps[0];
        set(target, card);
        focused = gaps.find((g) => !g.item) ?? target;
      },
    }, renderItem(card)));
  }
  body.append(chips);

  // The card that answers gap i – for the solution.
  const answerCard = (i) => task.bank.find((c) => itemLabel(c) === task.answers[i][0]) ?? task.answers[i][0];
  const filled = () => {
    let g = 0;
    return parts.map((p) => (p === GAP ? itemLabel(answerCard(g++)) : typeof p === "string" ? display(p) : itemLabel(p))).join("");
  };

  return {
    check() {
      if (gaps.some((g) => !g.item)) return { ok: false, incomplete: true, note: "Tap a card to fill the gap." };
      let ok = true;
      const notes = new Set();
      gaps.forEach((gap, i) => {
        const r = compare(itemLabel(gap.item), task.answers[i]);
        gap.node.classList.toggle("right", r.ok);
        gap.node.classList.toggle("wrong", !r.ok);
        if (!r.ok) ok = false;
        if (r.note) notes.add(r.note);
      });
      return { ok, note: [...notes].join(" ") };
    },
    reveal() {
      gaps.forEach((gap, i) => {
        set(gap, asItem(answerCard(i)));
        gap.node.classList.add("right");
      });
    },
    solutionText: filled,
    solutionSay: () => task.say ?? filled(),
    answerText: () => gaps.map((g) => (g.item ? itemLabel(g.item) : "")).join(" | "),
  };
}
