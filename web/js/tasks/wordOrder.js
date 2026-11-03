import { el, shuffle, compare, renderItem, itemLabel, itemSay } from "./util.js";
import { speech } from "../speech.js";

// { words: ["It's", "a", { color: "blue", say: "blue" }, { pic: "📦", say: "box" }] (in the correct order),
//   accepted?: ["other correct orders"], context?, speak_options? }
// A card can be a word or a picture (see util.js); the sentence is compared by the cards' names.
// With speak_options, tapping a card says it.
export function render(task, body) {
  const solution = task.words.map(itemLabel).join(" ");
  const accepted = [solution, ...(task.accepted ?? [])];

  if (task.context) body.append(el("p", { class: "context", text: task.context }));
  const line = el("div", { class: "chips answer-line" });
  const bank = el("div", { class: "chips" });
  body.append(line, bank);

  const chips = shuffle(task.words, true).map((card) => {
    const chip = el("button", { class: "chip", type: "button" }, renderItem(card));
    chip.dataset.label = itemLabel(card);
    chip.addEventListener("click", () => {
      if (task.speak_options) speech.say(itemSay(card));
      (chip.parentElement === bank ? line : bank).append(chip);
      line.classList.remove("wrong");
    });
    return chip;
  });
  bank.append(...chips);

  const current = () => [...line.children].map((c) => c.dataset.label).join(" ");

  return {
    check() {
      if (bank.children.length) return { ok: false, incomplete: true, note: "Use all the cards." };
      return compare(current(), accepted);
    },
    reveal() {
      line.replaceChildren(...task.words.map((w) => el("span", { class: "chip" }, renderItem(w))));
      bank.replaceChildren();
    },
    solutionText: () => solution,
    solutionSay: () => task.say ?? solution,
    answerText: current,
  };
}
