// Inspired by https://dub.sh/6tiHVgn
export function quote(arg: string) {
  if (/^[\w./:=@-]+$/i.test(arg) || arg === "") {
    return arg;
  }

  return arg
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\f/g, "\\f")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t")
    .replace(/\v/g, "\\v")
    .replace(/\0/g, "\\0");
}
