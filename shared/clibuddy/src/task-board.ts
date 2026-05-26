import { gray, green, magenta, red } from "ansis";
import { palette } from "./colors.ts";
import { hasTTY, isCI } from "./env.ts";

export type TaskOutcome = {
  ok: boolean;
  /** Output flushed (grouped under the label) once the board settles. */
  detail?: string;
};

export type BoardTask = {
  label: string;
  /** Resolve to a `TaskOutcome`; a rejection renders as a failed row. */
  run: () => Promise<TaskOutcome>;
};

export type BoardOptions = {
  /** Section header above the rows, e.g. `tsc · 16 packages` (multi-row only). */
  title?: string;
  /**
   * Force the `┌ │ └` frame even for one task. `rr check` sets it to divide its
   * sections; otherwise a board is unframed (compact for one task, plain for many).
   */
  frame?: boolean;
};

export type BoardResult = {
  ok: boolean;
  outcomes: TaskOutcome[];
};

// Glyphs mirror @clack/prompts (used by `rr plugins`) so the two flows read as
// one family: the ◒◐◓◑ spinner and a gray `│ ┌ └` gutter, settling to ✔/✖. The
// gray is 16-color (not a fixed hex) so it adapts to the terminal theme.
const FRAMES = ["◒", "◐", "◓", "◑"];
const TICK_MS = 80;
const PASS = green("✔");
const FAIL = red("✖");
const SEP = palette.dim(" · ");
const BAR = gray("│");
const BAR_START = gray("┌");
const BAR_END = gray("└");
/** Failing output past this many lines is truncated with a "+N more" note. */
const MAX_DETAIL_LINES = 60;

type RowState = {
  label: string;
  startedAt: number;
  finishedAt?: number;
  outcome?: TaskOutcome;
};

/**
 * Runs `tasks` in parallel, rendering one row each that collapses to ✔/✖, then
 * flushes their captured detail and a one-line summary. On a TTY the rows update
 * in place; otherwise each prints once on settle, keeping logs deterministic.
 */
export async function runTaskBoard(tasks: BoardTask[], options: BoardOptions = {}): Promise<BoardResult> {
  const live = hasTTY && !isCI;
  const framed = options.frame ?? false;
  return live ? runLive(tasks, options, framed) : runStatic(tasks, options, framed);
}

/** A multi-row board gets a header line — `┌ title` when framed, a plain bold title otherwise. */
function writeTitle(out: NodeJS.WriteStream, options: BoardOptions, framed: boolean, multi: boolean): void {
  if (!multi || !options.title) return;
  out.write(framed ? `${BAR_START}  ${palette.bold(options.title)}\n` : `${palette.bold(options.title)}\n`);
}

async function runLive(tasks: BoardTask[], options: BoardOptions, framed: boolean): Promise<BoardResult> {
  const out = process.stderr;
  const multi = tasks.length > 1;
  writeTitle(out, options, framed, multi);

  const rows: RowState[] = tasks.map((t) => ({ label: t.label, startedAt: Date.now() }));
  const width = labelWidth(tasks);
  const prefix = rowPrefix(framed, multi);
  let frame = 0;

  out.write("\x1b[?25l"); // hide cursor
  for (const _ of rows) out.write("\n"); // reserve one line per row

  const render = () => {
    out.write(`\x1b[${rows.length}A`); // jump to the first row
    for (const row of rows) out.write(`\x1b[2K${renderRow(row, width, frame, prefix)}\n`);
  };

  const settled = Promise.allSettled(
    tasks.map(async (task, i) => {
      const outcome = await runTask(task);
      // biome-ignore lint/style/noNonNullAssertion: rows mirror tasks 1:1
      const row = rows[i]!;
      row.finishedAt = Date.now();
      row.outcome = outcome;
      return outcome;
    }),
  );

  try {
    render();
    while (rows.some((r) => !r.outcome)) {
      await delay(TICK_MS);
      frame = (frame + 1) % FRAMES.length;
      render();
    }
    render(); // collapse every row to its final glyph
  } finally {
    out.write("\x1b[?25h"); // restore cursor
  }

  await settled;
  return finish(rows, out, framed, multi);
}

async function runStatic(tasks: BoardTask[], options: BoardOptions, framed: boolean): Promise<BoardResult> {
  const out = process.stderr;
  const multi = tasks.length > 1;
  writeTitle(out, options, framed, multi);

  const width = labelWidth(tasks);
  const prefix = rowPrefix(framed, multi);
  const rows: RowState[] = await Promise.all(
    tasks.map(async (task) => {
      const startedAt = Date.now();
      const outcome = await runTask(task);
      return { label: task.label, startedAt, finishedAt: Date.now(), outcome };
    }),
  );

  // Print in input order so non-TTY logs are deterministic.
  for (const row of rows) out.write(`${renderRow(row, width, 0, prefix)}\n`);
  return finish(rows, out, framed, multi);
}

async function runTask(task: BoardTask): Promise<TaskOutcome> {
  try {
    return await task.run();
  } catch (error) {
    return { ok: false, detail: error instanceof Error ? error.message : String(error) };
  }
}

