import { beforeEach, vi } from "vitest";

vi.mock("~/shell");
vi.mock("~/logger");
vi.mock("is-ci");

beforeEach(() => {
  vi.clearAllMocks();
});
