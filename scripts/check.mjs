import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const syntaxFiles = [
  "server.mjs",
  "scripts/check-desktop-contract.mjs",
  "app.js",
  "src/chain-params.js",
  "src/audio.js",
  "src/dsp.js",
  "src/files.js",
  "src/templates.js",
  "src/devices.js",
  "src/mix.js",
  "src/vocal.js",
  "src/engine-contract.js",
  "src/native-bridge.js",
  "src/native-fixture.js",
  "src/native-adapter.js",
  "src/engine.js",
  "src/project.js",
  "src/storage.js",
  "src/platform.js",
  "src/desktop.js",
  "sw.js",
];

const requiredScripts = [
  "src/chain-params.js",
  "src/dsp.js",
  "src/audio.js",
  "src/files.js",
  "src/templates.js",
  "src/devices.js",
  "src/mix.js",
  "src/vocal.js",
  "src/engine-contract.js",
  "src/native-bridge.js",
  "src/native-fixture.js",
  "src/native-adapter.js",
  "src/engine.js",
  "src/project.js",
  "src/storage.js",
  "src/platform.js",
  "src/desktop.js",
  "app.js",
];

const requiredFiles = [
  "manifest.webmanifest",
  "desktop-host-manifest.json",
  "desktop-wrapper-manifest.json",
  "plugin-host-manifest.json",
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

const desktopContractResult = spawnSync(process.execPath, ["scripts/check-desktop-contract.mjs"], {
  stdio: "inherit",
});
if (desktopContractResult.status !== 0) {
  failed = true;
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

const desktopHostManifest = JSON.parse(readFileSync("desktop-host-manifest.json", "utf8"));
const desktopWrapperManifest = JSON.parse(readFileSync("desktop-wrapper-manifest.json", "utf8"));
const pluginHostManifest = JSON.parse(readFileSync("plugin-host-manifest.json", "utf8"));
if (desktopWrapperManifest.nativeBridge?.hostManifest !== "desktop-host-manifest.json") {
  console.error("Desktop wrapper manifest must reference desktop-host-manifest.json.");
  failed = true;
}
if (desktopWrapperManifest.nativeBridge?.global !== desktopHostManifest.bridgeGlobal) {
  console.error("Desktop wrapper bridge global does not match host manifest.");
  failed = true;
}
for (const method of desktopHostManifest.requiredNativeMethods || []) {
  if (!desktopWrapperManifest.nativeBridge?.requiredMethods?.includes(method)) {
    console.error(`Desktop wrapper manifest missing required native method: ${method}`);
    failed = true;
  }
}
for (const method of desktopHostManifest.optionalNativeMethods || []) {
  if (!desktopWrapperManifest.nativeBridge?.optionalMethods?.includes(method)) {
    console.error(`Desktop wrapper manifest missing optional native method: ${method}`);
    failed = true;
  }
}
if (desktopWrapperManifest.pluginHost?.manifest !== "plugin-host-manifest.json") {
  console.error("Desktop wrapper manifest must reference plugin-host-manifest.json.");
  failed = true;
}
if (!desktopWrapperManifest.nativeBridge?.optionalMethods?.includes(pluginHostManifest.scan?.nativeMethod)) {
  console.error("Plugin scan native method must be listed as an optional native bridge method.");
  failed = true;
}
for (const capability of pluginHostManifest.requiredCapabilities || []) {
  if (!desktopHostManifest.optionalEngineCapabilities?.includes(capability)) {
    console.error(`Plugin host required capability missing from desktop host optional capabilities: ${capability}`);
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
