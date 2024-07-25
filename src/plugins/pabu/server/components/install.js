const fs = require("fs-extra");
const path = require("path");

const packageName = "@am-gmbh/pabu-strapi-plugin";

const prodPath = path.join(__dirname, "node_modules", packageName);
const devPath = path.join(__dirname);

console.log("[PB] updating data models...");

const targetBaseDir = `${process.cwd()}/src/components`;

let sourceBaseDir;
if (fs.existsSync(prodPath)) {
  sourceBaseDir = prodPath;
} else {
  sourceBaseDir = devPath;
}

console.log("[PB] use: " + sourceBaseDir);

let files = null;
try {
  files = fs.readdirSync(sourceBaseDir);
} catch (error) {
  console.log(`[PB] error reading files in ${sourceBaseDir}`);
  console.log(error);
  return;
}

try {
  fs.emptyDirSync(targetBaseDir + "/pb");
  console.log(`[PB] ${targetBaseDir + "/pb"} successfully emptied`);
} catch (error) {
  console.log(`[PB] error while emptying ${targetBaseDir + "/pb"}`);
  console.log(error);
  return;
}

try {
  for (const file of files) {
    const sourceCategoryPath = path.join(sourceBaseDir, file);
    const targetCategoryPath = path.join(targetBaseDir, file);

    const stats = fs.statSync(sourceCategoryPath);
    if (stats.isDirectory()) {
      const schemaFiles = fs.readdirSync(sourceCategoryPath);
      for (const schema of schemaFiles) {
        const schemaPath = path.join(sourceCategoryPath, schema);
        if (!fs.existsSync(targetCategoryPath)) {
          fs.mkdirSync(targetCategoryPath, { recursive: true });
        }
        fs.copyFileSync(schemaPath, `${targetCategoryPath}/${schema}`);
      }
    }
  }
} catch (error) {
  console.log("[PB] error while creating schema files for data models");
  console.log(error);
  return;
}
console.log("[PB] data models successfully updated");
