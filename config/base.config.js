const path = require("path");
const appPath = path.join(__dirname, "../");
const srcPath = path.join(appPath, "src/");
const tsConfigPath = path.join(srcPath, "tsconfig.json");
const mainPath = path.join(srcPath, "index.tsx");
const templatePath = path.join(srcPath, "index.html");
const port = 8080;

module.exports = {
  srcPath,
  tsConfigPath,
  mainPath,
  templatePath,
  appPath,
  port,
};
