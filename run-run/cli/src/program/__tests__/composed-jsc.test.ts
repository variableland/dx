import { describe, expect, it, vi } from "vitest";
import type { Doctor, Formatter, Linter } from "#src/plugin/types.ts";
import { composedJscProvider } from "#src/program/composed-jsc.ts";

function makeLinter(overrides: Partial<Linter & Doctor> = {}): Linter & Doctor {
  return {
    bin: "fake-lint",
    ui: "FakeLint",
    lint: vi.fn(async () => ({ ok: true, output: "" })),
    doctor: vi.fn(async () => ({ ok: true, output: "lint-ok" })),
    ...overrides,
  };
}

function makeFormatter(overrides: Partial<Formatter & Doctor> = {}): Formatter & Doctor {
  return {
    bin: "fake-fmt",
    ui: "FakeFmt",
    format: vi.fn(async () => ({ ok: true, output: "" })),
    doctor: vi.fn(async () => ({ ok: true, output: "fmt-ok" })),
    ...overrides,
  };
}

describe("composedJscProvider", () => {
  it("exposes a bin and ui derived from both providers", () => {
    const provider = composedJscProvider(makeLinter(), makeFormatter());
    expect(provider.bin).toBe("fake-lint+fake-fmt");
    expect(provider.ui).toBe("FakeLint + FakeFmt");
  });

  describe("check()", () => {
    it("runs lint then format with the same `fix` flag", async () => {
      const linter = makeLinter();
      const formatter = makeFormatter();
      const order: string[] = [];
      vi.mocked(linter.lint).mockImplementation(async ({ fix }) => {
        order.push(`lint:${fix ?? false}`);
        return { ok: true, output: "" };
      });
      vi.mocked(formatter.format).mockImplementation(async ({ fix }) => {
        order.push(`format:${fix ?? false}`);
        return { ok: true, output: "" };
      });
      const provider = composedJscProvider(linter, formatter);

      await provider.check({ fix: true });

      expect(order).toEqual(["lint:true", "format:true"]);
      expect(linter.lint).toHaveBeenCalledWith({ fix: true });
      expect(formatter.format).toHaveBeenCalledWith({ fix: true });
    });

    it("drops the biome-specific `fixStaged` option (composed mode can't honour it)", async () => {
      const linter = makeLinter();
      const formatter = makeFormatter();
      const provider = composedJscProvider(linter, formatter);

      await provider.check({ fixStaged: true });

      expect(linter.lint).toHaveBeenCalledWith({ fix: undefined });
      expect(formatter.format).toHaveBeenCalledWith({ fix: undefined });
    });

    it("merges both reports — ok=false if either failed, keeping each tool's output under its header", async () => {
      const linter = makeLinter({ lint: vi.fn(async () => ({ ok: false, output: "lint problems" })) });
      const formatter = makeFormatter({ format: vi.fn(async () => ({ ok: true, output: "fmt clean" })) });
      const provider = composedJscProvider(linter, formatter);

      const report = await provider.check({});

      // Both run (no short-circuit) so the user sees a complete picture.
      expect(formatter.format).toHaveBeenCalled();
      expect(report.ok).toBe(false);
      expect(report.output).toContain("FakeLint:");
      expect(report.output).toContain("lint problems");
      expect(report.output).toContain("FakeFmt:");
      expect(report.output).toContain("fmt clean");
    });
  });

  describe("doctor()", () => {
    it("returns ok when both providers' doctors pass, merging their output", async () => {
      const provider = composedJscProvider(makeLinter(), makeFormatter());
      const res = await provider.doctor();
      expect(res.ok).toBe(true);
      expect(res.output).toContain("lint-ok");
      expect(res.output).toContain("fmt-ok");
    });

    it("returns ok=false when the linter doctor fails, surfacing its output", async () => {
      const linter = makeLinter({ doctor: vi.fn(async () => ({ ok: false, output: "boom" })) });
      const res = await composedJscProvider(linter, makeFormatter()).doctor();
      expect(res.ok).toBe(false);
      expect(res.output).toContain("boom");
    });

    it("returns ok=false when only the formatter doctor fails", async () => {
      const formatter = makeFormatter({ doctor: vi.fn(async () => ({ ok: false, output: "kaput" })) });
      const res = await composedJscProvider(makeLinter(), formatter).doctor();
      expect(res.ok).toBe(false);
      expect(res.output).toContain("kaput");
    });
  });
});
