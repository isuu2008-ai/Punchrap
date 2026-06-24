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
  "src/project-zip.js",
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
  "src/project-zip.js",
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
  "desktop-package-manifest.json",
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
const projectZipSource = readFileSync("src/project-zip.js", "utf8");
const zipSource = `${appSource}\n${projectZipSource}`;
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

const staticButtonIds = [...indexHtml.matchAll(/<button\b[^>]*\bid="([^"]+)"/g)].map((match) => match[1]);
for (const id of staticButtonIds) {
  const lookupPatterns = [
    `querySelector("#${id}")`,
    `querySelector('#${id}')`,
    `getElementById("${id}")`,
    `getElementById('${id}')`,
  ];
  if (!lookupPatterns.some((pattern) => appSource.includes(pattern))) {
    console.error(`Static button is missing an app.js DOM lookup: #${id}`);
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
if (!indexHtml.includes("quickTakeList") || !appSource.includes("data-quick-play-take") || !appSource.includes("data-quick-vocal-take") || !appSource.includes("sendTakeToVocal")) {
  console.error("Record view must support immediate recent-take audition and Vocal handoff.");
  failed = true;
}
if (!indexHtml.includes("batchTargetList") || !appSource.includes("renderBatchTargetList") || !appSource.includes("batch-target-row")) {
  console.error("Vocal batch render panel must preview the raw take targets before rendering.");
  failed = true;
}
if (!indexHtml.includes("batchSkipRenderedInput") || !appSource.includes("shouldSkipRenderedBatchTargets") || !appSource.includes("hasProcessedTakeForChain")) {
  console.error("Vocal batch render must support skipping raw takes already rendered with the same chain.");
  failed = true;
}
if (!appSource.includes("deleteCustomPreset") || !appSource.includes("data-delete-preset") || !appSource.includes("preset-delete-button")) {
  console.error("Custom vocal presets must be removable without exposing delete controls for built-in presets.");
  failed = true;
}
if (!indexHtml.includes("updateCustomPresetButton") || !appSource.includes("updateCustomPreset") || !appSource.includes("createCustomPresetSnapshot")) {
  console.error("Custom vocal presets must support updating the selected custom preset from current chain settings.");
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
if (!zipSource.includes("manifest.json includes desktopReadiness") || !readFileSync("src/project.js", "utf8").includes("desktopReadiness: environment.desktopReadiness")) {
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
if (!zipSource.includes("manifest.json includes nativeAudio")) {
  console.error("Project zip README must describe the native audio manifest summary.");
  failed = true;
}
if (!appSource.includes("automationManifest: summarizeAutomationParameterManifest()") || !zipSource.includes("manifest.json includes automationManifest")) {
  console.error("Project zip manifest must include the vocal chain automation parameter schema.");
  failed = true;
}
if (!appSource.includes("presets: summarizePresetManifest") || !projectZipSource.includes("buildProjectZipPreviewPresetRows") || !appSource.includes("window.PunchLabProjectZip.buildProjectZipPreviewPresetRows") || !zipSource.includes("manifest.json includes presets")) {
  console.error("Project zip manifest and preview must expose vocal chain preset summaries.");
  failed = true;
}
if (!appSource.includes("notes: summarizeProjectNotes") || !appSource.includes("Lyrics & Notes") || !projectZipSource.includes("buildProjectZipPreviewNotesRows") || !appSource.includes("window.PunchLabProjectZip.buildProjectZipPreviewNotesRows") || !zipSource.includes("manifest.json includes notes")) {
  console.error("Project zip manifest and preview must expose scratch lyrics, marker lyrics, and session notes.");
  failed = true;
}
if (!appSource.includes("session: summarizeSessionManifest") || !projectZipSource.includes("buildProjectZipPreviewSessionRows") || !appSource.includes("window.PunchLabProjectZip.buildProjectZipPreviewSessionRows") || !zipSource.includes("manifest.json includes session settings")) {
  console.error("Project zip manifest and preview must expose session settings.");
  failed = true;
}
if (!projectZipSource.includes("createProjectZipManifest") || !appSource.includes("window.PunchLabProjectZip.createProjectZipManifest")) {
  console.error("Project zip manifest policy must live in src/project-zip.js and be used by app.js.");
  failed = true;
}
if (!projectZipSource.includes("buildProjectZipReadme") || !appSource.includes("window.PunchLabProjectZip.buildProjectZipReadme")) {
  console.error("Project zip README policy must live in src/project-zip.js and be used by app.js.");
  failed = true;
}
if (!projectZipSource.includes("buildProjectZipPreviewPlaybackData") || !appSource.includes("window.PunchLabProjectZip.buildProjectZipPreviewPlaybackData")) {
  console.error("Project zip preview playback data policy must live in src/project-zip.js and be used by app.js.");
  failed = true;
}
if (!projectZipSource.includes("getProjectZipPreviewStyles") || !projectZipSource.includes("getProjectZipPreviewPlayerScript") || !appSource.includes("window.PunchLabProjectZip.getProjectZipPreviewStyles") || !appSource.includes("window.PunchLabProjectZip.getProjectZipPreviewPlayerScript")) {
  console.error("Project zip preview style and player boilerplate must live in src/project-zip.js and be used by app.js.");
  failed = true;
}
if (!projectZipSource.includes("buildProjectZipPreviewBeatSection") || !projectZipSource.includes("buildProjectZipPreviewMarkerRows") || !projectZipSource.includes("buildProjectZipPreviewCompRows") || !appSource.includes("window.PunchLabProjectZip.buildProjectZipPreviewBeatSection") || !appSource.includes("window.PunchLabProjectZip.buildProjectZipPreviewMarkerRows") || !appSource.includes("window.PunchLabProjectZip.buildProjectZipPreviewCompRows")) {
  console.error("Project zip preview beat, marker, and comp rows must live in src/project-zip.js and be used by app.js.");
  failed = true;
}
if (!appSource.includes("Automation Schema") || !projectZipSource.includes("buildProjectZipPreviewAutomationSchemaRows") || !appSource.includes("window.PunchLabProjectZip.buildProjectZipPreviewAutomationSchemaRows")) {
  console.error("Project zip preview must display the vocal chain automation parameter schema.");
  failed = true;
}
if (!projectZipSource.includes("formatProjectZipAutomationParameterValue") || !projectZipSource.includes("formatProjectZipAutomationStateSummary(take.automationState, automationManifest)") || !appSource.includes("window.PunchLabProjectZip.buildProjectZipPreviewTakeRows(takes, automationManifest)")) {
  console.error("Project zip preview must summarize processed take automation values with schema labels.");
  failed = true;
}
if (!projectZipSource.includes("formatProjectZipPreviewPreset") || !projectZipSource.includes("formatProjectZipPreviewTune") || !projectZipSource.includes("formatProjectZipPreviewKeyMode")) {
  console.error("Project zip preview must display processed take preset, tune, and key lineage.");
  failed = true;
}
if (!appSource.includes("regionColor: getTakeRegionColor(take)") || !appSource.includes("regionGroup: getTakeRegionGroup(take)") || !appSource.includes("fadeIn: getTakeFadeIn(take)") || !appSource.includes("fadeOut: getTakeFadeOut(take)")) {
  console.error("Project zip manifest must preserve take region and fade metadata.");
  failed = true;
}
if (!projectZipSource.includes("formatProjectZipPreviewRegion") || !projectZipSource.includes("region-chip") || !projectZipSource.includes("buildProjectZipPreviewTakeRows")) {
  console.error("Project zip preview must display take region group and color metadata.");
  failed = true;
}
if (!projectZipSource.includes("formatProjectZipPreviewLatency") || !projectZipSource.includes("formatProjectZipPreviewTrim") || !projectZipSource.includes("formatProjectZipPreviewFade")) {
  console.error("Project zip preview must display take latency, trim, and fade metadata.");
  failed = true;
}
if (!projectZipSource.includes("formatProjectZipPreviewNativeAudio") || !appSource.includes("window.PunchLabProjectZip.formatProjectZipPreviewNativeAudio")) {
  console.error("Project zip preview must display the native audio environment summary.");
  failed = true;
}
if (!projectZipSource.includes("formatProjectZipPreviewDesktopReadiness") || !appSource.includes("window.PunchLabProjectZip.formatProjectZipPreviewDesktopReadiness") || !appSource.includes("manifest.desktopReadiness || {}")) {
  console.error("Project zip preview must display the desktop readiness snapshot.");
  failed = true;
}
if (!projectZipSource.includes("formatProjectZipPreviewPluginHostScan") || !appSource.includes("window.PunchLabProjectZip.formatProjectZipPreviewPluginHostScan") || !appSource.includes("manifest.pluginHost || {}")) {
  console.error("Project zip preview must display plugin host scan summary.");
  failed = true;
}
if (!appSource.includes("Plugin Host") || !projectZipSource.includes("buildProjectZipPreviewPluginHostRows") || !appSource.includes("window.PunchLabProjectZip.buildProjectZipPreviewPluginHostRows")) {
  console.error("Project zip preview must include a plugin host detail section.");
  failed = true;
}
if (!appSource.includes("formatPluginScanStatusTitle") || !appSource.includes("scannedAt: result?.scannedAt || new Date().toISOString()")) {
  console.error("Topbar plugin scan status must expose scan freshness.");
  failed = true;
}
if (!appSource.includes("Desktop Handoff") || !projectZipSource.includes("buildProjectZipPreviewHandoffRows") || !appSource.includes("window.PunchLabProjectZip.buildProjectZipPreviewHandoffRows")) {
  console.error("Project zip preview must list desktop handoff stages.");
  failed = true;
}
if (!projectZipSource.includes("formatSampleRate(nativeAudio.stats?.sampleRate)")) {
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
