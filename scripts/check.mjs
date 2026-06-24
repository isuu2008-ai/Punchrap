import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const syntaxFiles = [
  "server.mjs",
  "app.js",
  "src/audio.js",
  "src/dsp.js",
  "src/mix.js",
  "src/vocal.js",
  "src/project.js",
  "src/storage.js",
];

const requiredScripts = [
  "src/dsp.js",
  "src/audio.js",
  "src/mix.js",
  "src/vocal.js",
  "src/project.js",
  "src/storage.js",
  "app.js",
];

let failed = false;

for (const file of syntaxFiles) {
  const result = spawnSync(process.execPath, ["--check", file], {
    stdio: "inherit",
  });
  if (result.status !== 0) {
    failed = true;
  }
}

const indexHtml = readFileSync("index.html", "utf8");
for (const script of requiredScripts) {
  if (!indexHtml.includes(script)) {
    console.error(`Missing script reference: ${script}`);
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}

console.log(`PunchLab check passed: ${syntaxFiles.length} files and ${requiredScripts.length} script references.`);
