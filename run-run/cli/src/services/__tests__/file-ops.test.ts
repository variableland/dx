import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { FileOp } from "#src/lib/plugin/types.ts";
import { applyFileOp, describeFileOp } from "#src/services/file-ops.ts";

let dir: string;

beforeEach(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), "rr-file-ops-"));
});

afterEach(async () => {
  await fs.rm(dir, { recursive: true, force: true });
});

const read = (rel: string) => fs.readFile(path.join(dir, rel), "utf8");
const write = (rel: string, content: string) => fs.writeFile(path.join(dir, rel), content, "utf8");

describe("applyFileOp — create", () => {
  it("creates a new file", async () => {
    const outcome = await applyFileOp(dir, { kind: "create", path: "a.json", content: "{}\n" }, false);
    expect(outcome).toEqual({ op: "create", path: "a.json", status: "created" });
    expect(await read("a.json")).toBe("{}\n");
  });

  it("skips an existing file without overwrite/force", async () => {
    await write("a.json", "original");
    const outcome = await applyFileOp(dir, { kind: "create", path: "a.json", content: "new" }, false);
    expect(outcome.status).toBe("skipped-exists");
    expect(await read("a.json")).toBe("original");
  });

  it("overwrites when force is set", async () => {
    await write("a.json", "original");
    const outcome = await applyFileOp(dir, { kind: "create", path: "a.json", content: "new" }, true);
    expect(outcome.status).toBe("overwritten");
    expect(await read("a.json")).toBe("new");
  });

  it("creates nested directories on demand", async () => {
    const outcome = await applyFileOp(dir, { kind: "create", path: "nested/deep/a.txt", content: "x" }, false);
    expect(outcome.status).toBe("created");
    expect(await read("nested/deep/a.txt")).toBe("x");
  });
});

describe("applyFileOp — edit-json", () => {
  it("edits an existing JSON file", async () => {
    await write("b.json", `{ "extends": "old" }`);
    const outcome = await applyFileOp(
      dir,
      { kind: "edit-json", path: "b.json", edits: [{ op: "set", path: "/extends", value: "new" }] },
      false,
    );
    expect(outcome.status).toBe("edited");
    expect(JSON.parse(await read("b.json"))).toEqual({ extends: "new" });
  });

  it("reports unchanged when re-applying the same edit (already canonical)", async () => {
    await write("b.json", `{ "extends": "old" }`);
    const edit = { kind: "edit-json", path: "b.json", edits: [{ op: "set", path: "/extends", value: "new" }] } satisfies FileOp;
    // First application normalises the file to the engine's canonical output;
    // the second is a genuine no-op (same value, already-canonical text).
    expect((await applyFileOp(dir, edit, false)).status).toBe("edited");
    expect((await applyFileOp(dir, edit, false)).status).toBe("unchanged");
  });

  it("reports missing when the target file is absent", async () => {
    const outcome = await applyFileOp(
      dir,
      { kind: "edit-json", path: "nope.json", edits: [{ op: "set", path: "/x", value: 1 }] },
      false,
    );
    expect(outcome.status).toBe("missing");
  });
});

describe("applyFileOp — edit-text", () => {
  it("applies the text transform", async () => {
    await write("c.ts", "export const x = 1;");
    const outcome = await applyFileOp(dir, { kind: "edit-text", path: "c.ts", edit: (src) => src.replace("1", "2") }, false);
    expect(outcome.status).toBe("edited");
    expect(await read("c.ts")).toBe("export const x = 2;");
  });
});

describe("applyFileOp — delete", () => {
  it("deletes an existing file", async () => {
    await write("d.txt", "bye");
    const outcome = await applyFileOp(dir, { kind: "delete", path: "d.txt" }, false);
    expect(outcome.status).toBe("deleted");
    await expect(read("d.txt")).rejects.toThrow();
  });

  it("is a no-op (absent) when the file does not exist", async () => {
    const outcome = await applyFileOp(dir, { kind: "delete", path: "ghost.txt" }, false);
    expect(outcome.status).toBe("absent");
  });
});

describe("describeFileOp", () => {
  it("describes each op kind", () => {
    expect(describeFileOp({ kind: "create", path: "a", content: "" })).toBe("Create a");
    expect(describeFileOp({ kind: "create", path: "a", content: "", overwrite: true })).toBe("Overwrite a");
    expect(describeFileOp({ kind: "edit-json", path: "b", edits: [{ op: "unset", path: "/x" }] })).toBe("Edit b (1 change)");
    expect(
      describeFileOp({
        kind: "edit-json",
        path: "b",
        edits: [
          { op: "unset", path: "/x" },
          { op: "unset", path: "/y" },
        ],
      }),
    ).toBe("Edit b (2 changes)");
    expect(describeFileOp({ kind: "edit-text", path: "c", edit: (s) => s })).toBe("Edit c");
    expect(describeFileOp({ kind: "delete", path: "d" })).toBe("Delete d");
  });
});
