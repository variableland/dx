import { expect, it } from "vitest";
import { getParentDir } from "../getParentDir";

it("should return first folder when path is relative", () => {
  expect(getParentDir("./parent/child1/child2")).toBe("parent");
});

it("should return first folder when path is not quite relative", () => {
  expect(getParentDir("parent/child1/child2")).toBe("parent");
});

it("should return first folder when path is absolute", () => {
  expect(getParentDir("/parent/child1/child2")).toBe("parent");
});
