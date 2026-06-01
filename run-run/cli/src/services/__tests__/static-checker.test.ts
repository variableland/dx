import { describe, expect, it, vi } from "vitest";
import type { Doctor, Formatter, Linter } from "#src/types/tool.ts";
import { StaticCheckService } from "../static-checker.ts";

// StaticCheckService composes a separately-registered linter + formatter into
// the `jsc` capability (used when a plugin provides lint + format but no direct
// jscheck, e.g. oxc). Each input carries its own `ui`.
function makeLinter(overrides: Partial<Linter & Doctor> = {}): Linter & Doctor {
  return {
    ui: "FakeLint",
    lint: vi.fn(async () => ({ ok: true, output: "" })),
    doctor: vi.fn(async () => ({ ok: true, output: "lint-ok" })),
    ...overrides,
  };
}

function makeFormatter(overrides: Partial<Formatter & Doctor> = {}): Formatter & Doctor {
  return {
    ui: "FakeFmt",
    format: vi.fn(async () => ({ ok: true, output: "" })),
    doctor: vi.fn(async () => ({ ok: true, output: "fmt-ok" })),
    ...overrides,
  };
}

describe("StaticCheckService", () => {
  it("exposes a ui derived from both providers", () => {
    const svc = new StaticCheckService(makeLinter(), makeFormatter());
    expect(svc.ui).toBe("FakeLint + FakeFmt");
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
      const svc = new StaticCheckService(linter, formatter);

      await svc.check({ fix: true });

      expect(order).toEqual(["lint:true", "format:true"]);
    });

    it("merges both reports — ok=false if either failed, keeping each tool's output under its header", async () => {
      const linter = makeLinter({ lint: vi.fn(async () => ({ ok: false, output: "lint problems" })) });
      const formatter = makeFormatter({ format: vi.fn(async () => ({ ok: true, output: "fmt clean" })) });
      const svc = new StaticCheckService(linter, formatter);

      const report = await svc.check({});

      // Both run (no short-circuit) so the user sees a complete picture.
      expect(formatter.format).toHaveBeenCalled();
      expect(report.ok).toBe(false);
      expect(report.output).toContain("FakeLint:");
      expect(report.output).toContain("lint problems");
      expect(report.output).toContain("FakeFmt:");
      expect(report.output).toContain("fmt clean");
    });

    it("drops a section with empty output from the merged report", async () => {
      const linter = makeLinter({ lint: vi.fn(async () => ({ ok: true, output: "" })) });
      const formatter = makeFormatter({ format: vi.fn(async () => ({ ok: true, output: "fmt detail" })) });
      const svc = new StaticCheckService(linter, formatter);

      const report = await svc.check({});

      expect(report.output).not.toContain("FakeLint:");
      expect(report.output).toContain("FakeFmt:");
    });
  });

  describe("doctor()", () => {
    it("returns ok when both providers' doctors pass, merging their output", async () => {
      const svc = new StaticCheckService(makeLinter(), makeFormatter());
      const res = await svc.doctor();
      expect(res.ok).toBe(true);
      expect(res.output).toContain("lint-ok");
      expect(res.output).toContain("fmt-ok");
    });

    it("returns ok=false when the linter doctor fails, surfacing its output", async () => {
      const linter = makeLinter({ doctor: vi.fn(async () => ({ ok: false, output: "boom" })) });
      const res = await new StaticCheckService(linter, makeFormatter()).doctor();
      expect(res.ok).toBe(false);
      expect(res.output).toContain("boom");
    });

    it("returns ok=false when only the formatter doctor fails", async () => {
      const formatter = makeFormatter({ doctor: vi.fn(async () => ({ ok: false, output: "kaput" })) });
      const res = await new StaticCheckService(makeLinter(), formatter).doctor();
      expect(res.ok).toBe(false);
      expect(res.output).toContain("kaput");
    });
  });
});
