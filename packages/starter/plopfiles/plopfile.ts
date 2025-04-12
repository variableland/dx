import type { NodePlopAPI } from "node-plop";
import { configService } from "~/services/config";

export default function configPlop(plop: NodePlopAPI) {
  plop.setGenerator("init", {
    description: "Initialize a project based on a predefined template",
    prompts: [
      {
        type: "list",
        name: "template",
        message: "Template:",
        choices: configService.getTemplateChoices(),
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
