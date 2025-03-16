/**
 * @param {import("plop").NodePlopAPI} plop
 */
export default function configPlop(plop) {
  plop.setGenerator("init", {
    description: "Initialize a project based on a predefined template",
    prompts: [
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
      {
        type: "input",
        name: "template",
        message: "Template:",
      },
    ],
    actions: [
      {
        type: "add",
        path: "{{name}}/biome.json",
        templateFile: "templates/#common/biome.json.hbs",
      },
      {
        type: "add",
        path: "{{name}}/.github/workflows/ci.yml",
        templateFile: "templates/#common/ci.yml.hbs",
      },
      // Add husky config folder
      {
        type: "addMany",
        destination: "{{name}}",
        base: "templates/#common",
        templateFiles: ["templates/#common/.husky"],
        globOptions: {
          dot: true,
        },
      },
      // Add changeset config folder
      {
        type: "addMany",
        destination: "{{name}}",
        base: "templates/#common",
        templateFiles: ["templates/#common/.changeset"],
        globOptions: {
          dot: true,
        },
      },
      // Add template specific files
      {
        type: "addMany",
        destination: "{{name}}",
        base: "templates/#common",
        templateFiles: ["templates/#common/.changeset"],
        globOptions: {
          dot: true,
        },
      },
      {
        type: "addMany",
        destination: "{{name}}",
        base: "templates/{{template}}",
        templateFiles: ["templates/{{template}}/**"],
        globOptions: {
          dot: true,
        },
      },
    ],
  });
}
