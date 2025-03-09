export const isRaw = (arg: unknown): arg is { stdout: string } =>
  typeof arg === "object" && arg !== null && "stdout" in arg && typeof arg.stdout === "string";
