import { describe, expect, it, vi } from "vitest";
import { ReleaseService } from "../release.ts";

function ok(): Response {
  return new Response("{}", { status: 200 });
}
function notFound(): Response {
  return new Response("", { status: 404 });
}

describe("ReleaseService", () => {
  it("returns 'latest' when no tag is supplied (no network probe)", async () => {
    const fetcher = vi.fn();
    const svc = new ReleaseService(undefined, { fetcher: fetcher as unknown as typeof fetch });
    expect(await svc.resolve("@rrlab/biome-config")).toBe("latest");
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("short-circuits 'latest' tag without probing", async () => {
    const fetcher = vi.fn();
    const svc = new ReleaseService("latest", { fetcher: fetcher as unknown as typeof fetch });
    expect(await svc.resolve("@rrlab/biome-config")).toBe("latest");
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("returns the tag when the registry has it", async () => {
    const fetcher = vi.fn(async () => ok());
    const svc = new ReleaseService("pr-226", { fetcher: fetcher as unknown as typeof fetch });
    expect(await svc.resolve("@rrlab/biome-config")).toBe("pr-226");
    expect(fetcher).toHaveBeenCalledWith(
      "https://registry.npmjs.org/@rrlab/biome-config/pr-226",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it("falls back to 'latest' when the registry returns 404", async () => {
    const fetcher = vi.fn(async () => notFound());
    const svc = new ReleaseService("pr-226", { fetcher: fetcher as unknown as typeof fetch });
    expect(await svc.resolve("@rrlab/ts-config")).toBe("latest");
  });

  it("falls back to 'latest' when the registry probe throws", async () => {
    const fetcher = vi.fn(async () => {
      throw new Error("network down");
    });
    const svc = new ReleaseService("pr-226", { fetcher: fetcher as unknown as typeof fetch });
    expect(await svc.resolve("@rrlab/biome-config")).toBe("latest");
  });

  it("caches per-package within one service instance", async () => {
    const fetcher = vi.fn(async () => ok());
    const svc = new ReleaseService("pr-226", { fetcher: fetcher as unknown as typeof fetch });
    await svc.resolve("@rrlab/biome-config");
    await svc.resolve("@rrlab/biome-config");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("exposes the tag for plugins that need to branch on it", () => {
    expect(new ReleaseService(undefined).tag).toBeUndefined();
    expect(new ReleaseService("pr-226").tag).toBe("pr-226");
  });
});
