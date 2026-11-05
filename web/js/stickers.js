// Stickers: every magic book in a unit holds one. Solving the book's task puts it in the album.
// Each world has its own stickers (see worlds.js) and its own album.

import { LEVELS } from "./levels/levels.js";
import { buildLevel } from "./levels/builder.js";

// The books of a unit in order: [{ level, taskId, sticker }]. Levels are built the same way
// every time and in every world (see buildLevel), so a book always holds the same sticker.
export function unitBooks(tasks, stickers) {
  const books = [];
  for (const def of LEVELS) {
    const levelTasks = tasks.filter((t) => t.level === def.n);
    if (!levelTasks.length) continue;
    for (const tr of buildLevel(def, levelTasks).triggers) {
      if (tr.kind !== "book") continue;
      for (const taskId of tr.taskIds) books.push({ level: def.n, taskId, sticker: stickers[books.length % stickers.length] });
    }
  }
  return books;
}
