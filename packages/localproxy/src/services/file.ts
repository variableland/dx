import fs from "node:fs/promises";

export class FileService {
  #filePath: string;

  constructor(filePath: string) {
    this.#filePath = filePath;
  }

  async print() {
    const fileContent = (await fs.readFile(this.#filePath)).toString();

    console.log(`${this.#filePath}:\n`);
    console.log(fileContent.trim());
  }
}
