import { el, shuffle, compare } from "./util.js";

// { text: "It's a ___ cupcake.", answers: [["pink"]], bank: ["pink", "blue", …] }
// The gaps are filled by tapping the words in the bank – no keyboard needed.
export function render(task, body) {
  const parts = task.text.split("___");
  const inputs = [];
  let focused = null;

  const sentence = el("p", { class: "sentence" });
  parts.forEach((part, i) => {
    sentence.append(part);
    if (i < parts.length - 1) {
      const input = el("input", { type: "text", readonly: "", inputmode: "none", autocomplete: "off", spellcheck: "false", "aria-label": `Gap ${i + 1}` });
      input.addEventListener("focus", () => (focused = input));
      input.addEventListener("click", () => {
        // Tapping a filled gap empties it again.
        input.value = "";
        input.classList.remove("right", "wrong");
      });
      inputs.push(input);
      sentence.append(input);
    }
  });
  if (task.context) body.append(el("p", { class: "context", text: task.context }));
  body.append(sentence);

  const chips = el("div", { class: "chips" });
  for (const word of shuffle(task.bank)) {
    chips.append(el("button", {
      class: "chip",
      type: "button",
      text: word,
      onclick: () => {
        const target = focused && !focused.value ? focused : inputs.find((i) => !i.value) ?? focused ?? inputs[0];
        target.value = word;
        target.classList.remove("right", "wrong");
        focused = inputs.find((i) => !i.value) ?? target;
      },
    }));
  }
  body.append(chips);

  const filled = () => parts.map((p, i) => p + (i < inputs.length ? task.answers[i][0] : "")).join("");

  return {
    focus: () => chips.firstChild?.focus(),
    check() {
      if (inputs.some((i) => !i.value.trim())) return { ok: false, incomplete: true, note: "Tap a word to fill the gap." };
      let ok = true;
      const notes = new Set();
      inputs.forEach((input, i) => {
        const r = compare(input.value, task.answers[i]);
        input.classList.toggle("right", r.ok);
        input.classList.toggle("wrong", !r.ok);
        if (!r.ok) ok = false;
        if (r.note) notes.add(r.note);
      });
      return { ok, note: [...notes].join(" ") };
    },
    reveal() {
      inputs.forEach((input, i) => {
        input.value = task.answers[i][0];
        input.classList.remove("wrong");
        input.classList.add("right");
      });
    },
    solutionText: filled,
    solutionSay: filled,
    answerText: () => inputs.map((i) => i.value).join(" | "),
  };
}
