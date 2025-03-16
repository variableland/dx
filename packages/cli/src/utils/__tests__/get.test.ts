import { expect, it } from "vitest";
import { get } from "../get";

it("should get the value when the key is found", () => {
  const obj = { a: 1 };
  expect(get(obj, "a")).toBe(1);
});

it("should get the value when the nested key is found", () => {
  const obj = { a: { b: { c: 1 } } };
  expect(get(obj, "a.b.c")).toBe(1);
});

it("should get undefined when the key is not found", () => {
  const obj = { a: 1 };
  expect(get(obj, "b")).toBeUndefined();
});

it("should get undefined when the nested key is not found", () => {
  const obj = { a: { b: { c: 1 } } };
  expect(get(obj, "a.b.d")).toBeUndefined();
});
