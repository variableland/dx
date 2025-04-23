function whenAddTsconfig(answers: { slugs: string[] }) {
  return answers.slugs.includes("tsconfig");
}

export const tsconfigPrompts = [
  {
    type: "confirm",
    name: "useTSC",
    message: "Are you using TSC to turn your .ts files into .js files?",
    default: false,
    when: whenAddTsconfig,
  },
  {
    type: "confirm",
    name: "useDOM",
    message: "Is your code running in a DOM environment?",
    default: false,
    when: whenAddTsconfig,
  },
  {
    type: "list",
    name: "tsProjectType",
    message: "What type of TS project are you creating?",
    choices: [
      { name: "App", value: "app" },
      { name: "Library", value: "library" },
      { name: "Monorepo library", value: "library-monorepo" },
    ],
    when: whenAddTsconfig,
  },
];
