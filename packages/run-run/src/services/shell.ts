import { createShellService } from "@variableland/clibuddy";
import { ctx } from "./ctx";

const shell = createShellService({
  localBaseBinPath: [ctx.value.appPkg.dirPath, ctx.value.binPkg.dirPath],
});

export const $ = shell.$;
