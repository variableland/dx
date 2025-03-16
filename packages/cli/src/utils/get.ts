export function get(obj: unknown, key: string) {
  if (typeof obj !== "object" || obj === null) {
    return undefined;
  }

  if (typeof key !== "string") {
    throw new Error("Key must be a string");
  }

  const parts = key.split(".");

  let value = {
    ...obj,
  };

  for (let i = 0; i < parts.length; i++) {
    const key = parts[i] as string;

    // @ts-expect-error value is type to {}
    const subValue = value[key];

    if (!subValue) {
      return undefined;
    }

    value = subValue;
  }

  return value;
}
