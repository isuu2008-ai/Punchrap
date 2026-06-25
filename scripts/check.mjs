import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const syntaxFiles = [
  "server.mjs",
  "scripts/check-desktop-contract.mjs",
  "scripts/desktop-doctor.mjs",
  "scripts/build-desktop-dist.mjs",
  "scripts/start-desktop-dev-server.mjs",
  "src/runtime-guard.js",
  "src/studio-state.js",
  "src/beat-playback.js",
  "src/ui-elements.js",
  "src/ui-renderers.js",
  "src/ui-events.js",
  "app.js",
  "src/chain-params.js",
  "src/presets.js",
  "src/tracks.js",
  "src/pitch.js",
  "src/audio.js",
  "src/export-mastering.js",
  "src/export-plan.js",
  "src/export-panel.js",
  "src/timeline.js",
  "src/takes.js",
  "src/format.js",
  "src/dsp.js",
  "src/files.js",
  "src/templates.js",
  "src/devices.js",
  "src/shortcuts.js",
  "src/mix.js",
  "src/vocal.js",
  "src/engine-contract.js",
  "src/native-bridge.js",
  "src/tauri-bridge.js",
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
  "src/presets.js",
  "src/tracks.js",
  "src/pitch.js",
  "src/dsp.js",
  "src/audio.js",
  "src/export-mastering.js",
  "src/export-plan.js",
  "src/export-panel.js",
  "src/timeline.js",
  "src/takes.js",
  "src/format.js",
  "src/files.js",
  "src/templates.js",
  "src/devices.js",
  "src/shortcuts.js",
  "src/mix.js",
  "src/vocal.js",
  "src/engine-contract.js",
  "src/native-bridge.js",
  "src/tauri-bridge.js",
  "src/native-fixture.js",
  "src/native-adapter.js",
  "src/engine.js",
  "src/project.js",
  "src/project-zip.js",
  "src/storage.js",
  "src/platform.js",
  "src/desktop.js",
  "src/runtime-guard.js",
  "src/studio-state.js",
  "src/beat-playback.js",
  "src/ui-elements.js",
  "src/ui-renderers.js",
  "src/ui-events.js",
  "app.js",
];

