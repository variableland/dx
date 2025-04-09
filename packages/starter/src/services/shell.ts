import { createShellService } from "@variableland/clibuddy";
import { ctx } from "./ctx";

const shell = createShellService({
  localBaseBinPath: [ctx.value.binPkg.dirPath],
});

export const $ = shell.$;
