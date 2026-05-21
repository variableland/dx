const REGISTRY = "https://registry.npmjs.org";
const PROBE_TIMEOUT_MS = 5_000;

export type ReleaseServiceOptions = {
  /** Override the HTTP probe — used by tests. */
  fetcher?: typeof fetch;
};

/**
 * Represents the "release" the current `rr plugins add` runs against — the
 * dist-tag the user picked (default: latest), plus the logic to resolve install
 * specs for related packages under that release.
 *
 * - With no `tag`, `resolve()` always returns `"latest"` and never hits the
 *   registry.
 * - With a `tag` (e.g. `"pr-226"`), probes `<pkg>@<tag>`: returns the tag when
 *   it exists, falls back to `"latest"` otherwise so a partial preview release
 *   (where only a subset of packages got published) still installs cleanly.
 * - Per-package result is cached within the service instance.
 */
export class ReleaseService {
  readonly tag: string | undefined;
  readonly #fetcher: typeof fetch;
  readonly #cache = new Map<string, Promise<string>>();

  constructor(tag: string | undefined, { fetcher = fetch }: ReleaseServiceOptions = {}) {
    this.tag = tag;
    this.#fetcher = fetcher;
  }

  resolve(pkg: string): Promise<string> {
    if (!this.tag || this.tag === "latest") return Promise.resolve("latest");
    const cached = this.#cache.get(pkg);
    if (cached) return cached;
    const promise = this.#probe(pkg);
    this.#cache.set(pkg, promise);
    return promise;
  }

  async #probe(pkg: string): Promise<string> {
    const tag = this.tag as string;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
    try {
      const res = await this.#fetcher(`${REGISTRY}/${pkg}/${encodeURIComponent(tag)}`, { signal: controller.signal });
      return res.ok ? tag : "latest";
    } catch {
      return "latest";
    } finally {
      clearTimeout(timeout);
    }
  }
}
