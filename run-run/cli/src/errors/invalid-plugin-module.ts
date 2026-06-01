/** Thrown when an installed plugin package doesn't export a default factory function. */
export class InvalidPluginModuleError extends Error {
  constructor(pkgName: string) {
    super(`Plugin '${pkgName}' did not export a default factory function.`);
  }
}
