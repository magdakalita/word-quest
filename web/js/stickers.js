// Stickers: every magic book in a unit holds one. Solving the book's task puts it in the album.

import { LEVELS } from "./levels/levels.js";
import { buildLevel } from "./levels/builder.js";

export const STICKERS = [
  { pic: "🦄", say: "a unicorn" },
  { pic: "🐉", say: "a dragon" },
  { pic: "🦉", say: "an owl" },
  { pic: "🧚", say: "a fairy" },
  { pic: "🐸", say: "a frog" },
  { pic: "🦊", say: "a fox" },
  { pic: "🐢", say: "a turtle" },
  { pic: "🧜", say: "a mermaid" },
  { pic: "🐧", say: "a penguin" },
  { pic: "🦁", say: "a lion" },
  { pic: "🐙", say: "an octopus" },
  { pic: "🦋", say: "a butterfly" },
  { pic: "🐝", say: "a bee" },
  { pic: "🐳", say: "a whale" },
  { pic: "🦖", say: "a dinosaur" },
  { pic: "🐼", say: "a panda" },
  { pic: "🦩", say: "a flamingo" },
  { pic: "🐞", say: "a ladybird" },
  { pic: "🐿️", say: "a squirrel" },
  { pic: "🦔", say: "a hedgehog" },
];

// The books of a unit in order: [{ level, taskId, sticker }]. Levels are built the same way
// every time (see buildLevel), so a book always holds the same sticker.
export function unitBooks(tasks) {
  const books = [];
  for (const def of LEVELS) {
    const levelTasks = tasks.filter((t) => t.level === def.n);
    if (!levelTasks.length) continue;
    for (const tr of buildLevel(def, levelTasks).triggers) {
      if (tr.kind !== "book") continue;
      for (const taskId of tr.taskIds) books.push({ level: def.n, taskId, sticker: STICKERS[books.length % STICKERS.length] });
    }
  }
  return books;
}
