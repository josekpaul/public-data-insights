// Stamps every report.css <link> tag with a content hash so browsers
// pick up changes immediately instead of serving a stale cached copy.
// Run this after editing docs/assets/report.css:
//   node scripts/bump-css-version.js
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DOCS_DIR = path.join(__dirname, "..", "docs");
const CSS_PATH = path.join(DOCS_DIR, "assets", "report.css");

const cssContent = fs.readFileSync(CSS_PATH);
const hash = crypto.createHash("sha256").update(cssContent).digest("hex").slice(0, 10);

function findHtmlFiles(dir) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results = results.concat(findHtmlFiles(full));
    else if (entry.name.endsWith(".html")) results.push(full);
  }
  return results;
}

const linkPattern = /(href="[^"]*report\.css)(\?v=[a-f0-9]+)?(")/;
let changed = 0;

for (const file of findHtmlFiles(DOCS_DIR)) {
  const content = fs.readFileSync(file, "utf8");
  if (!linkPattern.test(content)) continue;
  const updated = content.replace(linkPattern, `$1?v=${hash}$3`);
  if (updated !== content) {
    fs.writeFileSync(file, updated);
    changed++;
    console.log("updated:", path.relative(DOCS_DIR, file));
  }
}

console.log(`\nreport.css hash: ${hash}`);
console.log(`${changed} file(s) updated.`);
