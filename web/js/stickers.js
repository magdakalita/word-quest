// Stickers: every magic book in a unit holds one. Solving the book's task puts it in the album.
// Each world has its own stickers (see worlds.js) and its own album.

import { LEVELS } from "./levels/levels.js";
import { buildLevel } from "./levels/builder.js";
import { levelSlots } from "./pool.js";

// The books of a unit in order: [{ level, slot, sticker }]. A sticker belongs to the book's slot
// (its place in the level), not to the task drawn for it, and levels are built the same way every
// time and in every world (see buildLevel), so a book always holds the same sticker.
export function unitBooks(unitData, stickers) {
  const books = [];
  for (const def of LEVELS) {
    const slots = levelSlots(unitData, def.n).map(({ slot }) => ({ id: slot, slot }));
    if (!slots.length) continue;
    for (const tr of buildLevel(def, slots).triggers) {
      if (tr.kind !== "book") continue;
      for (const slot of tr.slots) books.push({ level: def.n, slot, sticker: stickers[books.length % stickers.length] });
    }
  }
  return books;
}
