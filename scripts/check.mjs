import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const syntaxFiles = [
  "server.mjs",
  "app.js",
  "src/audio.js",
  "src/dsp.js",
  "src/mix.js",
  "src/vocal.js",
  "src/native-bridge.js",
  "src/engine.js",
  "src/project.js",
  "src/storage.js",
  "src/platform.js",
  "sw.js",
];

const requiredScripts = [
  "src/dsp.js",
  "src/audio.js",
  "src/mix.js",
  "src/vocal.js",
  "src/native-bridge.js",
  "src/engine.js",
  "src/project.js",
  "src/storage.js",
  "src/platform.js",
  "app.js",
];

const requiredFiles = [
  "manifest.webmanifest",
  "assets/punchlab-icon.svg",
  "sw.js",
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

for (const file of requiredFiles) {
  if (!existsSync(file)) {
    console.error(`Missing required file: ${file}`);
    failed = true;
  }
}

if (!indexHtml.includes("manifest.webmanifest")) {
  console.error("Missing web app manifest link.");
  failed = true;
}

if (failed) {
  process.exit(1);
}

console.log(`PunchLab check passed: ${syntaxFiles.length} files and ${requiredScripts.length} script references.`);
