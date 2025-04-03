/**
 * @param {import("node-plop").NodePlopAPI} plop
 */
export default function configPlop(plop) {
  plop.setGenerator("init", {
    description: "Initialize a project based on a predefined template",
    prompts: [
      // Intended to be completed by the program
      {
        type: "input",
        name: "template",
        message: "Template:",
      },
      {
        type: "input",
        name: "folder",
        message: "Folder:",
      },
      // Intended to be completed by the user
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

  plop.setGenerator("add", {
    description: "Add config file(s) to a project",
    prompts: [
      // Intended to be completed by the program
      {
        type: "input",
        name: "id",
        message: "Id:",
      },
    ],
    actions: [
      {
        type: "addMany",
        destination: ".",
        base: "templates/plugins/{{id}}",
        templateFiles: ["templates/plugins/{{id}}/**"],
        globOptions: {
          dot: true,
        },
      },
    ],
  });
}
