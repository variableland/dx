import fs from "node:fs";

export const cwd = fs.realpathSync(process.env.RR_PWD ?? process.cwd());
