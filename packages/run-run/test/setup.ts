import { vi } from "vitest";

// import "@vlandoss/clibuddy/test-helpers";

// required to make the version command work independently of the package.json version
process.env.VERSION = "0.0.0-test";

vi.mock("is-ci", () => ({ default: false }));
