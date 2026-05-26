import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// Force the non-TTY (static) renderer so output is deterministic and we never
// emit cursor-control escapes during tests. The live path is the same code
// modulo in-place redraws, which a unit test can't meaningfully assert.
vi.mock("../env.ts", () => ({ hasTTY: false, isCI: true }));

import { type BoardTask, runTaskBoard } from "../task-board.ts";

let written = "";

beforeEach(() => {
  written = "";
  vi.spyOn(process.stderr, "write").mockImplementation((chunk: string | Uint8Array) => {
    written += chunk.toString();
    return true;
  });
});

afterEach(() => vi.restoreAllMocks());

const ok = (label: string, detail?: string): BoardTask => ({ label, run: async () => ({ ok: true, detail }) });

describe("runTaskBoard", () => {
  test("runs every task and reports ok when none fail", async () => {
    const result = await runTaskBoard([ok("a"), ok("b"), ok("c")], { title: "tsc · 3 packages" });

    expect(result.ok).toBe(true);
    expect(result.outcomes).toHaveLength(3);
    expect(written).toContain("tsc · 3 packages"); // title + summary even when unframed
    expect(written).toContain("3 ok");
    // A standalone multi-row board is not framed — the ┌ │ └ are for `rr check`'s composition only.
    expect(written).not.toContain("┌");
    expect(written).not.toContain("└");
  });

  test("preserves input order of outcomes even when tasks settle out of order", async () => {
    const slow: BoardTask = { label: "slow", run: () => delay(20).then(() => ({ ok: true })) };
    const fast: BoardTask = { label: "fast", run: async () => ({ ok: false }) };

    const result = await runTaskBoard([slow, fast]);

    expect(result.outcomes.map((o) => o.ok)).toEqual([true, false]);
  });

  test("marks a failing task and flushes its captured detail grouped under the label", async () => {
    const fail: BoardTask = {
      label: "@scope/api",
      run: async () => ({ ok: false, detail: "src/x.ts: Type error" }),
    };

    const result = await runTaskBoard([ok("@scope/ui"), fail]);

    expect(result.ok).toBe(false);
    expect(written).toContain("@scope/api");
    expect(written).toContain("src/x.ts: Type error");
    expect(written).toContain("1 failed");
  });

  test("flushes a passing task's output (proof of work) and still counts it ok", async () => {
    const result = await runTaskBoard([ok("clean"), ok("noisy", "Checked 3 files. No fixes applied.")]);

    expect(result.ok).toBe(true);
    expect(written).toContain("Checked 3 files"); // passing output is shown (dimmed), not hidden
    expect(written).toContain("2 ok"); // both pass — the verdict is the exit code, not the output
  });

  test("a single task renders compactly (no frame, no summary)", async () => {
    await runTaskBoard([ok("solo")]);
    expect(written).not.toContain("┌");
    expect(written).not.toContain("└");
    expect(written).not.toMatch(/\d+ ok/);
  });

  test("frame:true keeps a single task framed with a closing summary (no bare └)", async () => {
    await runTaskBoard([ok("solo")], { frame: true });
    expect(written).toContain("┌");
    expect(written).toContain("└");
    expect(written).toContain("1 ok"); // the └ carries a summary, it's not a bare closer
  });

  test("truncates very long detail with a +N more note", async () => {
    const lines = Array.from({ length: 120 }, (_, i) => `line ${i}`).join("\n");
    await runTaskBoard([{ label: "x", run: async () => ({ ok: false, detail: lines }) }]);

    expect(written).toContain("line 0");
    expect(written).not.toContain("line 119");
    expect(written).toMatch(/\+\d+ more lines/);
  });

  test("an empty board summarizes as 0 ok without an Infinity duration", async () => {
    const result = await runTaskBoard([], { frame: true });
    expect(result.ok).toBe(true);
    expect(written).toContain("0 ok");
    expect(written).not.toMatch(/Infinity/);
  });

  test("aligns rows by visible width, ignoring ANSI in the label", async () => {
    const c = String.fromCharCode(27); // ESC, built here so no control char sits in source
    const blue = `${c}[34mblue${c}[39m`; // 4 visible columns, ~13 raw chars
    await runTaskBoard([
      { label: blue, run: async () => ({ ok: true }) },
      { label: "plain", run: async () => ({ ok: true }) },
    ]);
    // Padded to the visible width of "plain" (5) → "blue" + exactly one space,
    // not over-padded by counting the invisible ANSI bytes.
    expect(written).toContain(`${blue} `);
    expect(written).not.toContain(`${blue}      `);
  });

  test("a rejecting task renders as failed rather than throwing", async () => {
    const throws: BoardTask = {
      label: "boom",
      run: async () => {
        throw new Error("spawn failed");
      },
    };

    const result = await runTaskBoard([throws]);

    expect(result.ok).toBe(false);
    expect(result.outcomes[0]?.ok).toBe(false);
    expect(written).toContain("spawn failed");
  });
});

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
