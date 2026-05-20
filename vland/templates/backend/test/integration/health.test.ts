import { describe, expect, it } from "vitest";
import { createApp } from "#src/server.ts";

describe("GET /health", () => {
  it("returns ok", async () => {
    const app = createApp();
    const res = await app.handle(new Request("http://localhost/health"));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
  });
});
