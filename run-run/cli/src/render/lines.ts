import stringWidth from "fast-string-width";

type Align = "left" | "right";

interface Column<T> {
  key: keyof T;
  align?: Align;
}

interface TableOptions {
  gap?: number;
  padStart?: number;
}

export class Lines {
  #lines: string[];

  constructor() {
    this.#lines = [];
  }

  isEmpty() {
    return !this.#lines.length;
  }

  add(data: string | string[], padStart = 0) {
    if (Array.isArray(data)) {
      data.forEach((it) => {
        this.#append(it, padStart);
      });
    } else {
      this.#append(data, padStart);
    }
    return this;
  }

  addTable<T extends Record<string, unknown>>(rows: T[], columns: Column<T>[], opts: TableOptions = {}) {
    const { gap = 3, padStart = 0 } = opts;

    const sized = columns.map((col) => ({
      ...col,
      width: Math.max(...rows.map((row) => stringWidth(String(row[col.key])))),
    }));
    const sep = this.#sep(gap);

    rows.forEach((row) => {
      const cells = sized.map((col) => {
        const raw = String(row[col.key]);
        return this.#padCell(raw, col.width, col.align ?? "left");
      });

      this.#append(cells.join(sep), padStart);
    });

    return this;
  }

  newline(prepend = false) {
    if (prepend) {
      this.#prepend("");
    } else {
      this.#append("");
    }
    return this;
  }

  printStdout() {
    process.stdout.write(`${this.render()}\n`);
  }

  render() {
    return this.#lines.join("\n");
  }

  #padCell(str: string, width: number, align: Align) {
    const diff = Math.max(0, width - stringWidth(str));
    const fill = this.#sep(diff);
    return align === "right" ? `${fill}${str}` : `${str}${fill}`;
  }

  #append(str: string, padStart = 0) {
    if (padStart > 0) {
      this.#lines.push(`${this.#sep(padStart)}${str}`);
    } else {
      this.#lines.push(str);
    }
  }

  #prepend(str: string, padStart = 0) {
    if (padStart > 0) {
      this.#lines.unshift(`${this.#sep(padStart)}${str}`);
    } else {
      this.#lines.unshift(str);
    }
  }

  #sep(count: number) {
    return " ".repeat(count);
  }
}
