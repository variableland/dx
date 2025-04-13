import path from "node:path";
import type { NodePlopAPI } from "node-plop";
import { ConfigService } from "~/services/config";

export default function configPlop(plop: NodePlopAPI) {
  const baseDir = path.dirname(plop.getPlopfilePath());
  const configService = new ConfigService(baseDir);

  function atLeastOne(answer: string[]) {
    if (answer.length === 0) {
      return "At least one option must be selected";
    }

    return true;
  }

  plop.setGenerator("init", {
    description: "Initialize a project based on a predefined template",
    prompts: [
      {
        type: "list",
        name: "template",
        message: "Template:",
        choices: configService.getTemplateChoices(),
        validate: atLeastOne,
      },
      {
        type: "input",
        name: "name",
        message: "Name:",
      },
      {
        type: "input",
        name: "description",
        message: "Description:",
      },
    ],
    actions: [
      {
        type: "addMany",
        destination: ".",
        base: "templates/#common",
        templateFiles: ["templates/#common/**"],
        globOptions: {
          dot: true,
        },
      },
      {
        type: "addMany",
        destination: ".",
        base: "templates/{{template}}",
        templateFiles: ["templates/{{template}}/**"],
        globOptions: {
          dot: true,
        },
      },
    ],
  });

  plop.setGenerator("add", {
    description: "Add config file(s) to a project",
    prompts: [
      {
        type: "checkbox",
        name: "slugs",
        message: "Select configs:",
        choices: configService.getPluginChoices(),
        validate: atLeastOne,
      },
    ],
    actions: (answers: unknown) => {
      // @ts-expect-error
      return answers.slugs.map((slug) => ({
        type: "addMany",
        destination: ".",
        base: `plugins/${slug}`,
        templateFiles: [`plugins/${slug}/**`],
        globOptions: {
          dot: true,
        },
      }));
    },
  });
}
