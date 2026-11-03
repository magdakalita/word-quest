// Simple drawings for things whose colour matters ("It's a blue box") – emoji have fixed colours.

export const COLOURS = {
  red: "#e53935",
  blue: "#1e6fe0",
  navy: "#1b2a5e",
  green: "#2e9e44",
  yellow: "#f7c722",
  pink: "#f48fb1",
  orange: "#fb8c00",
  purple: "#8e44ad",
  brown: "#8d5a2b",
  grey: "#8c9099",
  black: "#222222",
  white: "#ffffff",
};

const SHAPES = {
  // a paint blob – for "Tap the colour"
  blob: (c) => `<path d="M50 8c18 0 34 10 38 26 5 17-2 34-17 44-14 10-36 12-50 2C7 70 4 52 10 36 16 19 32 8 50 8z" fill="${c}" stroke="#2e1d0e" stroke-width="3"/>`,
  box: (c) => `
    <path d="M14 34 50 20l36 14v40L50 90 14 74z" fill="${c}" stroke="#2e1d0e" stroke-width="3" stroke-linejoin="round"/>
    <path d="M14 34 50 48l36-14M50 48v42" fill="none" stroke="#2e1d0e" stroke-width="3" stroke-linejoin="round"/>
    <path d="M14 34 50 48v42L14 74z" fill="#000" opacity=".12"/>`,
  ball: (c) => `
    <circle cx="50" cy="52" r="38" fill="${c}" stroke="#2e1d0e" stroke-width="3"/>
    <path d="M14 46c24 10 48 10 72 0M20 72c20-8 40-8 60 0" fill="none" stroke="#fff" stroke-width="5" opacity=".75"/>
    <ellipse cx="36" cy="32" rx="9" ry="5" fill="#fff" opacity=".5"/>`,
  cupcake: (c) => `
    <path d="M24 56h52l-8 36H32z" fill="#c9773a" stroke="#2e1d0e" stroke-width="3" stroke-linejoin="round"/>
    <path d="M38 58l2 32M50 58v32M62 58l-2 32" stroke="#2e1d0e" stroke-width="2" opacity=".5"/>
    <path d="M18 58c-6-12 4-20 12-18 0-12 12-18 20-14 2-12 14-14 20-6 8-2 16 8 10 18 8 4 6 16 0 20z" fill="${c}" stroke="#2e1d0e" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="50" cy="16" r="6" fill="#d81b60" stroke="#2e1d0e" stroke-width="2"/>`,
};

export function drawPic(shape, colour) {
  const fill = COLOURS[colour] ?? colour ?? "#ccc";
  const span = document.createElement("span");
  span.className = "drawing";
  span.innerHTML = `<svg viewBox="0 0 100 100" aria-hidden="true">${(SHAPES[shape] ?? SHAPES.blob)(fill)}</svg>`;
  return span;
}