/** Flushes each task's detail, prints the summary (framed only), returns the result. */
function finish(rows: RowState[], out: NodeJS.WriteStream, framed: boolean, multi: boolean): BoardResult {
  const outcomes = rows.map((r) => r.outcome ?? { ok: false });

  const blocks = rows
    .map((row) => ({ ok: row.outcome?.ok ?? false, label: row.label, detail: clampDetail(row.outcome?.detail?.trim()) }))
    .filter((b): b is { ok: boolean; label: string; detail: string } => Boolean(b.detail));

  // Hoist a line shared by every block — typically the identical `$ <cmd>` each
  // package ran — so a monorepo shows the command once instead of per package.
  const shared = blocks.length > 1 ? sharedLeadingLine(blocks.map((b) => b.detail)) : undefined;

  // Framed bodies sit inside the `│` gutter; a plain board indents instead.
  const block = (text: string) => (framed ? gutter(text) : indent(text));
  const spacer = () => out.write(framed ? `${BAR}\n` : "\n");

  let flushed = false;
  if (shared) {
    spacer();
    out.write(`${block(shared)}\n`);
    flushed = true;
  }

  // Passing output is dimmed (proof-of-work that recedes); a failure stays bright
  // so the diagnostic reads. Multi-row blocks get a per-task header to attribute them.
  for (const b of blocks) {
    const rest = shared ? stripLeadingLine(b.detail, shared) : b.detail;
    if (!rest.trim()) continue; // only the shared command → nothing package-specific
    const body = b.ok ? palette.dim : undefined;
    if (multi) {
      spacer();
      const header = b.ok ? palette.bold(b.label) : red(palette.bold(b.label));
      out.write(`${block(header)}\n${framed ? gutter(rest, body) : indent(rest, body)}\n`);
    } else {
      out.write(`${framed ? gutter(rest, body) : indent(rest, body)}\n`);
    }
    flushed = true;
  }

  // A framed section closes with `└ summary`; a plain multi-row board with a bare
  // summary line. One compact task needs neither — its row already showed the verdict.
  if (framed) {
    if (flushed || multi) spacer();
    out.write(`${BAR_END}  ${summary(rows)}\n`);
  } else if (multi) {
    out.write(`\n${summary(rows)}\n`);
  }
  return { ok: outcomes.every((o) => o.ok), outcomes };
}

/** The first line, if every block starts with the same one (e.g. an identical `$ <cmd>`). */
function sharedLeadingLine(details: string[]): string | undefined {
  const first = details[0]?.split("\n", 1)[0];
  if (!first) return undefined;
  return details.every((d) => d.split("\n", 1)[0] === first) ? first : undefined;
}

/** Drops `line` from the front of `detail` (with its trailing newline) if present. */
function stripLeadingLine(detail: string, line: string): string {
  return detail.startsWith(line) ? detail.slice(line.length).replace(/^\n/, "") : detail;
}

/** A row's leading decoration: `│` (framed multi), `┌` (framed single, status rides the corner), or a plain indent. */
function rowPrefix(framed: boolean, multi: boolean): string {
  if (framed) return multi ? `${BAR}  ` : `${BAR_START}  `;
  return multi ? "  " : "";
}

function renderRow(row: RowState, width: number, frame: number, prefix: string): string {
  // Pad by visible width so colored labels (e.g. a tool's branded ui) still
  // align — `padEnd` would count the invisible ANSI bytes.
  const label = padLabel(row.label, width);
  if (!row.outcome) return `${prefix}${magenta(FRAMES[frame])} ${label}`;
  const duration = row.finishedAt ? palette.dim(fmtDuration(row.finishedAt - row.startedAt)) : "";
  return `${prefix}${row.outcome.ok ? PASS : FAIL} ${label}${duration ? `  ${duration}` : ""}`;
}

function summary(rows: RowState[]): string {
  const outcomes = rows.map((r) => r.outcome).filter((o): o is TaskOutcome => Boolean(o));
  const failed = outcomes.filter((o) => !o.ok).length;
  const ok = outcomes.length - failed;
  // Wall-clock span (first task started → last settled), not a single task's
  // time. Guard the empty board so Math.min/max don't yield ±Infinity.
  const elapsed = rows.length
    ? Math.max(...rows.map((r) => r.finishedAt ?? r.startedAt)) - Math.min(...rows.map((r) => r.startedAt))
    : 0;

  const parts = failed > 0 ? [`${failed} failed`, `${ok} ok`] : [`${ok} ok`];
  parts.push(fmtDuration(elapsed));
  return `${failed > 0 ? FAIL : PASS} ${parts.join(SEP)}`;
}

/** Caps long output so one broken package can't bury the board; the rest is one-lined. */
function clampDetail(text: string | undefined): string | undefined {
  if (!text) return text;
  const lines = text.split("\n");
  if (lines.length <= MAX_DETAIL_LINES) return text;
  const hidden = lines.length - MAX_DETAIL_LINES;
  return `${lines.slice(0, MAX_DETAIL_LINES).join("\n")}\n${palette.dim(`… +${hidden} more lines`)}`;
}

/** Prefixes every line of `text` with the gutter (keeping the side frame intact), optionally styling each line. */
function gutter(text: string, style?: (line: string) => string): string {
  return text
    .split("\n")
    .map((line) => `${BAR}  ${style ? style(line) : line}`)
    .join("\n");
}

/** Indents every line of `text` by two spaces (compact mode, no gutter), optionally styling each line. */
function indent(text: string, style?: (line: string) => string): string {
  return text
    .split("\n")
    .map((line) => `  ${style ? style(line) : line}`)
    .join("\n");
}

function fmtDuration(ms: number): string {
  return ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(1)}s`;
}

function labelWidth(tasks: BoardTask[]): number {
  return tasks.reduce((max, t) => Math.max(max, visibleWidth(t.label)), 0);
}

/** Right-pads `label` to `width` printable columns, ignoring its ANSI escapes. */
function padLabel(label: string, width: number): string {
  return label + " ".repeat(Math.max(0, width - visibleWidth(label)));
}

// SGR color escapes (`ESC [ … m`); built via fromCharCode so no literal control char in source.
const ANSI = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, "g");

/** A string's printable column count — its length with SGR color escapes removed. */
function visibleWidth(text: string): number {
  return text.replace(ANSI, "").length;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
