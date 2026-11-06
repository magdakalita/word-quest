// Task pools: every level has a fixed plan – one group per door, spell book or boss question,
// in order – and every group holds several tasks of the same kind. Each game draws one task per
// door from its group: never the same task twice in one game, and all tasks of a group before
// any of them comes back (the bags of not yet drawn tasks are kept with the player's progress).

// The doors of a level: [{ slot: "L1-02", group: "starts-with" }]. A slot is the number of the
// door in its level – stickers belong to the slot, not to the task drawn for it.
export function levelSlots(unitData, level) {
  return (unitData.plan?.[level] ?? []).map((group, i) => ({ slot: `L${level}-${String(i + 1).padStart(2, "0")}`, group }));
}

function shuffle(arr, random) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// The tasks for one game of a level, in door order, each with its slot. bags ({ "1:starts-with":
// [task ids still to come] }) is updated in place – save it with the progress afterwards.
export function drawLevel(unitData, level, bags, random = Math.random) {
  const tasks = unitData.tasks.filter((t) => t.level === level);
  const used = new Set();
  return levelSlots(unitData, level).map(({ slot, group }) => {
    const key = `${level}:${group}`;
    const ids = tasks.filter((t) => t.group === group).map((t) => t.id);
    let bag = (bags[key] ?? []).filter((id) => ids.includes(id) && !used.has(id));
    if (!bag.length) bag = shuffle(ids.filter((id) => !used.has(id)), random);
    const id = bag.shift();
    bags[key] = bag;
    used.add(id);
    return { ...tasks.find((t) => t.id === id), slot };
  });
}
