import { beforeEach, vi } from "vitest";

vi.mock("is-ci");
vi.mock("~/shell");

beforeEach(() => {
  vi.clearAllMocks();
});
