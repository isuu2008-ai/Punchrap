import { existsSync, readFileSync } from "node:fs";

const wrapper = readJson("desktop-wrapper-manifest.json");
const host = readJson("desktop-host-manifest.json");
const plugin = readJson("plugin-host-manifest.json");
const indexHtml = readFileSync("index.html", "utf8");
let failed = false;

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function fail(message) {
  console.error(message);
  failed = true;
}

function requireString(value, label) {
  if (typeof value !== "string" || !value.trim()) {
    fail(`${label} must be a non-empty string.`);
  }
}

function requireBoolean(value, label) {
  if (typeof value !== "boolean") {
    fail(`${label} must be boolean.`);
  }
}

requireString(wrapper.appId, "wrapper.appId");
requireString(wrapper.appName, "wrapper.appName");
requireString(wrapper.shell?.entry, "wrapper.shell.entry");
requireString(wrapper.shell?.windowTitle, "wrapper.shell.windowTitle");

const requiredMeta = {
  "punchlab-desktop-manifest": "./desktop-host-manifest.json",
  "punchlab-wrapper-manifest": "./desktop-wrapper-manifest.json",
  "punchlab-plugin-host-manifest": "./plugin-host-manifest.json",
};

for (const [name, content] of Object.entries(requiredMeta)) {
  if (!indexHtml.includes(`name="${name}"`) || !indexHtml.includes(`content="${content}"`)) {
    fail(`index.html missing desktop meta ${name} -> ${content}.`);
  }
}

if (Number(wrapper.shell?.minWidth || 0) < 1000) {
  fail("wrapper.shell.minWidth must be at least 1000 for the studio layout.");
}
if (Number(wrapper.shell?.minHeight || 0) < 700) {
  fail("wrapper.shell.minHeight must be at least 700 for the studio layout.");
}

requireBoolean(wrapper.permissions?.microphone, "wrapper.permissions.microphone");
requireBoolean(wrapper.permissions?.filesystem, "wrapper.permissions.filesystem");
requireBoolean(wrapper.permissions?.audioOutputRouting, "wrapper.permissions.audioOutputRouting");
requireBoolean(wrapper.permissions?.network, "wrapper.permissions.network");

if (wrapper.permissions?.microphone !== true) {
  fail("Desktop wrapper must request microphone permission.");
}
if (wrapper.permissions?.filesystem !== true) {
  fail("Desktop wrapper must request filesystem permission.");
}
if (wrapper.permissions?.network !== false) {
  fail("Desktop wrapper should remain local-first with network disabled by default.");
}

const requiredStages = ["browser-shell", "desktop-wrapper", "native-audio-engine", "plugin-host"];
const stageIds = new Set((wrapper.handoffStages || []).map((stage) => stage.id));
for (const stageId of requiredStages) {
  if (!stageIds.has(stageId)) {
    fail(`Desktop wrapper handoff stage missing: ${stageId}`);
  }
}

if (wrapper.nativeBridge?.global !== host.bridgeGlobal) {
  fail("Wrapper native bridge global must match host bridgeGlobal.");
}
if (wrapper.pluginHost?.scanMethod !== plugin.scan?.nativeMethod) {
  fail("Wrapper plugin scan method must match plugin host manifest.");
}
if (wrapper.pluginHost?.requiresCapability !== plugin.requiredCapabilities?.[0]) {
  fail("Wrapper plugin capability must match plugin host manifest.");
}

for (const [contractName, contractPath] of Object.entries(host.contracts || {})) {
  if (!existsSync(contractPath)) {
    fail(`Desktop host contract missing file for ${contractName}: ${contractPath}`);
  }
}

for (const method of host.requiredNativeMethods || []) {
  if (!wrapper.nativeBridge?.requiredMethods?.includes(method)) {
    fail(`Wrapper missing required native method: ${method}`);
  }
}
for (const method of host.optionalNativeMethods || []) {
  if (!wrapper.nativeBridge?.optionalMethods?.includes(method)) {
    fail(`Wrapper missing optional native method: ${method}`);
  }
}

if (failed) {
  process.exit(1);
}

console.log(`PunchLab desktop contract check passed: ${requiredStages.length} handoff stages.`);
