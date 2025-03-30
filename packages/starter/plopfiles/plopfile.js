/**
 * @param {import("plop").NodePlopAPI} plop
 */
export default function configPlop(plop) {
  plop.setGenerator("init", {
    description: "Initialize a project based on a predefined template",
    prompts: [
      {
        type: "input",
        name: "template",
        message: "Template:",
      },
      {
        type: "input",
        name: "folder",
        message: "Template:",
      },
      {
        type: "input",
        name: "name",
        message: "Name:",
        default: (answers) => answers.folder,
      },
      {
        type: "input",
        name: "description",
        message: "Description:",
      },
    ],
    actions: [
      {
        type: "add",
        path: "{{folder}}/biome.json",
        templateFile: "templates/#common/biome.json.hbs",
      },
      {
        type: "add",
        path: "{{folder}}/.github/workflows/ci.yml",
        templateFile: "templates/#common/ci.yml.hbs",
      },
      // Add husky config folder
      {
        type: "addMany",
        destination: "{{folder}}",
        base: "templates/#common",
        templateFiles: ["templates/#common/.husky"],
        globOptions: {
          dot: true,
        },
      },
      // Add changeset config folder
      {
        type: "addMany",
        destination: "{{folder}}",
        base: "templates/#common",
        templateFiles: ["templates/#common/.changeset"],
        globOptions: {
          dot: true,
        },
      },
      // Add template specific files
      {
        type: "addMany",
        destination: "{{folder}}",
        base: "templates/{{template}}",
        templateFiles: ["templates/{{template}}/**"],
        globOptions: {
          dot: true,
        },
      },
    ],
  });
}
