import { vi } from "vitest";

// required to make the version command work independently of the package.json version
process.env.VERSION = "0.0.0-test";

vi.mock("is-ci", () => ({ default: false }));
