import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { resolveEnvFile } from "../index.ts";

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "rr-vitest-plugin-"));
});

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

const touch = (name: string) => fs.writeFile(path.join(tmpDir, name), "");

describe("resolveEnvFile — defaults (first existing wins)", () => {
  it("returns null when neither .env.test nor .env exists", async () => {
    expect(await resolveEnvFile(tmpDir)).toBeNull();
  });

  it("picks .env when only .env exists", async () => {
    await touch(".env");
    expect(await resolveEnvFile(tmpDir)).toBe(path.join(tmpDir, ".env"));
  });

  it("prefers .env.test over .env when both exist", async () => {
    await touch(".env");
    await touch(".env.test");
    expect(await resolveEnvFile(tmpDir)).toBe(path.join(tmpDir, ".env.test"));
  });
});

describe("resolveEnvFile — explicit --env-file override", () => {
  it("resolves an existing override against cwd", async () => {
    await touch("env.local");
    expect(await resolveEnvFile(tmpDir, "env.local")).toBe(path.join(tmpDir, "env.local"));
  });

  it("throws when the explicit override is missing (typo protection)", async () => {
    await expect(resolveEnvFile(tmpDir, ".env.nope")).rejects.toThrow(/env file not found: \.env\.nope/);
  });

  it("ignores the .env.test/.env defaults when an override is given", async () => {
    await touch(".env.test");
    await expect(resolveEnvFile(tmpDir, "missing.env")).rejects.toThrow(/env file not found/);
  });
});
