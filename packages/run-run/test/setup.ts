import { mock } from "bun:test";
import "@vlandoss/clibuddy/test-helpers";

// required to make the version command work independently of the package.json version
Bun.env.VERSION = "0.0.0-test";

mock.module("is-ci", () => ({ default: false }));
