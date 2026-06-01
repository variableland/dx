import fs from "node:fs/promises";
import path from "node:path";
import type { FileOp } from "#src/lib/plugin/types.ts";
import { applyJsonEdits } from "./json-edit.ts";

/**
 * The semantic outcome of applying one `FileOp`. The engine performs the
 * filesystem work and reports what happened — it never writes to the terminal.
 * Callers (the `plugins add/remove` flows) map the outcome to their own
 * progress UI, which keeps this engine pure and unit-testable without spawning.
 */
export type FileOpOutcome =
  | { op: "create"; path: string; status: "created" | "overwritten" | "skipped-exists" }
  | { op: "edit"; path: string; status: "edited" | "unchanged" | "missing" }
  | { op: "delete"; path: string; status: "deleted" | "absent" };

/**
 * Applies a single declarative `FileOp` under `cwd`. `force` overrides the
 * `create` overwrite guard. Idempotent for `delete` (absent file is a no-op)
 * and skips edits when the target file is missing.
 */
export async function applyFileOp(cwd: string, op: FileOp, force: boolean): Promise<FileOpOutcome> {
  const abs = path.join(cwd, op.path);

  if (op.kind === "create") {
    const exists = await pathExists(abs);
    if (exists && !op.overwrite && !force) {
      return { op: "create", path: op.path, status: "skipped-exists" };
    }
    await fs.mkdir(path.dirname(abs), { recursive: true });
    await fs.writeFile(abs, op.content, "utf8");
    return { op: "create", path: op.path, status: exists ? "overwritten" : "created" };
  }

  if (op.kind === "edit-json") {
    if (!(await pathExists(abs))) return { op: "edit", path: op.path, status: "missing" };
    const source = await fs.readFile(abs, "utf8");
    const next = applyJsonEdits(source, op.edits);
    if (next === source) return { op: "edit", path: op.path, status: "unchanged" };
    await fs.writeFile(abs, next, "utf8");
    return { op: "edit", path: op.path, status: "edited" };
  }

  if (op.kind === "edit-text") {
    if (!(await pathExists(abs))) return { op: "edit", path: op.path, status: "missing" };
    const source = await fs.readFile(abs, "utf8");
    const next = op.edit(source);
    if (next === source) return { op: "edit", path: op.path, status: "unchanged" };
    await fs.writeFile(abs, next, "utf8");
    return { op: "edit", path: op.path, status: "edited" };
  }

  if (!(await pathExists(abs))) return { op: "delete", path: op.path, status: "absent" };
  await fs.unlink(abs);
  return { op: "delete", path: op.path, status: "deleted" };
}

/** A one-line, side-effect-free description of a `FileOp` for the remove plan. */
export function describeFileOp(op: FileOp): string {
  switch (op.kind) {
    case "create":
      return `${op.overwrite ? "Overwrite" : "Create"} ${op.path}`;
    case "edit-json":
      return `Edit ${op.path} (${op.edits.length} change${op.edits.length === 1 ? "" : "s"})`;
    case "edit-text":
      return `Edit ${op.path}`;
    case "delete":
      return `Delete ${op.path}`;
  }
}

async function pathExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}
