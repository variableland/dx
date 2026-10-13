const github = require("@changesets/changelog-github").default;

// GitHub renders bare scoped package names as @mentions unless they are code.
const SCOPED =
  /(?<![\w`.@/-])@[a-z0-9][\w.-]*\/[\w.*-]+(?:@[\w.^~<>=+*-]*[\w*])?|(?<![\w`.@/-])@(?:variablelab|rrlab|vlandoss)\b/gi;
const CODE = /(```[\s\S]*?```|`[^`\n]*`)/;

function codeScopes(text) {
  return text
    .split(CODE)
    .map((part, i) => (i % 2 ? part : part.replace(SCOPED, (name) => `\`${name}\``)))
    .join("");
}

module.exports = {
  async getReleaseLine(...args) {
    return codeScopes(await github.getReleaseLine(...args));
  },
  async getDependencyReleaseLine(...args) {
    return codeScopes(await github.getDependencyReleaseLine(...args));
  },
};
