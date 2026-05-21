import { describe, expect, it, vi } from "vitest";
import type { Doctor, DoctorResult, Formatter, Linter } from "#src/plugin/types.ts";
import { composedJscProvider } from "#src/program/composed-jsc.ts";

function makeLinter(overrides: Partial<Linter & Doctor> = {}): Linter & Doctor {
  return {
    bin: "fake-lint",
    ui: "FakeLint",
    lint: vi.fn(async () => {}),
    doctor: vi.fn(async (): Promise<DoctorResult> => ({ ok: true, output: { stdout: "lint-ok", stderr: "", exitCode: 0 } })),
    ...overrides,
  };
}

function makeFormatter(overrides: Partial<Formatter & Doctor> = {}): Formatter & Doctor {
  return {
    bin: "fake-fmt",
    ui: "FakeFmt",
    format: vi.fn(async () => {}),
    doctor: vi.fn(async (): Promise<DoctorResult> => ({ ok: true, output: { stdout: "fmt-ok", stderr: "", exitCode: 0 } })),
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
      });
      vi.mocked(formatter.format).mockImplementation(async ({ fix }) => {
        order.push(`format:${fix ?? false}`);
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

    it("propagates a lint failure (format must not run)", async () => {
      const linter = makeLinter({
        lint: vi.fn(async () => {
          throw new Error("lint exploded");
        }),
      });
      const formatter = makeFormatter();
      const provider = composedJscProvider(linter, formatter);

      await expect(provider.check({})).rejects.toThrow(/lint exploded/);
      expect(formatter.format).not.toHaveBeenCalled();
    });
  });

  describe("doctor()", () => {
    it("returns ok when both providers' doctors pass", async () => {
      const provider = composedJscProvider(makeLinter(), makeFormatter());
      const res = await provider.doctor();
      expect(res.ok).toBe(true);
      expect(res.output.stdout).toContain("lint-ok");
      expect(res.output.stdout).toContain("fmt-ok");
      expect(res.output.exitCode).toBe(0);
    });

    it("returns ok=false and surfaces the first failing exit code when the linter doctor fails", async () => {
      const linter = makeLinter({
        doctor: vi.fn(async () => ({ ok: false, output: { stdout: "lint-bad", stderr: "boom", exitCode: 2 } })),
      });
      const formatter = makeFormatter();
      const res = await composedJscProvider(linter, formatter).doctor();
      expect(res.ok).toBe(false);
      expect(res.output.exitCode).toBe(2);
      expect(res.output.stderr).toContain("boom");
    });

    it("returns ok=false when only the formatter doctor fails", async () => {
      const linter = makeLinter();
      const formatter = makeFormatter({
        doctor: vi.fn(async () => ({ ok: false, output: { stdout: "fmt-bad", stderr: "kaput", exitCode: 7 } })),
      });
      const res = await composedJscProvider(linter, formatter).doctor();
      expect(res.ok).toBe(false);
      expect(res.output.exitCode).toBe(7);
      expect(res.output.stderr).toContain("kaput");
    });
  });
});
