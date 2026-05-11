import { describe, expect, it } from "vitest";
import { greet } from "../index.ts";

describe("greet", () => {
  it("greets the given name", () => {
    expect(greet("vland")).toBe("Hello, vland!");
  });
});
