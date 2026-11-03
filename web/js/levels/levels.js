// Level definitions. Each level is built from platforming chunks (see builder.js)
// with one magic door or spell book per task, so any number of tasks fits.

export const LEVELS = [
  {
    n: 1,
    title: "The Castle Garden",
    topic: "Letters a, b, c, d",
    say: "Level one. The castle garden. Letters!",
    theme: "garden",
    chunksPerTask: [1, 1],
    pool: ["flat", "pitSmall", "steps", "ghostFlat"],
  },
  {
    n: 2,
    title: "The Library",
    topic: "Little words",
    say: "Level two. The library. Little words!",
    theme: "library",
    chunksPerTask: [1, 2],
    pool: ["flat", "pitSmall", "steps", "ghostFlat", "shelves", "pillars"],
  },
  {
    n: 3,
    title: "The Potion Cellar",
    topic: "Colours, toys & family",
    say: "Level three. The potion cellar. Colours, toys and family!",
    theme: "dungeon",
    chunksPerTask: [1, 2],
    pool: ["pitSmall", "steps", "ghostFlat", "shelves", "pillars", "highRoute", "doublePit"],
  },
  {
    n: 4,
    title: "The Astronomy Tower",
    topic: "Sentences",
    say: "Level four. The astronomy tower. Sentences!",
    theme: "tower",
    chunksPerTask: [1, 2],
    pool: ["steps", "ghostFlat", "shelves", "pillars", "highRoute", "doublePit"],
    bossTasks: 2, // the last N tasks are asked by the sphinx at the top of the tower
  },
];
