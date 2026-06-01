import type { ShellService } from "@vlandoss/clibuddy";
import { describe, expect, it } from "vitest";
import { probeBins } from "#src/lib/plugin/bin-probe.ts";
import { ToolService } from "#src/lib/plugin/tool-service.ts";

const FROM = import.meta.url;

class ResolvableService extends ToolService {
  constructor() {
    super({ pkg: "typescript", bin: "tsc", color: (s) => s, shellService: {} as ShellService, from: FROM });
  }
}

class MissingService extends ToolService {
  constructor() {
    super({
      bin: "ghostly-bin-that-does-not-exist",
      color: (s) => s,
      shellService: {} as ShellService,
      from: FROM,
    });
  }
}

class AlsoMissing extends ToolService {
  constructor() {
    super({
      bin: "another-ghost-bin",
      color: (s) => s,
      shellService: {} as ShellService,
      from: FROM,
    });
  }
}

describe("probeBins", () => {
  it("is a no-op when given an empty list", async () => {
    await expect(probeBins([], "noop")).resolves.toBeUndefined();
  });

  it("ignores non-ToolService values silently", async () => {
    await expect(probeBins([{ random: "object" }, 42, null], "noop")).resolves.toBeUndefined();
  });

  it("succeeds when every distinct pkg resolves", async () => {
    await expect(probeBins([new ResolvableService(), new ResolvableService()], "ts")).resolves.toBeUndefined();
  });

  it("throws with the canonical message listing the missing pkg", async () => {
    await expect(probeBins([new MissingService()], "ghostly")).rejects.toThrow(
      /@rrlab\/ghostly-plugin requires ghostly-bin-that-does-not-exist to be installed in the host project\. Run: rr plugins add ghostly {2}\(or: pnpm add -D ghostly-bin-that-does-not-exist\)/,
    );
  });

  it("lists multiple distinct missing pkgs in the same error", async () => {
    await expect(probeBins([new MissingService(), new AlsoMissing()], "ghostly")).rejects.toThrow(
      /requires .*(ghostly-bin-that-does-not-exist|another-ghost-bin).*(another-ghost-bin|ghostly-bin-that-does-not-exist)/,
    );
  });

  it("deduplicates services sharing a pkg into a single probe", async () => {
    // Two MissingService instances → one error message mention of the pkg.
    const err = await probeBins([new MissingService(), new MissingService()], "ghostly").catch((e) => e);
    expect(err).toBeInstanceOf(Error);
    const message = (err as Error).message;
    const matches = message.match(/ghostly-bin-that-does-not-exist/g);
    expect(matches?.length).toBe(2); // once in the "requires X" clause and once in the "pnpm add -D X" hint
  });
});
