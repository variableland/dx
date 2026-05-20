import * as cjson from "comment-json";
import type { JsonEdit } from "#src/plugin/types.ts";

/**
 * Applies a sequence of `JsonEdit` ops to a JSON / JSONC source string.
 * Uses `comment-json` so user comments and `extends`-like top-level shape
 * survive a parse → mutate → stringify round-trip.
 *
 * Paths follow JSON Pointer (RFC 6901): `"/extends"`,
 * `"/compilerOptions/strict"`. Indices are valid path segments for arrays
 * (`"/extends/0"`).
 */
export function applyJsonEdits(source: string, edits: JsonEdit[]): string {
  // biome-ignore lint/suspicious/noExplicitAny: cjson exposes the parsed tree as a structurally-typed JS object/array
  let root: any = source.trim() === "" ? {} : cjson.parse(source);
  if (root == null || typeof root !== "object") {
    throw new Error(`applyJsonEdits: expected a JSON object/array at the top level, got ${typeof root}.`);
  }
  for (const edit of edits) {
    root = applyOne(root, edit);
  }
  return `${cjson.stringify(root, null, 2)}\n`;
}

// biome-ignore lint/suspicious/noExplicitAny: see above
function applyOne(root: any, edit: JsonEdit): any {
  const segments = parsePointer(edit.path);
  if (edit.op === "set") {
    const existing = resolve(root, segments);
    if (edit.mode === "if-missing" && existing !== undefined) return root;
    return setAt(root, segments, edit.value);
  }
  if (edit.op === "unset") {
    return unsetAt(root, segments);
  }
  if (edit.op === "include") {
    return includeInArray(root, segments, edit.value, edit.position ?? "end");
  }
  if (edit.op === "exclude") {
    return excludeFromArray(root, segments, edit.value);
  }
  return root;
}

/** Parses a JSON Pointer (RFC 6901) into its segments, decoding `~1` and `~0`. */
function parsePointer(pointer: string): string[] {
  if (pointer === "" || pointer === "/") return [];
  if (!pointer.startsWith("/")) {
    throw new Error(`Invalid JSON Pointer "${pointer}": must start with "/" or be empty.`);
  }
  return pointer
    .slice(1)
    .split("/")
    .map((s) => s.replace(/~1/g, "/").replace(/~0/g, "~"));
}

// biome-ignore lint/suspicious/noExplicitAny: see above
function resolve(root: any, segments: string[]): unknown {
  // biome-ignore lint/suspicious/noExplicitAny: see above
  let cur: any = root;
  for (const seg of segments) {
    if (cur == null) return undefined;
    cur = cur[arrayIndexIfNumeric(cur, seg)];
  }
  return cur;
}

// biome-ignore lint/suspicious/noExplicitAny: see above
function setAt(root: any, segments: string[], value: unknown): any {
  if (segments.length === 0) {
    // Replacing the whole root — uncommon for our use cases but harmless.
    return value;
  }
  // biome-ignore lint/suspicious/noExplicitAny: see above
  let cur: any = root;
  for (let i = 0; i < segments.length - 1; i++) {
    const seg = segments[i] ?? "";
    const key = arrayIndexIfNumeric(cur, seg);
    if (cur[key] == null || typeof cur[key] !== "object") {
      cur[key] = isNumericIndex(segments[i + 1] ?? "") ? [] : {};
    }
    cur = cur[key];
  }
  const last = segments[segments.length - 1] ?? "";
  cur[arrayIndexIfNumeric(cur, last)] = value;
  return root;
}

// biome-ignore lint/suspicious/noExplicitAny: see above
function unsetAt(root: any, segments: string[]): any {
  if (segments.length === 0) return root;
  // biome-ignore lint/suspicious/noExplicitAny: see above
  let cur: any = root;
  for (let i = 0; i < segments.length - 1; i++) {
    const seg = segments[i] ?? "";
    if (cur == null) return root;
    cur = cur[arrayIndexIfNumeric(cur, seg)];
  }
  if (cur == null) return root;
  const last = segments[segments.length - 1] ?? "";
  if (Array.isArray(cur) && isNumericIndex(last)) {
    cur.splice(Number(last), 1);
  } else {
    delete cur[last];
  }
  return root;
}

// biome-ignore lint/suspicious/noExplicitAny: see above
function includeInArray(root: any, segments: string[], value: unknown, position: "start" | "end"): any {
  const existing = resolve(root, segments);
  if (existing === undefined) {
    // Create the array with the single value.
    return setAt(root, segments, [value]);
  }
  if (!Array.isArray(existing)) {
    throw new Error(`include: expected an array at "${segments.join("/")}", got ${typeof existing}.`);
  }
  if (existing.some((item) => deepEqual(item, value))) return root;
  if (position === "start") existing.unshift(value);
  else existing.push(value);
  return root;
}

// biome-ignore lint/suspicious/noExplicitAny: see above
function excludeFromArray(root: any, segments: string[], value: unknown): any {
  const existing = resolve(root, segments);
  if (!Array.isArray(existing)) return root;
  const idx = existing.findIndex((item) => deepEqual(item, value));
  if (idx >= 0) existing.splice(idx, 1);
  return root;
}

// biome-ignore lint/suspicious/noExplicitAny: see above
function arrayIndexIfNumeric(target: any, seg: string): string | number {
  return Array.isArray(target) && isNumericIndex(seg) ? Number(seg) : seg;
}

function isNumericIndex(seg: string): boolean {
  return seg !== "" && /^\d+$/.test(seg);
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== "object" || typeof b !== "object" || a == null || b == null) return false;
  return JSON.stringify(a) === JSON.stringify(b);
}
