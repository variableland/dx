import { mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { stripVTControlCharacters } from "node:util";
import { createShellService } from "@variablelab/clibuddy";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ToolService } from "#src/lib/plugin/tool-service.ts";

let dir: string;
let bin: string;

// A stand-in tool that prints the directory it was spawned in and fails, so
// even `doctor()`, which drops the output of a passing run, surfaces it.
beforeAll(() => {
  dir = realpathSync(mkdtempSync(path.join(tmpdir(), "rr-tool-service-")));
  bin = path.join(dir, "where");
  writeFileSync(bin, "#!/bin/sh\npwd -P\nexit 1\n", { mode: 0o755 });
});

afterAll(() => rmSync(dir, { recursive: true, force: true }));

const plain = (output: string) => stripVTControlCharacters(output);

class WhereService extends ToolService {
  constructor() {
    super({ bin: "where", color: (s) => s, shellService: createShellService(), from: import.meta.url });
  }

  override async getBinDir() {
    return bin;
  }
}

describe("ToolService", () => {
  it("runs doctor() in the given cwd", async () => {
    const report = await new WhereService().doctor({ cwd: dir });
    expect(report.ok).toBe(false);
    expect(plain(report.output)).toBe(`$ where --help\n${dir}`);
  });

  it("runs doctor() where rr runs without one", async () => {
    const report = await new WhereService().doctor();
    expect(plain(report.output)).toBe(`$ where --help\n${realpathSync(process.cwd())}`);
  });

  it("runs runReport() in the given cwd", async () => {
    const report = await new WhereService().runReport([], { cwd: dir });
    expect(plain(report.output)).toBe(`$ where\n${dir}`);
  });
});
