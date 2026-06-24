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
const appSource = readFileSync("app.js", "utf8");
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
if (!appSource.includes("nativeAudioEngine?.detail")) {
  console.error("app.js must surface native audio engine readiness detail in the engine status.");
  failed = true;
}
if (!appSource.includes("preferredRuntimeBufferSize")) {
  console.error("app.js must surface the preferred native buffer size in the engine status.");
  failed = true;
}
if (!appSource.includes("formatRuntimeLatency") || !appSource.includes("runtimeRoundTripLatencyMs")) {
  console.error("app.js must surface runtime round-trip latency in the engine status.");
  failed = true;
}
if (!appSource.includes("getDisplayRoundTripLatency") || !appSource.includes("loadedProjectEnvironment?.nativeAudio?.roundTripLatencyMs")) {
  console.error("Engine status must fall back to loaded project round-trip latency.");
  failed = true;
}
if (!appSource.includes("getDisplaySampleRate") || !appSource.includes("loadedProjectEnvironment?.nativeAudio?.stats?.sampleRate")) {
  console.error("Engine status must surface sample rate from runtime or loaded project environment.");
  failed = true;
}
if (!appSource.includes("summarizeNativeAudioEnvironment") || !appSource.includes("nativeAudio: summarizeNativeAudioEnvironment()")) {
  console.error("Project zip manifest must include native audio environment summary.");
  failed = true;
}
if (!appSource.includes("summarizeDesktopReadinessEnvironment") || !appSource.includes("desktopReadiness: summarizeDesktopReadinessEnvironment()")) {
  console.error("Project environment must include desktop readiness snapshots.");
  failed = true;
}
if (!appSource.includes("manifest.json includes desktopReadiness") || !readFileSync("src/project.js", "utf8").includes("desktopReadiness: environment.desktopReadiness")) {
  console.error("Project zip and bundle must preserve desktop readiness context.");
  failed = true;
}
if (!appSource.includes("environment: getProjectEnvironment()") || !readFileSync("src/project.js", "utf8").includes("sanitizeEnvironment")) {
  console.error("Project bundle must include native audio environment summary.");
  failed = true;
}
if (!appSource.includes("loadedProjectEnvironment") || !readFileSync("src/project.js", "utf8").includes("environment: sanitizeEnvironment(bundle.environment")) {
  console.error("Project load/autosave must preserve native audio environment summary.");
  failed = true;
}
if (!appSource.includes("loadedProjectEnvironment?.nativeAudio?.preferredBufferSize")) {
  console.error("Project load must restore native buffer size from saved environment fallback.");
  failed = true;
}
if (!appSource.includes("manifest.json includes nativeAudio")) {
  console.error("Project zip README must describe the native audio manifest summary.");
  failed = true;
}
if (!appSource.includes("automationManifest: summarizeAutomationParameterManifest()") || !appSource.includes("manifest.json includes automationManifest")) {
  console.error("Project zip manifest must include the vocal chain automation parameter schema.");
  failed = true;
}
if (!appSource.includes("Automation Schema") || !appSource.includes("buildPreviewAutomationSchemaRows")) {
  console.error("Project zip preview must display the vocal chain automation parameter schema.");
  failed = true;
}
if (!appSource.includes("formatAutomationParameterValue") || !appSource.includes("formatAutomationStateSummary(take.automationState, automationManifest)")) {
  console.error("Project zip preview must summarize processed take automation values with schema labels.");
  failed = true;
}
if (!appSource.includes("formatPreviewPreset") || !appSource.includes("formatPreviewTune") || !appSource.includes("formatPreviewKeyMode")) {
  console.error("Project zip preview must display processed take preset, tune, and key lineage.");
  failed = true;
}
if (!appSource.includes("formatPreviewNativeAudio")) {
  console.error("Project zip preview must display the native audio environment summary.");
  failed = true;
}
if (!appSource.includes("formatPreviewDesktopReadiness") || !appSource.includes("manifest.desktopReadiness || {}")) {
  console.error("Project zip preview must display the desktop readiness snapshot.");
  failed = true;
}
if (!appSource.includes("formatPreviewPluginHostScan") || !appSource.includes("manifest.pluginHost || {}")) {
  console.error("Project zip preview must display plugin host scan summary.");
  failed = true;
}
if (!appSource.includes("Plugin Host") || !appSource.includes("buildPreviewPluginHostRows")) {
  console.error("Project zip preview must include a plugin host detail section.");
  failed = true;
}
if (!appSource.includes("formatPluginScanStatusTitle") || !appSource.includes("scannedAt: result?.scannedAt || new Date().toISOString()")) {
  console.error("Topbar plugin scan status must expose scan freshness.");
  failed = true;
}
if (!appSource.includes("Desktop Handoff") || !appSource.includes("formatPreviewHandoffStageName")) {
  console.error("Project zip preview must list desktop handoff stages.");
  failed = true;
}
if (!appSource.includes("formatDisplaySampleRate(nativeAudio.stats?.sampleRate)")) {
  console.error("Project zip preview must include native audio sample-rate context.");
  failed = true;
}
if (!appSource.includes("nativeBufferSize") || !appSource.includes("applyNativeBufferSize") || !appSource.includes("changeNativeBufferSize")) {
  console.error("app.js must persist and apply the native buffer-size preference.");
  failed = true;
}
if (!readFileSync("src/platform.js", "utf8").includes("setNativeBufferSizePreference")) {
  console.error("Platform must expose the native buffer-size preference.");
  failed = true;
}
if (!readFileSync("src/platform.js", "utf8").includes("refreshLatencyStats")) {
  console.error("Platform must expose native latency stat refresh.");
  failed = true;
}
if (!readFileSync("src/platform.js", "utf8").includes("latencyStatsUpdatedAt") || !readFileSync("src/desktop.js", "utf8").includes("statsUpdatedAt")) {
  console.error("Platform and desktop readiness must expose native latency stat freshness.");
  failed = true;
}
if (!readFileSync("src/desktop.js", "utf8").includes("preferredRuntimeBufferSize")) {
  console.error("Desktop readiness must expose the preferred runtime buffer size.");
  failed = true;
}
if (!readFileSync("src/desktop.js", "utf8").includes("runtimeRoundTripLatencyMs")) {
  console.error("Desktop readiness must expose runtime round-trip latency.");
  failed = true;
}
if (!readFileSync("src/desktop.js", "utf8").includes("fixture: Boolean(capabilities.nativeFixture)") || !appSource.includes("Native fixture")) {
  console.error("Desktop readiness and UI must identify native fixture mode explicitly.");
  failed = true;
}
if (!readFileSync("src/native-fixture.js", "utf8").includes("setItem(\"punchlab:nativeFixture\", \"1\")") || !readFileSync("src/native-fixture.js", "utf8").includes("removeItem(\"punchlab:nativeFixture\")")) {
  console.error("Native fixture mode must support persistent URL enable/disable flags.");
  failed = true;
}
if (!indexHtml.includes("nativeBufferSizeSelect")) {
  console.error("index.html must include the native buffer-size selector.");
  failed = true;
}
if (!indexHtml.includes("nativeAudioSummary") || !appSource.includes("renderNativeAudioSummary")) {
  console.error("Record setup must include a compact native audio runtime summary.");
  failed = true;
}
if (!indexHtml.includes("nativeLatencyRefreshButton") || !appSource.includes("refreshNativeLatencyStats")) {
  console.error("Record setup must expose a native latency stats refresh control.");
  failed = true;
}
if (!appSource.includes("getDisplayLatencyStatsUpdatedAt") || !appSource.includes("statsUpdatedAt")) {
  console.error("Native audio summaries must show latency stats freshness when available.");
  failed = true;
}

if (failed) {
  process.exit(1);
}

console.log(`PunchLab check passed: ${syntaxFiles.length} files and ${requiredScripts.length} script references.`);
