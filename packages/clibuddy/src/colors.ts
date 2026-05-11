import ansis, { bold, cyan, dim, green, italic, underline } from "ansis";

// hex-from-string factory; matches the previous public API.
export const colorize = (hex: string) => ansis.hex(hex);

// Curated semantic palette used across our CLIs.
export const palette = {
  // structural
  bold,
  italic,
  link: underline,
  // tones
  muted: ansis.hex("#a8afb5"),
  primary: ansis.hex("#36d399"),
  dim,
  // semantic
  highlight: cyan,
  success: green,
  label: (s: string) => ansis.bgMagenta.black(s),
};
