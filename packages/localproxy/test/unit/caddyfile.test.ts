import { describe, expect, it } from "bun:test";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CaddyfileService, type LocalDomain } from "#/services/caddyfile";
import { type Caddyfile, CaddyfileParser } from "#/services/caddyfile/parser";
import { FixtureReader } from "#test/helpers";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixtureReader = new FixtureReader(__dirname);

type CreateTestOptions<T> = {
  fixture: string;
  expected: T;
};

describe("caddyfile service", () => {
  function createTest({ fixture, expected }: CreateTestOptions<LocalDomain[]>) {
    const fixturePath = fixtureReader.getFullPath(fixture);

    return async () => {
      const caddyfileService = new CaddyfileService(fixturePath);
      const actual = await caddyfileService.getLocalDomains();

      expect(actual).toEqual(expected);
    };
  }

  it(
    "should get simple host and port",
    createTest({
      fixture: "Caddyfile.simple",
      expected: [
        {
          hostname: "app.localhost",
          ports: ["3000"],
        },
      ],
    }),
  );

  it(
    "should get multiple host with same port",
    createTest({
      fixture: "Caddyfile.with-multiple-sites",
      expected: [
        {
          hostname: "app-1.localhost",
          ports: ["3000"],
        },
        {
          hostname: "app-2.localhost",
          ports: ["3000"],
        },
        {
          hostname: "app-3.localhost",
          ports: ["3001"],
        },
        {
          hostname: "app-4.localhost",
          ports: ["3001"],
        },
        {
          hostname: "app-5.localhost",
          ports: ["3002"],
        },
        {
          hostname: "app-6.localhost",
          ports: ["3002"],
        },
      ],
    }),
  );

  it(
    "should get multiple ports with same host",
    createTest({
      fixture: "Caddyfile.with-multiple-directives",
      expected: [
        {
          hostname: "app.localhost",
          ports: ["3001", "3000"],
        },
      ],
    }),
  );
});

describe("caddyfile parser", () => {
  function createTest({ fixture, expected }: CreateTestOptions<Caddyfile>) {
    const fixtureContent = fixtureReader.read(fixture);

    return async () => {
      const caddyfileParser = new CaddyfileParser(fixtureContent);
      const actual = caddyfileParser.parse();

      expect(actual).toEqual(expected);
    };
  }

  it(
    "should parse a simple caddyfile",
    createTest({
      fixture: "Caddyfile.simple",
      expected: {
        siteBlocks: [
          {
            sites: ["app.localhost"],
            directives: [
              {
                type: "reverse_proxy",
                arguments: ["localhost:3000"],
              },
            ],
          },
        ],
      },
    }),
  );

  it(
    "should parse with multiple sites",
    createTest({
      fixture: "Caddyfile.with-multiple-sites",
      expected: {
        siteBlocks: [
          {
            sites: ["app-1.localhost", "app-2.localhost"],
            directives: [
              {
                type: "reverse_proxy",
                arguments: ["localhost:3000"],
              },
            ],
          },
          {
            sites: ["app-3.localhost", "app-4.localhost"],
            directives: [
              {
                type: "reverse_proxy",
                arguments: ["localhost:3001"],
              },
            ],
          },
          {
            sites: ["app-5.localhost", "app-6.localhost"],
            directives: [
              {
                type: "reverse_proxy",
                arguments: ["localhost:3002"],
              },
            ],
          },
        ],
      },
    }),
  );

  it(
    "should parse with multiple directives",
    createTest({
      fixture: "Caddyfile.with-multiple-directives",
      expected: {
        siteBlocks: [
          {
            sites: ["app.localhost"],
            directives: [
              {
                type: "reverse_proxy",
                matchToken: "/subpath*",
                arguments: ["localhost:3001"],
              },
              {
                type: "reverse_proxy",
                arguments: ["localhost:3000"],
              },
            ],
          },
        ],
      },
    }),
  );
});
