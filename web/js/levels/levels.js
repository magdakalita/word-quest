// Level definitions. Each level is built from platforming chunks (see builder.js)
// with one magic door or spell book per task, so any number of tasks fits.
// The same levels are played in every world; a world gives each one its title, voice line
// and look (see worlds.js and levelDef there).

export const LEVELS = [
  {
    n: 1,
    topic: "Letters a, b, c, d",
    chunksPerTask: [1, 1],
    pool: ["flat", "pitSmall", "steps", "ghostFlat"],
    ghosts: 10,
  },
  {
    n: 2,
    topic: "Little words",
    chunksPerTask: [1, 2],
    pool: ["flat", "pitSmall", "steps", "ghostFlat", "shelves", "pillars"],
    ghosts: 11,
  },
  {
    n: 3,
    topic: "Colours, toys & family",
    chunksPerTask: [1, 2],
    pool: ["pitSmall", "steps", "ghostFlat", "shelves", "pillars", "highRoute", "doublePit"],
    ghosts: 12,
  },
  {
    n: 4,
    topic: "Sentences",
    chunksPerTask: [1, 2],
    pool: ["steps", "ghostFlat", "shelves", "pillars", "highRoute", "doublePit"],
    ghosts: 12,
    bossTasks: 2, // the last N tasks are asked by the sphinx at the top of the tower
  },
];
