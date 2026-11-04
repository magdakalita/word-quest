import { el, renderItem, asItem, itemSay, normalize } from "./util.js";
import { speech, display } from "../speech.js";
import * as pick from "./pick.js";
import * as gapFill from "./gapFill.js";
import * as wordOrder from "./wordOrder.js";
import * as matchPairs from "./matchPairs.js";

const TYPES = {
  pick,
  gap_fill: gapFill,
  word_order: wordOrder,
  match_pairs: matchPairs,
};

const PRAISE = ["Great job!", "Super!", "Well done!", "Brilliant!", "Yes, that's right!", "Perfect!", "Amazing!", "Remarkable!", "Awesome!"];
let lastPraise = null;

// A random praise – never the same one twice in a row.
function nextPraise() {
  const choices = PRAISE.filter((p) => p !== lastPraise);
  lastPraise = choices[Math.floor(Math.random() * choices.length)];
  return lastPraise;
}

const $ = (id) => document.getElementById(id);

// Shows tasks one after another. Resolves with one result per task.
// Everything the child needs to understand is also spoken – the player cannot read yet.
// opts: { label(i) -> string, onProgress(n), sfx }
export function openTasks(tasks, opts) {
  const screen = $("task");
  const body = $("task-body");
  const feedback = $("task-feedback");
  const checkBtn = $("task-check");
  const nextBtn = $("task-next");
  const listenBtn = $("task-listen");
  const results = [];

  return new Promise((resolve) => {
    let index = -1;
    let ui;
    let attempts;
    let task;

    const prompt = () => [task.instruction, task.say];

    function showNext() {
      index += 1;
      if (index >= tasks.length) {
        speech.stop();
        screen.hidden = true;
        document.removeEventListener("keydown", onKey);
        resolve(results);
        return;
      }
      task = tasks[index];
      attempts = 0;
      $("task-meta").textContent = opts.label(index);
      $("task-instruction").textContent = display(task.instruction);
      body.replaceChildren();
      if (task.show) body.append(showItem(task.show));
      feedback.hidden = true;
      feedback.className = "feedback";
      checkBtn.hidden = false;
      checkBtn.disabled = false;
      nextBtn.hidden = true;
      ui = TYPES[task.type].render(task, body);
      screen.hidden = false;
      screen.scrollTop = 0;
      speech.say(prompt());
    }

    function showFeedback(kind, ...content) {
      feedback.hidden = false;
      feedback.className = `feedback ${kind}`;
      feedback.replaceChildren(...content.filter(Boolean));
    }

    // answer: what the child chose – read before reveal() shows the solution.
    function finish(ok, answer) {
      const firstTry = ok && attempts === 1;
      const result = {
        taskId: task.id,
        level: task.level,
        type: task.type,
        instruction: display(task.instruction),
        answer,
        attempts,
        firstTry,
        stars: firstTry ? 3 : ok ? 1 : 0,
      };
      results.push(result);
      opts.onProgress?.(results.length);
      checkBtn.hidden = true;
      nextBtn.hidden = false;
      nextBtn.focus();
    }

    function onCheck() {
      const r = ui.check();
      if (r.incomplete) {
        showFeedback("", r.note);
        speech.say(r.note);
        return;
      }
      attempts += 1;
      const answer = ui.answerText();
      const explanation = task.explanation ? el("p", { text: display(task.explanation) }) : null;
      const note = r.note ? el("p", { text: r.note }) : null;

      if (r.ok) {
        const praise = nextPraise();
        opts.sfx.play("right");
        showFeedback("right", el("strong", { text: `${praise} ✨` }), note, explanation);
        speech.say([praise, task.explanation]);
        finish(true, answer);
      } else if (attempts === 1) {
        opts.sfx.play("wrong");
        showFeedback("wrong",
          el("strong", { text: "Not yet – try again! 🙂" }),
          task.hint ? el("p", { text: `💡 ${display(task.hint)}` }) : null,
        );
        speech.say(["Not yet. Try again!", task.hint]);
      } else {
        opts.sfx.play("wrong");
        ui.reveal();
        showFeedback("wrong",
          el("strong", { text: "Look, here is the answer:" }),
          el("p", { class: "solution", text: ui.solutionText() }),
          explanation,
        );
        const solution = ui.solutionSay?.();
        const same = (x, y) => [x, y].every(Boolean) && normalize(x).toLowerCase() === normalize(y).toLowerCase();
        // "It's my dog." and then "It's my dog!" again would be one time too many.
        speech.say(["Look, here is the answer.", solution, same(solution, task.explanation) ? null : task.explanation]);
        finish(false, answer);
      }
    }

    function onKey(e) {
      if (e.key !== "Enter") return;
      if (e.target.tagName === "BUTTON" && e.target !== nextBtn && e.target !== checkBtn) return;
      e.preventDefault();
      if (!nextBtn.hidden) nextBtn.click();
      else if (!checkBtn.hidden) checkBtn.click();
    }

    checkBtn.onclick = onCheck;
    nextBtn.onclick = showNext;
    listenBtn.onclick = () => speech.say(prompt());
    document.addEventListener("keydown", onKey);
    showNext();
  });
}

// The big letter or picture above a task. A letter (or 🔊 card) plays its sound when tapped.
function showItem(item) {
  const i = asItem(item);
  if (!i.sound && !/^[a-z]$/.test(i.text ?? "")) return el("div", { class: "show" }, renderItem(item));
  const button = el("button", { class: "show-letter", type: "button", "aria-label": "Listen" }, renderItem(item));
  button.addEventListener("click", () => speech.say(itemSay(item)));
  return el("div", { class: "show" }, button);
}

export function isKnownType(type) {
  return type in TYPES;
}