const requiredFiles = [
  "manifest.webmanifest",
  "desktop-host-manifest.json",
  "desktop-wrapper-manifest.json",
  "plugin-host-manifest.json",
  "desktop-package-manifest.json",
  "scripts/desktop-doctor.mjs",
  "scripts/build-desktop-dist.mjs",
  "scripts/start-desktop-dev-server.mjs",
  "src/runtime-guard.js",
  "src/studio-state.js",
  "src/beat-playback.js",
  "src/export-panel.js",
  "src-tauri/tauri.conf.json",
  "src-tauri/Cargo.lock",
  "src-tauri/Cargo.toml",
  "src-tauri/build.rs",
  "src-tauri/src/main.rs",
  "src-tauri/src/lib.rs",
  "src-tauri/capabilities/main.json",
  "src-tauri/icons/32x32.png",
  "src-tauri/icons/128x128.png",
  "src-tauri/icons/128x128@2x.png",
  "src-tauri/icons/icon.icns",
  "src-tauri/icons/icon.ico",
  "src/tauri-bridge.js",
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
const runtimeGuardSource = readFileSync("src/runtime-guard.js", "utf8");
const studioStateSource = readFileSync("src/studio-state.js", "utf8");
const beatPlaybackSource = readFileSync("src/beat-playback.js", "utf8");
const uiElementsSource = readFileSync("src/ui-elements.js", "utf8");
const uiRenderersSource = readFileSync("src/ui-renderers.js", "utf8");
const uiEventsSource = readFileSync("src/ui-events.js", "utf8");
const devicesSource = readFileSync("src/devices.js", "utf8");
const mixSource = readFileSync("src/mix.js", "utf8");
const exportPanelSource = readFileSync("src/export-panel.js", "utf8");
const tauriBridgeSource = readFileSync("src/tauri-bridge.js", "utf8");
const projectZipSource = readFileSync("src/project-zip.js", "utf8");
const domLookupSource = `${appSource}\n${uiElementsSource}`;
const appRendererSource = `${appSource}\n${uiRenderersSource}`;
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

const uiRendererNames = [
  "renderRegionGroupOptions",
  "renderCompPoolRow",
  "renderAudioDeviceSelect",
  "renderPitchLaneFrame",
  "renderTakeWaveform",
  "updateTemplateMeta",
  "renderRecoverySelect",
  "renderProjectTemplates",
  "renderPluginScanStatus",
  "formatPluginScanStatusTitle",
];
if (!uiRenderersSource.includes("window.PunchLabUIRenderers") || !appSource.includes("window.PunchLabUIRenderers.createRenderers")) {
  console.error("app.js must create small UI renderers through src/ui-renderers.js.");
  failed = true;
}
if (!uiEventsSource.includes("window.PunchLabUIEvents") || !appSource.includes("window.PunchLabUIEvents.createEvents") || appSource.includes("function bindEvents(")) {
  console.error("app.js must wire top-level UI events through src/ui-events.js.");
  failed = true;
}
if (!uiEventsSource.includes("PunchLab UI event handler missing")) {
  console.error("UI event binding must fail loudly when a visible control has no handler.");
  failed = true;
}
if (!studioStateSource.includes("window.PunchLabStudioState") || !appSource.includes("PunchLabStudioState.createState") || appSource.includes("const state = {") || appSource.includes("const tracks = [") || appSource.includes("const presets = [")) {
  console.error("Initial state, tracks, and presets must live in src/studio-state.js.");
  failed = true;
}
if (!runtimeGuardSource.includes("window.PunchLabRuntimeGuard") || !runtimeGuardSource.includes("unhandledrejection") || !appSource.includes("PunchLabRuntimeGuard.bindGlobalErrorHandlers")) {
  console.error("Global runtime error guard must live in src/runtime-guard.js and be installed by app.js.");
  failed = true;
}
if (!beatPlaybackSource.includes("window.PunchLabBeatPlayback") || !appSource.includes("PunchLabBeatPlayback.createBeatPlayback") || appSource.includes("function prepareBeatPlayback(") || appSource.includes("function updateBeatGain(")) {
  console.error("Beat playback and gain control must live in src/beat-playback.js.");
  failed = true;
}
if (!exportPanelSource.includes("window.PunchLabExportPanel") || !appSource.includes("PunchLabExportPanel.createExportPanel") || appSource.includes("function renderExportPanel(") || appSource.includes("function renderLoudnessReport(")) {
  console.error("Export panel rendering must live in src/export-panel.js.");
  failed = true;
}
if (!uiElementsSource.includes("validateElementMap") || !uiElementsSource.includes("PunchLab UI missing required elements")) {
  console.error("UI element lookup must fail loudly when required DOM is missing.");
  failed = true;
}
if (!indexHtml.includes("beatGainSlider") || !uiElementsSource.includes("beatGainSlider") || !uiEventsSource.includes("updateBeatGain")) {
  console.error("Beat playback gain control must be present and wired.");
  failed = true;
}
if (!studioStateSource.includes("beatGain: 1.4") || !beatPlaybackSource.includes("prepareBeatPlayback") || !mixSource.includes("beatVolume")) {
  console.error("Beat playback/export boost must stay wired through studio-state, beat-playback, and mix modules.");
  failed = true;
}
if (!studioStateSource.includes("inputGain: 1.25") || !indexHtml.includes('id="inputGainSlider" type="range" min="0.5" max="4" step="0.1" value="1.25"')) {
  console.error("Default input gain must stay below the old noisy +6 dB default.");
  failed = true;
}
if (!devicesSource.includes("noiseSuppression: true") || !devicesSource.includes("echoCancellation: true")) {
  console.error("Default mic constraints must reduce room noise and playback bleed.");
  failed = true;
}
for (const name of uiRendererNames) {
  if (!uiRenderersSource.includes(`function ${name}`) || appSource.includes(`function ${name}`)) {
    console.error(`${name} must live in src/ui-renderers.js and be consumed by app.js.`);
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
  if (!lookupPatterns.some((pattern) => domLookupSource.includes(pattern))) {
    console.error(`Static button is missing a DOM lookup: #${id}`);
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
if (!indexHtml.includes("src/tauri-bridge.js") || !readFileSync("sw.js", "utf8").includes("./src/tauri-bridge.js")) {
  console.error("Tauri bridge adapter must be loaded by index.html and cached by the service worker.");
  failed = true;
}
if (!indexHtml.includes("src/export-mastering.js") || !readFileSync("sw.js", "utf8").includes("./src/export-mastering.js")) {
  console.error("Export mastering module must be loaded by index.html and cached by the service worker.");
  failed = true;
}
if (!indexHtml.includes("src/export-plan.js") || !readFileSync("sw.js", "utf8").includes("./src/export-plan.js")) {
  console.error("Export plan module must be loaded by index.html and cached by the service worker.");
  failed = true;
}
if (!indexHtml.includes("src/timeline.js") || !readFileSync("sw.js", "utf8").includes("./src/timeline.js")) {
  console.error("Timeline policy module must be loaded by index.html and cached by the service worker.");
  failed = true;
}
if (!indexHtml.includes("src/takes.js") || !readFileSync("sw.js", "utf8").includes("./src/takes.js")) {
  console.error("Take policy module must be loaded by index.html and cached by the service worker.");
  failed = true;
}
if (!indexHtml.includes("src/format.js") || !readFileSync("sw.js", "utf8").includes("./src/format.js")) {
  console.error("Format utility module must be loaded by index.html and cached by the service worker.");
  failed = true;
}
if (!tauriBridgeSource.includes("window.__TAURI__?.core?.invoke") || !tauriBridgeSource.includes("get_punchlab_bridge_status") || !tauriBridgeSource.includes("nativeBridgeReady")) {
  console.error("Tauri bridge adapter must probe Tauri invoke and gate native activation on nativeBridgeReady.");
  failed = true;
}
const tauriLibSource = readFileSync("src-tauri/src/lib.rs", "utf8");
if (!tauriLibSource.includes("get_capabilities") || !tauriLibSource.includes("get_devices") || !tauriLibSource.includes("IMPLEMENTED_NATIVE_METHODS")) {
  console.error("Tauri Rust shell must expose getCapabilities/getDevices scaffold commands.");
  failed = true;
}
if (!tauriLibSource.includes("render_mix") || !tauriLibSource.includes("render_vocal") || !tauriLibSource.includes("start_input_monitor") || !tauriLibSource.includes("stop_input_monitor") || !tauriLibSource.includes("UnsupportedNativeCommandResult")) {
  console.error("Tauri Rust shell must expose required native render/monitor command stubs while keeping the native engine gated.");
  failed = true;
}
if (!tauriLibSource.includes("open_project_file") || !tauriLibSource.includes("save_project_file") || !tauriLibSource.includes("ProjectFileResult")) {
  console.error("Tauri Rust shell must expose native project open/save handoff commands.");
  failed = true;
}
if (!tauriLibSource.includes("get_latency_stats") || !tauriLibSource.includes("set_buffer_size") || !tauriLibSource.includes("PunchLabLatencyStats")) {
  console.error("Tauri Rust shell must expose native latency stats and buffer-size shell commands.");
  failed = true;
}
if (!tauriLibSource.includes("set_output_device") || !tauriLibSource.includes("OutputDeviceResult") || !tauriLibSource.includes("unsupported: true")) {
  console.error("Tauri Rust shell must expose output-device handoff while keeping real routing unsupported.");
  failed = true;
}
if (!tauriLibSource.includes("export_compressed_audio") || !tauriLibSource.includes("CompressedAudioExportResult") || !tauriLibSource.includes("normalize_compressed_format")) {
  console.error("Tauri Rust shell must expose compressed export handoff while keeping real encoding unsupported.");
  failed = true;
}
if (!tauriLibSource.includes("scan_plugin_hosts") || !tauriLibSource.includes("PluginScanResult") || !tauriLibSource.includes("plugin_host_ready: false")) {
  console.error("Tauri Rust shell must expose plugin scan handoff while keeping plugin host capability false.");
  failed = true;
}
if (!tauriLibSource.includes("round_trip_latency_ms: None") || !tauriLibSource.includes("source: \"tauri-shell\"")) {
  console.error("Tauri latency scaffold must keep actual native audio latency unset until the audio engine exists.");
  failed = true;
}
if (!tauriLibSource.includes("compressed_audio_export: false")) {
  console.error("Tauri compressed export scaffold must keep compressedAudioExport capability false until encoding exists.");
  failed = true;
}
if (!tauriLibSource.includes("plugin_host: false")) {
  console.error("Tauri plugin scan scaffold must keep pluginHost capability false until plugin hosting exists.");
  failed = true;
}
if (!tauriLibSource.includes("native_bridge_ready: false") || !tauriLibSource.includes("native_audio_engine_ready: false")) {
  console.error("Tauri Rust shell must keep native audio activation gated until render and monitoring commands exist.");
  failed = true;
}
if (!tauriLibSource.includes("audio_output_routing: false")) {
  console.error("Tauri Rust shell must keep native output routing capability false until real routing is implemented.");
  failed = true;
}
const nativeBridgeSource = readFileSync("src/native-bridge.js", "utf8");
const platformSource = readFileSync("src/platform.js", "utf8");
if (!nativeBridgeSource.includes("nativeHostAvailable: true") || !nativeBridgeSource.includes("nativeHostAvailable: false")) {
  console.error("Native bridge status must distinguish partial native host availability from full engine readiness.");
  failed = true;
}
if (!nativeBridgeSource.includes("const nativeBridgeReady = host.nativeBridgeReady !== false") || !nativeBridgeSource.includes("available: nativeBridgeReady && missingMethods.length === 0") || !tauriBridgeSource.includes("nativeBridgeReady: status.nativeBridgeReady")) {
  console.error("Native bridge must hard-gate full engine readiness on nativeBridgeReady while allowing partial native hosts.");
  failed = true;
}
if (!platformSource.includes("status?.nativeHostAvailable") || platformSource.includes("!status?.available || status.missingOptionalMethods?.includes(\"openProjectFile\")")) {
  console.error("Platform native project file handoff must allow partial native hosts.");
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
const exportMasteringSource = readFileSync("src/export-mastering.js", "utf8");
if (!exportMasteringSource.includes("window.PunchLabExportMastering") || !exportMasteringSource.includes("finalizeAudio") || !appSource.includes("PunchLabExportMastering.finalizeAudio")) {
  console.error("Export mastering must be separated from the app controller.");
  failed = true;
}
if (!exportPanelSource.includes("data-compress-export") || !appSource.includes("exportCompressedJob") || !appSource.includes("PunchLabEngine.exportCompressedAudio")) {
  console.error("Completed export jobs must expose native compressed MP3/M4A handoff when supported.");
  failed = true;
}
const exportPlanSource = readFileSync("src/export-plan.js", "utf8");
if (!indexHtml.includes("exportCompVocalButton") || !appSource.includes("exportCompVocal") || !exportPlanSource.includes("buildSingleExportGroup") || !appSource.includes('suffix: "comp-vocal"') || !appSource.includes("getCompTakes()")) {
  console.error("Export view must support rendering the selected comp lane as a dedicated vocal WAV.");
  failed = true;
}
if (!appSource.includes("getAudibleCompTakes") || !appSource.includes("const hasCompVocal = getAudibleCompTakes().length > 0") || !exportPanelSource.includes("count: getAudibleCompTakes().length")) {
  console.error("Comp vocal export counts and button state must respect audible track routing.");
  failed = true;
}
if (!exportPlanSource.includes("window.PunchLabExportPlan") || !exportPlanSource.includes("buildStemExportGroups") || !exportPlanSource.includes("buildSingleExportGroup") || !exportPlanSource.includes("buildExportWavOptions") || !exportPlanSource.includes("normalizeExportBitDepth") || !exportPlanSource.includes("formatExportRowCount") || !exportPlanSource.includes("getExportJobStatusLabel") || !exportPlanSource.includes("getClippingRisk") || !exportPlanSource.includes("getCompressedExportStatus") || !appSource.includes("PunchLabExportPlan.buildStemExportGroups") || !appSource.includes("PunchLabExportPlan.buildSingleExportGroup") || !appSource.includes("PunchLabExportPlan.buildExportWavOptions") || !appSource.includes("PunchLabExportPlan.normalizeExportBitDepth") || !exportPanelSource.includes("PunchLabExportPlan.formatExportRowCount") || !exportPanelSource.includes("PunchLabExportPlan.getExportJobStatusLabel") || !exportPanelSource.includes("PunchLabExportPlan.getClippingRisk") || !exportPanelSource.includes("PunchLabExportPlan.getCompressedExportStatus")) {
  console.error("Export filename, stem group, WAV option, compressed format, queue display, clipping-risk, and compressed-status planning must be separated from the app controller.");
  failed = true;
}
const timelineSource = readFileSync("src/timeline.js", "utf8");
if (!timelineSource.includes("window.PunchLabTimeline") || !timelineSource.includes("normalizeTimelineSnapMode") || !timelineSource.includes("makeTimelineGridLines") || !timelineSource.includes("timelinePercent") || !timelineSource.includes("normalizeTakeTrim") || !timelineSource.includes("normalizeRegionColor") || !timelineSource.includes("getRegionGroups") || !timelineSource.includes("normalizeRegionGroup") || !timelineSource.includes("getDefaultRegionGroupForTrack") || !timelineSource.includes("formatTimelineInputTime") || !timelineSource.includes("isSameTimelineNumber") || !timelineSource.includes("createTimelineSnapshot") || !timelineSource.includes("normalizeTimelineTakeSnapshot") || !appSource.includes("PunchLabTimeline.snapTimelineTime") || !appSource.includes("PunchLabTimeline.normalizeMarkers") || !appSource.includes("PunchLabTimeline.makeTimelineTicks") || !appSource.includes("PunchLabTimeline.getTakeVisibleDuration") || !appRendererSource.includes("PunchLabTimeline.getRegionGroups") || !appSource.includes("PunchLabTimeline.normalizeRegionGroup") || !appSource.includes("PunchLabTimeline.formatTimelineInputTime") || !appSource.includes("PunchLabTimeline.isSameTimelineNumber") || !appSource.includes("PunchLabTimeline.createTimelineSnapshot") || !appSource.includes("PunchLabTimeline.normalizeTimelineTakeSnapshot")) {
  console.error("Timeline snap, grid, marker, region trim, region group, and snapshot policy must live in src/timeline.js and be used by app.js.");
  failed = true;
}
const takesSource = readFileSync("src/takes.js", "utf8");
if (!takesSource.includes("window.PunchLabTakes") || !takesSource.includes("sortTakesByCreatedAt") || !takesSource.includes("sortCompTakes") || !takesSource.includes("sortBestTakesForComp") || !takesSource.includes("normalizeCompOrder") || !takesSource.includes("moveCompTakeOrder") || !takesSource.includes("sortProcessedVersions") || !takesSource.includes("getNextProcessedVersion") || !takesSource.includes("makeTakeFilename") || !takesSource.includes("getTakeTitle") || !takesSource.includes("getTakeShortName") || !takesSource.includes("formatTakeLatencyTag") || !takesSource.includes("getBatchScopeReadyText") || !takesSource.includes("getBatchScopeEmptyText") || !takesSource.includes("getBatchSourceTargets") || !takesSource.includes("getBatchTargets") || !takesSource.includes("hasProcessedTakeForChain") || !takesSource.includes("take.compOrder == null") || !appSource.includes("PunchLabTakes.sortTakesByCreatedAt") || !appSource.includes("PunchLabTakes.sortCompTakes") || !appSource.includes("PunchLabTakes.sortBestTakesForComp") || !appSource.includes("PunchLabTakes.normalizeCompOrder") || !appSource.includes("PunchLabTakes.moveCompTakeOrder") || !appSource.includes("PunchLabTakes.sortProcessedVersions") || !appSource.includes("PunchLabTakes.getNextProcessedVersion") || !appSource.includes("PunchLabTakes.makeTakeFilename") || !appSource.includes("PunchLabTakes.getTakeTitle") || !appSource.includes("PunchLabTakes.getTakeShortName") || !appSource.includes("PunchLabTakes.formatTakeLatencyTag") || !appSource.includes("PunchLabTakes.getBatchScopeReadyText") || !appSource.includes("PunchLabTakes.getBatchScopeEmptyText") || !appSource.includes("PunchLabTakes.getBatchSourceTargets") || !appSource.includes("PunchLabTakes.getBatchTargets") || !appSource.includes("PunchLabTakes.hasProcessedTakeForChain")) {
  console.error("Take sorting, comp ordering, metadata display, batch target, filename, and processed-version policy must live in src/takes.js and be used by app.js.");
  failed = true;
}
const formatSource = readFileSync("src/format.js", "utf8");
if (!formatSource.includes("window.PunchLabFormat") || !formatSource.includes("formatDuration") || !formatSource.includes("formatGainDb") || !formatSource.includes("formatLufs") || !formatSource.includes("formatRuntimeLatency") || !formatSource.includes("formatDisplaySampleRate") || !formatSource.includes("formatDisplayTimestamp") || !formatSource.includes("escapeHtml") || !appSource.includes("PunchLabFormat.formatDuration") || !appSource.includes("PunchLabFormat.formatGainDb") || !appSource.includes("PunchLabFormat.formatLufs") || !appSource.includes("PunchLabFormat.formatRuntimeLatency") || !appSource.includes("PunchLabFormat.formatDisplaySampleRate") || !appSource.includes("PunchLabFormat.formatDisplayTimestamp") || !appSource.includes("PunchLabFormat.escapeHtml")) {
  console.error("Shared display formatting must live in src/format.js and be used by app.js.");
  failed = true;
}
const presetsSource = readFileSync("src/presets.js", "utf8");
if (!presetsSource.includes("window.PunchLabPresets") || !presetsSource.includes("normalizePreset") || !presetsSource.includes("createCustomPresetSnapshot") || !presetsSource.includes("getTuneSettingsForPreset") || !presetsSource.includes("getDefaultCompThreshold") || !presetsSource.includes("getDefaultCompRatio") || !presetsSource.includes("getDefaultCompRelease") || !appSource.includes("PunchLabPresets.normalizePreset") || !appSource.includes("PunchLabPresets.createCustomPresetSnapshot") || !appSource.includes("PunchLabPresets.getTuneSettingsForPreset") || !appSource.includes("PunchLabPresets.getDefaultCompThreshold") || !appSource.includes("PunchLabPresets.getDefaultCompRatio") || !appSource.includes("PunchLabPresets.getDefaultCompRelease")) {
  console.error("Vocal preset normalization, custom preset snapshots, tune settings, and compressor defaults must live in src/presets.js and be used by app.js.");
  failed = true;
}
const tracksSource = readFileSync("src/tracks.js", "utf8");
if (!tracksSource.includes("window.PunchLabTracks") || !tracksSource.includes("getDefaultTrackName") || !tracksSource.includes("getFolderedTrackIds") || !tracksSource.includes("getTrackFolderTracks") || !tracksSource.includes("getTrackOutputVolume") || !tracksSource.includes("hasSoloTrack") || !tracksSource.includes("hasTrackFolder") || !tracksSource.includes("isTrackAudible") || !tracksSource.includes("normalizeTrackFolderCollapsed") || !appSource.includes("PunchLabTracks.getDefaultTrackName") || !appSource.includes("PunchLabTracks.getFolderedTrackIds") || !appSource.includes("PunchLabTracks.getTrackFolderTracks") || !appSource.includes("PunchLabTracks.getTrackOutputVolume") || !appSource.includes("PunchLabTracks.hasSoloTrack") || !appSource.includes("PunchLabTracks.hasTrackFolder") || !appSource.includes("PunchLabTracks.isTrackAudible") || !appSource.includes("PunchLabTracks.normalizeTrackFolderCollapsed")) {
  console.error("Track folder, default-name, solo/mute, and output-volume policy must live in src/tracks.js and be used by app.js.");
  failed = true;
}
const pitchSource = readFileSync("src/pitch.js", "utf8");
if (!pitchSource.includes("window.PunchLabPitch") || !pitchSource.includes("normalizeScaleIntervals") || !pitchSource.includes("getKeyRootClass") || !pitchSource.includes("getScaleNoteName") || !pitchSource.includes("getTargetMidiValue") || !pitchSource.includes("getPitchModeLabel") || !pitchSource.includes("applyManualPitchTargets") || !pitchSource.includes("getPitchLaneFrames") || !pitchSource.includes("getManualPitchCount") || !pitchSource.includes("getPitchFrameKey") || !pitchSource.includes("formatPitchNote") || !pitchSource.includes("getAverageCorrection") || !pitchSource.includes("clampMidi") || !appSource.includes("PunchLabPitch.normalizeScaleIntervals") || !appSource.includes("PunchLabPitch.getKeyRootClass") || !appSource.includes("PunchLabPitch.getScaleNoteName") || !appSource.includes("PunchLabPitch.getTargetMidiValue") || !appSource.includes("PunchLabPitch.getPitchModeLabel") || !appSource.includes("PunchLabPitch.applyManualPitchTargets") || !appSource.includes("PunchLabPitch.getPitchLaneFrames") || !appSource.includes("PunchLabPitch.getManualPitchCount") || !appSource.includes("PunchLabPitch.getPitchFrameKey") || !appSource.includes("PunchLabPitch.formatPitchNote") || !appSource.includes("PunchLabPitch.getAverageCorrection") || !appSource.includes("PunchLabPitch.clampMidi")) {
  console.error("Pitch scale, manual target, lane sampling, note label, and correction summary policy must live in src/pitch.js and be used by app.js.");
  failed = true;
}
if (!devicesSource.includes("window.PunchLabDevices") || !devicesSource.includes("getBestMimeType") || !devicesSource.includes("getMicConstraints") || !devicesSource.includes("listAudioDevices") || !devicesSource.includes("setMediaOutput") || !devicesSource.includes("setAudioContextOutput") || !appSource.includes("PunchLabDevices?.getBestMimeType") || !appSource.includes("PunchLabDevices.getMicConstraints") || !appSource.includes("PunchLabDevices.listAudioDevices")) {
  console.error("Device enumeration, recording MIME, mic constraints, and output routing must live in src/devices.js and be used by app.js.");
  failed = true;
}
const storageSource = readFileSync("src/storage.js", "utf8");
if (!storageSource.includes("window.PunchLabStorage") || !storageSource.includes("formatBackupHistoryLabel") || !storageSource.includes("saveBackup") || !storageSource.includes("listBackups") || !storageSource.includes("loadBackup") || !appSource.includes("PunchLabStorage.formatBackupHistoryLabel")) {
  console.error("Autosave, rolling backup, recovery list, and backup-history display policy must live in src/storage.js and be used by app.js.");
  failed = true;
}
const shortcutsSource = readFileSync("src/shortcuts.js", "utf8");
if (!shortcutsSource.includes("window.PunchLabShortcuts") || !shortcutsSource.includes("createGlobalShortcutHandler") || !shortcutsSource.includes("isTypingTarget") || !shortcutsSource.includes("getShortcutTabIndex") || !appSource.includes("PunchLabShortcuts.createGlobalShortcutHandler") || appSource.includes("function handleGlobalShortcut(")) {
  console.error("Global shortcut handler, input guards, and tab-index mapping must live in src/shortcuts.js and be installed by app.js.");
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
if (!readFileSync("src/vocal.js", "utf8").includes("gate: Number(tuneSettings.gate") || !appSource.includes("gate: preset.gate") || !projectZipSource.includes("<dt>Gate</dt>") || !projectZipSource.includes("<dt>De-ess</dt>")) {
  console.error("Gate and de-ess preset values must be preserved in render snapshots and project zip preset previews.");
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
if (!appSource.includes("presets: summarizePresetManifest") || !projectZipSource.includes("buildProjectZipPreviewPresetRows(presetManifest)") || !appSource.includes("window.PunchLabProjectZip.buildProjectZipPreviewHtml") || !zipSource.includes("manifest.json includes presets")) {
  console.error("Project zip manifest and preview must expose vocal chain preset summaries.");
  failed = true;
}
if (!appSource.includes("notes: summarizeProjectNotes") || !projectZipSource.includes("Lyrics & Notes") || !projectZipSource.includes("buildProjectZipPreviewNotesRows(notesManifest, markers)") || !appSource.includes("window.PunchLabProjectZip.buildProjectZipPreviewHtml") || !zipSource.includes("manifest.json includes notes")) {
  console.error("Project zip manifest and preview must expose scratch lyrics, marker lyrics, and session notes.");
  failed = true;
}
if (!appSource.includes("session: summarizeSessionManifest") || !projectZipSource.includes("buildProjectZipPreviewSessionRows(sessionManifest)") || !appSource.includes("window.PunchLabProjectZip.buildProjectZipPreviewHtml") || !zipSource.includes("manifest.json includes session settings")) {
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
if (!projectZipSource.includes("createProjectZipArchiveFiles") || !projectZipSource.includes("reserveProjectZipPath") || !appSource.includes("window.PunchLabProjectZip.createProjectZipArchiveFiles") || appSource.includes("function reserveZipPath")) {
  console.error("Project zip archive file map and path reservation policy must live in src/project-zip.js.");
  failed = true;
}
if (!projectZipSource.includes("finalizeProjectZipArchiveFiles") || !appSource.includes("window.PunchLabProjectZip.finalizeProjectZipArchiveFiles") || appSource.includes('files["preview.html"] =') || appSource.includes('files["manifest.json"] =') || appSource.includes('files["README.txt"] =')) {
  console.error("Project zip metadata file writing policy must live in src/project-zip.js.");
  failed = true;
}
if (!projectZipSource.includes("createProjectZipBeatAssetPath") || !projectZipSource.includes("createProjectZipTakeAssetPath") || !appSource.includes("window.PunchLabProjectZip.createProjectZipBeatAssetPath") || !appSource.includes("window.PunchLabProjectZip.createProjectZipTakeAssetPath")) {
  console.error("Project zip beat and take asset path policy must live in src/project-zip.js.");
  failed = true;
}
if (!projectZipSource.includes("createProjectZipBeatManifestEntry") || !projectZipSource.includes("createProjectZipTakeManifestEntry") || !appSource.includes("window.PunchLabProjectZip.createProjectZipBeatManifestEntry") || !appSource.includes("window.PunchLabProjectZip.createProjectZipTakeManifestEntry")) {
  console.error("Project zip beat and take manifest entry policy must live in src/project-zip.js.");
  failed = true;
}
if (!projectZipSource.includes("createProjectZipMarkerManifestEntries") || !appSource.includes("window.PunchLabProjectZip.createProjectZipMarkerManifestEntries") || appSource.includes("manifest.markers = normalizeMarkers(bundle.markers).map")) {
  console.error("Project zip marker manifest entry policy must live in src/project-zip.js.");
  failed = true;
}
if (!indexHtml.includes('id="markerCommentInput"') || !domLookupSource.includes('markerCommentInput: document.querySelector("#markerCommentInput")') || !appSource.includes('comment: els.markerCommentInput?.value.trim() || ""') || !appSource.includes('els.markerCommentInput.value = ""') || !appSource.includes("data-marker-comment") || !projectZipSource.includes('comment: String(marker.comment || "")')) {
  console.error("Timeline markers must support comments from creation through editing and project zip manifest output.");
  failed = true;
}
if (!appSource.includes("data-play-version") || !appSource.includes("data-best-version") || !appSource.includes("data-comp-version") || !appSource.includes("data-delete-version") || !appSource.includes('download="${makeTakeFilename(versionTake)}"') || !appSource.includes("selectVocalVersion") || !appSource.includes("playVocalVersion") || !appSource.includes("deleteVocalVersion") || !readFileSync("styles.css", "utf8").includes(".version-actions")) {
  console.error("Vocal render version history must support separate select, audition, and delete actions.");
  failed = true;
}
if (!appSource.includes("data-download-take") || !appSource.includes("downloadTakeWav") || !appSource.includes("buildTakeWavBlob") || !appSource.includes("makeTakeWavFilename") || !appSource.includes('accept: { "audio/wav": [".wav"] }')) {
  console.error("Recorded takes must support direct WAV save/download from latest and take cards.");
  failed = true;
}
if (!projectZipSource.includes("buildProjectZipPreviewPlaybackData") || !projectZipSource.includes("buildProjectZipPreviewPlaybackData(manifest, takes)") || !appSource.includes("window.PunchLabProjectZip.buildProjectZipPreviewHtml")) {
  console.error("Project zip preview playback data policy must live in src/project-zip.js and be used by app.js.");
  failed = true;
}
if (!projectZipSource.includes("getProjectZipPreviewStyles()") || !projectZipSource.includes("getProjectZipPreviewPlayerScript()") || !appSource.includes("window.PunchLabProjectZip.buildProjectZipPreviewHtml")) {
  console.error("Project zip preview style and player boilerplate must live in src/project-zip.js and be used by app.js.");
  failed = true;
}
if (!projectZipSource.includes("buildProjectZipPreviewBeatSection(manifest.beat)") || !projectZipSource.includes("buildProjectZipPreviewMarkerRows(markers)") || !projectZipSource.includes("buildProjectZipPreviewCompRows(compTakes)") || !appSource.includes("window.PunchLabProjectZip.buildProjectZipPreviewHtml")) {
  console.error("Project zip preview beat, marker, and comp rows must live in src/project-zip.js and be used by app.js.");
  failed = true;
}
if (!projectZipSource.includes("take.bestTake ? \"Best\"") || !projectZipSource.includes("formatProjectZipPreviewRenderVersion(take)") || !projectZipSource.includes("formatProjectZipPreviewPreset(take)") || !projectZipSource.includes("formatProjectZipPreviewTune(take)")) {
  console.error("Project zip comp lane preview must show best, version, preset, and tune context.");
  failed = true;
}
if (!projectZipSource.includes("Automation Schema") || !projectZipSource.includes("buildProjectZipPreviewAutomationSchemaRows(automationManifest)") || !appSource.includes("window.PunchLabProjectZip.buildProjectZipPreviewHtml")) {
  console.error("Project zip preview must display the vocal chain automation parameter schema.");
  failed = true;
}
if (!projectZipSource.includes("formatProjectZipAutomationParameterValue") || !projectZipSource.includes("formatProjectZipAutomationStateSummary(take.automationState, automationManifest)") || !projectZipSource.includes("buildProjectZipPreviewTakeRows(takes, automationManifest)") || !appSource.includes("window.PunchLabProjectZip.buildProjectZipPreviewHtml")) {
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
if (!projectZipSource.includes("formatProjectZipPreviewNativeAudio(nativeAudio)") || !appSource.includes("window.PunchLabProjectZip.buildProjectZipPreviewHtml")) {
  console.error("Project zip preview must display the native audio environment summary.");
  failed = true;
}
if (!projectZipSource.includes("formatProjectZipPreviewDesktopReadiness(desktopReadiness)") || !projectZipSource.includes("manifest.desktopReadiness || {}") || !appSource.includes("window.PunchLabProjectZip.buildProjectZipPreviewHtml")) {
  console.error("Project zip preview must display the desktop readiness snapshot.");
  failed = true;
}
if (!readFileSync("src/project.js", "utf8").includes("exportHistory: sanitizeExportHistory(state.exportQueue)") || !projectZipSource.includes("manifest.json includes exportHistory") || !projectZipSource.includes("buildProjectZipPreviewExportHistoryRows")) {
  console.error("Project bundles and zip previews must preserve sanitized export queue history.");
  failed = true;
}
if (!projectZipSource.includes("formatProjectZipPreviewPluginHostScan(pluginHost)") || !projectZipSource.includes("manifest.pluginHost || {}") || !appSource.includes("window.PunchLabProjectZip.buildProjectZipPreviewHtml")) {
  console.error("Project zip preview must display plugin host scan summary.");
  failed = true;
}
if (!projectZipSource.includes("Plugin Host") || !projectZipSource.includes("buildProjectZipPreviewPluginHostRows(pluginHost)") || !appSource.includes("window.PunchLabProjectZip.buildProjectZipPreviewHtml")) {
  console.error("Project zip preview must include a plugin host detail section.");
  failed = true;
}
if (!projectZipSource.includes("pluginHost.hostReady") || !appSource.includes("pluginHostReady: Boolean(result?.pluginHostReady)") || !appSource.includes("capabilityReady: Boolean(window.PunchLabDesktop?.getReadiness?.()?.pluginHost?.capabilityReady)")) {
  console.error("Plugin scan summaries must preserve method, capability, and host readiness separately.");
  failed = true;
}
if (!appSource.includes("formatPluginScanStatusTitle") || !appSource.includes("scannedAt: result?.scannedAt || new Date().toISOString()")) {
  console.error("Topbar plugin scan status must expose scan freshness.");
  failed = true;
}
if (!projectZipSource.includes("Desktop Handoff") || !projectZipSource.includes("buildProjectZipPreviewHandoffRows(desktopReadiness)") || !appSource.includes("window.PunchLabProjectZip.buildProjectZipPreviewHtml")) {
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
if (!readFileSync("src/desktop.js", "utf8").includes("methodAvailable: hasLatencyMethods") || !readFileSync("src/desktop.js", "utf8").includes("statsAvailable: latencyStatsAvailable") || !readFileSync("src/desktop.js", "utf8").includes("hasMeasuredLatencyStats")) {
  console.error("Desktop readiness must separate latency method availability from measured latency stats.");
  failed = true;
}
if (!readFileSync("src/desktop.js", "utf8").includes("getNativeBridgeDetail") || !readFileSync("src/desktop.js", "utf8").includes("full audio engine waits for nativeBridgeReady")) {
  console.error("Desktop readiness must explain nativeBridgeReady pending state separately from missing native methods.");
  failed = true;
}
if (!readFileSync("src/desktop.js", "utf8").includes("methodAvailable: hasOutputRoutingMethod") || !readFileSync("src/desktop.js", "utf8").includes("capabilityReady: capabilities.audioOutputRouting === true") || !readFileSync("src/engine-contract.js", "utf8").includes("\"audioOutputRouting\"")) {
  console.error("Desktop readiness must separate output-routing method availability from audioOutputRouting capability.");
  failed = true;
}
if (!appSource.includes("void applyCurrentPlaybackOutput();")) {
  console.error("Project load must reapply saved playback output routing after settings restore.");
  failed = true;
}
if (!readFileSync("src/desktop.js", "utf8").includes("methodAvailable: hasProjectFileHandoff") || !readFileSync("src/desktop.js", "utf8").includes("browserProjectFileAccess") || !appSource.includes("projectFiles: readiness.projectFiles") || !projectZipSource.includes("buildProjectZipPreviewProjectFileRows(desktopReadiness.projectFiles || {})") || !projectZipSource.includes("Native project files")) {
  console.error("Desktop readiness and zip previews must preserve project file handoff readiness.");
  failed = true;
}
if (!readFileSync("src-tauri/src/lib.rs", "utf8").includes("project_file_dialog_filter") || !readFileSync("src-tauri/src/lib.rs", "utf8").includes("\"PunchLab Archive\"") || !readFileSync("src-tauri/src/lib.rs", "utf8").includes("\"punchlab.zip\"") || !readFileSync("src-tauri/src/lib.rs", "utf8").includes("\"WAV Audio\"")) {
  console.error("Tauri project file handoff must select the correct project/archive dialog filters.");
  failed = true;
}
if (!readFileSync("src/desktop.js", "utf8").includes("const compressedExportReady = hasCompressedExportMethod && capabilities.compressedAudioExport === true") || !readFileSync("src/desktop.js", "utf8").includes("ready: compressedExportReady")) {
  console.error("Desktop readiness must separate compressed export method availability from compressedAudioExport capability.");
  failed = true;
}
if (!appSource.includes("compressedExport: readiness.compressedExport") || !projectZipSource.includes("Compressed export ready") || !projectZipSource.includes("Compressed handoff pending")) {
  console.error("Project and zip desktop readiness snapshots must preserve compressed export handoff readiness.");
  failed = true;
}
if (!readFileSync("src/desktop.js", "utf8").includes("const pluginHostReady = hasPluginScan && capabilities.pluginHost === true") || !readFileSync("src/desktop.js", "utf8").includes("methodAvailable: hasPluginScan") || !readFileSync("src/desktop.js", "utf8").includes("ready: pluginHostReady")) {
  console.error("Desktop readiness must separate plugin scan method availability from pluginHost capability readiness.");
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
const desktopSource = readFileSync("src/desktop.js", "utf8");
if (!desktopSource.includes("normalizeNativeBufferSize") || !desktopSource.includes("NATIVE_AUDIO_ENGINE_CONTRACT.bufferSizes") || !appSource.includes("PunchLabDesktop.normalizeNativeBufferSize")) {
  console.error("Native buffer-size normalization must be exported from src/desktop.js and used by app.js.");
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
if (!readFileSync("src/engine.js", "utf8").includes("startInputMonitor") || !appSource.includes("activateInputMonitorRoute") || !appSource.includes("state.monitorMode === \"native\"")) {
  console.error("Input monitoring must hand off to native monitoring when the active engine supports it.");
  failed = true;
}
if (!readFileSync("src/desktop.js", "utf8").includes("const nativeMonitorReady = hasMonitorMethods && capabilities.realtimeNativeMonitoring === true") || !appSource.includes("inputMonitoring: readiness.inputMonitoring") || !projectZipSource.includes("Native monitor ready")) {
  console.error("Desktop readiness must separate native monitor method availability from realtime monitoring capability.");
  failed = true;
}
if (!appSource.includes("readiness.wrapper?.handoffStages || readiness.handoffStages || []")) {
  console.error("Desktop readiness environment snapshots must preserve wrapper handoff stages.");
  failed = true;
}

if (failed) {
  process.exit(1);
}

console.log(`PunchLab check passed: ${syntaxFiles.length} files and ${requiredScripts.length} script references.`);
