import { el, shuffle, asItem, renderItem, itemLabel, itemSay, speaksWhenTapped } from "./util.js";
import { speech } from "../speech.js";

// "Listen and tap": { say?: "she", options: [item, …], answer: 0, speak_options?: true }
// answer = index of the correct option. With speak_options, tapping a card says its name
// (for "Which one starts with c?" – the child must hear the word, not read it).
export function render(task, body) {
  const order = shuffle(task.options.map((_, i) => i));
  let selected = null;
  const buttons = new Map();
  const list = el("div", { class: "pick" });
  for (const i of order) {
    const b = el("button", { class: "pick-card", type: "button" }, renderItem(task.options[i]));
    b.addEventListener("click", () => {
      selected = i;
      if (speaksWhenTapped(task, task.options[i])) speech.say(itemSay(task.options[i]));
      for (const [j, other] of buttons) {
        other.classList.toggle("selected", j === i);
        other.classList.remove("right", "wrong");
      }
    });
    buttons.set(i, b);
    list.append(b);
  }
  if (task.options.every((o) => asItem(o).text && !asItem(o).pic)) list.classList.add("words");
  body.append(list);

  return {
    focus: () => buttons.get(order[0])?.focus(),
    check() {
      if (selected === null) return { ok: false, incomplete: true, note: "Tap a card first." };
      const ok = selected === task.answer;
      buttons.get(selected).classList.add(ok ? "right" : "wrong");
      return { ok };
    },
    reveal() {
      for (const [j, b] of buttons) {
        b.classList.toggle("selected", false);
        b.classList.toggle("right", j === task.answer);
        b.classList.toggle("wrong", j === selected && j !== task.answer);
      }
    },
    solutionText: () => itemLabel(task.options[task.answer]),
    solutionSay: () => itemSay(task.options[task.answer]),
    answerText: () => (selected === null ? "" : itemLabel(task.options[selected])),
  };
}
