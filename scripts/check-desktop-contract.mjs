import { existsSync, readFileSync } from "node:fs";

const wrapper = readJson("desktop-wrapper-manifest.json");
const host = readJson("desktop-host-manifest.json");
const plugin = readJson("plugin-host-manifest.json");
const packageManifest = readJson("desktop-package-manifest.json");
const tauriConfig = readJson("src-tauri/tauri.conf.json");
const mainCapability = readJson("src-tauri/capabilities/main.json");
const indexHtml = readFileSync("index.html", "utf8");
const desktopSource = readFileSync("src/desktop.js", "utf8");
const tauriBridgeSource = readFileSync("src/tauri-bridge.js", "utf8");
const tauriCargo = readFileSync("src-tauri/Cargo.toml", "utf8");
const tauriBuildScript = readFileSync("src-tauri/build.rs", "utf8");
const tauriMainSource = readFileSync("src-tauri/src/main.rs", "utf8");
const tauriLibSource = readFileSync("src-tauri/src/lib.rs", "utf8");
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

function requireNumber(value, label) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    fail(`${label} must be a finite number.`);
  }
}

requireString(wrapper.appId, "wrapper.appId");
requireString(wrapper.appName, "wrapper.appName");
requireString(wrapper.shell?.entry, "wrapper.shell.entry");
requireString(wrapper.shell?.windowTitle, "wrapper.shell.windowTitle");
requireString(wrapper.shell?.tauriConfig, "wrapper.shell.tauriConfig");
requireString(wrapper.shell?.cargoManifest, "wrapper.shell.cargoManifest");
requireString(wrapper.shell?.rustEntry, "wrapper.shell.rustEntry");
requireString(wrapper.shell?.rustLibrary, "wrapper.shell.rustLibrary");

const requiredMeta = {
  "punchlab-desktop-manifest": "./desktop-host-manifest.json",
  "punchlab-wrapper-manifest": "./desktop-wrapper-manifest.json",
  "punchlab-plugin-host-manifest": "./plugin-host-manifest.json",
  "punchlab-desktop-package-manifest": "./desktop-package-manifest.json",
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
if (wrapper.permissions?.audioOutputRouting !== true) {
  fail("Desktop wrapper must request audio output routing permission.");
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
if (wrapper.tauriBridge?.adapter !== packageManifest.tauriBridge?.adapter) {
  fail("Wrapper and package Tauri bridge adapter paths must match.");
}
if (wrapper.tauriBridge?.statusCommand !== "get_punchlab_bridge_status" || packageManifest.tauriBridge?.statusCommand !== wrapper.tauriBridge?.statusCommand) {
  fail("Wrapper and package Tauri bridge status command must be get_punchlab_bridge_status.");
}
if (wrapper.tauriBridge?.activatesNativeBridgeWhen !== "nativeBridgeReady") {
  fail("Tauri bridge must only activate the native bridge when nativeBridgeReady is true.");
}
if (wrapper.tauriBridge?.nativeBridgeReady !== false || packageManifest.tauriBridge?.nativeBridgeReady !== false) {
  fail("Tauri bridge manifests must keep nativeBridgeReady false until render and monitoring commands exist.");
}
for (const method of ["getCapabilities", "getDevices", "getLatencyStats", "setOutputDevice", "setBufferSize", "openProjectFile", "saveProjectFile", "exportCompressedAudio", "scanPluginHosts"]) {
  if (!wrapper.tauriBridge?.implementedMethods?.includes(method) || !packageManifest.tauriBridge?.implementedMethods?.includes(method)) {
    fail(`Tauri bridge manifests must list implemented method ${method}.`);
  }
}
if (host.packageManifest !== "desktop-package-manifest.json" || wrapper.packageManifest !== host.packageManifest) {
  fail("Desktop host and wrapper manifests must reference desktop-package-manifest.json.");
}

requireString(packageManifest.appId, "packageManifest.appId");
requireString(packageManifest.appName, "packageManifest.appName");
requireString(packageManifest.preferredWrapper?.framework, "packageManifest.preferredWrapper.framework");
requireString(packageManifest.entry?.webEntry, "packageManifest.entry.webEntry");
requireString(packageManifest.entry?.devServer, "packageManifest.entry.devServer");
if (packageManifest.appId !== wrapper.appId || packageManifest.appId !== host.appId) {
  fail("Desktop package appId must match host and wrapper manifests.");
}
if (packageManifest.appName !== wrapper.appName || packageManifest.appName !== host.appName) {
  fail("Desktop package appName must match host and wrapper manifests.");
}
if (packageManifest.entry?.webEntry !== wrapper.shell?.entry) {
  fail("Desktop package web entry must match wrapper shell entry.");
}
if (packageManifest.entry?.devServer !== wrapper.shell?.devServer) {
  fail("Desktop package dev server must match wrapper shell devServer.");
}
if (packageManifest.entry?.tauriConfig !== wrapper.shell?.tauriConfig) {
  fail("Desktop package Tauri config path must match wrapper shell tauriConfig.");
}
if (packageManifest.entry?.cargoManifest !== wrapper.shell?.cargoManifest) {
  fail("Desktop package Cargo manifest path must match wrapper shell cargoManifest.");
}
if (packageManifest.entry?.rustEntry !== wrapper.shell?.rustEntry) {
  fail("Desktop package Rust entry path must match wrapper shell rustEntry.");
}
if (packageManifest.entry?.rustLibrary !== wrapper.shell?.rustLibrary) {
  fail("Desktop package Rust library path must match wrapper shell rustLibrary.");
}
if (packageManifest.preferredWrapper?.framework !== "Tauri") {
  fail("Desktop package manifest must keep Tauri as the preferred wrapper.");
}

const packageArtifacts = packageManifest.requiredArtifacts || [];
for (const artifact of packageArtifacts) {
  if (!existsSync(artifact)) {
    fail(`Desktop package required artifact is missing: ${artifact}`);
  }
}
for (const artifact of ["desktop-package-manifest.json", "desktop-host-manifest.json", "desktop-wrapper-manifest.json", "plugin-host-manifest.json", "src/native-bridge.js", "src/tauri-bridge.js", "src/desktop.js"]) {
  if (!packageArtifacts.includes(artifact)) {
    fail(`Desktop package manifest must list required artifact: ${artifact}`);
  }
}
if (!packageArtifacts.includes(wrapper.shell?.tauriConfig)) {
  fail("Desktop package manifest must list the Tauri shell config artifact.");
}
for (const artifact of [wrapper.shell?.cargoManifest, wrapper.shell?.rustEntry, wrapper.shell?.rustLibrary, "src-tauri/build.rs"]) {
  if (!packageArtifacts.includes(artifact)) {
    fail(`Desktop package manifest must list the Tauri Rust artifact: ${artifact}`);
  }
}
if (!packageArtifacts.includes("src-tauri/capabilities/main.json")) {
  fail("Desktop package manifest must list the Tauri main capability artifact.");
}

const packageStageIds = new Set((packageManifest.packagingStages || []).map((stage) => stage.id));
for (const stageId of ["wrapper-scaffold", "file-association", "native-audio-bridge", "plugin-host-bridge"]) {
  if (!packageStageIds.has(stageId)) {
    fail(`Desktop package stage missing: ${stageId}`);
  }
}
const packageStages = packageManifest.packagingStages || [];
const fileAssociationStage = packageStages.find((stage) => stage.id === "file-association");
if (fileAssociationStage?.status !== "scaffolded") {
  fail("Desktop package file-association stage must be scaffolded.");
}

const noRewriteBoundary = packageManifest.nativeMigrationGate?.noRewriteBoundary || [];
for (const boundary of ["src/engine-contract.js", "src/chain-params.js", "src/project.js", "src/native-adapter.js"]) {
  if (!noRewriteBoundary.includes(boundary)) {
    fail(`Desktop package no-rewrite boundary missing: ${boundary}`);
  }
}
const verificationCommands = packageManifest.verificationCommands || [];
for (const command of ["node scripts/check.mjs", "node scripts/check-desktop-contract.mjs"]) {
  if (!verificationCommands.includes(command)) {
    fail(`Desktop package verification command missing: ${command}`);
  }
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

const wrapperOptionalMethods = wrapper.nativeBridge?.optionalMethods || [];
const hostOptionalMethods = host.optionalNativeMethods || [];
if (wrapper.permissions?.audioOutputRouting === true && !wrapperOptionalMethods.includes("setOutputDevice")) {
  fail("Desktop wrapper audioOutputRouting permission requires setOutputDevice optional native method.");
}
if (hostOptionalMethods.includes("setOutputDevice") && wrapper.permissions?.audioOutputRouting !== true) {
  fail("Desktop host setOutputDevice contract requires wrapper audioOutputRouting permission.");
}
if (!host.optionalEngineCapabilities?.includes("audioOutputRouting")) {
  fail("Desktop host must expose audioOutputRouting as an optional engine capability.");
}

const nativeAudioEngine = host.nativeAudioEngine || {};
const sampleRates = nativeAudioEngine.sampleRates || [];
const bufferSizes = nativeAudioEngine.bufferSizes || [];
requireNumber(nativeAudioEngine.preferredBufferSize, "host.nativeAudioEngine.preferredBufferSize");
requireNumber(nativeAudioEngine.maxRoundTripLatencyMs, "host.nativeAudioEngine.maxRoundTripLatencyMs");
requireBoolean(nativeAudioEngine.requiresExclusiveAudioThread, "host.nativeAudioEngine.requiresExclusiveAudioThread");
if (!sampleRates.includes(44100) || !sampleRates.includes(48000)) {
  fail("Native audio engine contract must support 44.1kHz and 48kHz sample rates.");
}
for (const size of [64, 128, 256]) {
  if (!bufferSizes.includes(size)) {
    fail(`Native audio engine contract must include low-latency buffer size ${size}.`);
  }
}
if (!bufferSizes.includes(nativeAudioEngine.preferredBufferSize)) {
  fail("Native audio engine preferred buffer size must be listed in supported buffer sizes.");
}
if (nativeAudioEngine.maxRoundTripLatencyMs > 10) {
  fail("Native audio engine max round-trip latency must be 10ms or lower.");
}
if (nativeAudioEngine.requiresExclusiveAudioThread !== true) {
  fail("Native audio engine must require an exclusive audio thread.");
}
if (!desktopSource.includes("nativeAudioEngine") || !desktopSource.includes("getNativeAudioContractStatus")) {
  fail("Desktop readiness must expose native audio engine performance contract status.");
}
if (!desktopSource.includes("methodAvailable: hasLatencyMethods") || !desktopSource.includes("statsAvailable: latencyStatsAvailable") || !desktopSource.includes("hasMeasuredLatencyStats")) {
  fail("Desktop readiness must separate latency method availability from measured latency stats.");
}
if (!desktopSource.includes("methodAvailable: hasOutputRoutingMethod") || !desktopSource.includes("capabilityReady: capabilities.audioOutputRouting === true") || !desktopSource.includes("nativeOutputRoutingReady")) {
  fail("Desktop readiness must separate output-routing method availability from audioOutputRouting capability.");
}
if (!desktopSource.includes("const compressedExportReady = hasCompressedExportMethod && capabilities.compressedAudioExport === true") || !desktopSource.includes("ready: compressedExportReady")) {
  fail("Desktop readiness must separate compressed export method availability from compressedAudioExport capability.");
}
if (!desktopSource.includes("packageManifestPath")) {
  fail("Desktop runtime manifest must expose the desktop package manifest path.");
}
if (!desktopSource.includes("tauriConfig")) {
  fail("Desktop runtime manifest must expose the Tauri config path.");
}
if (!desktopSource.includes("cargoManifest") || !desktopSource.includes("rustEntry") || !desktopSource.includes("rustLibrary")) {
  fail("Desktop runtime manifest must expose Tauri Rust scaffold paths.");
}
if (!desktopSource.includes("FILE_ASSOCIATIONS") || !desktopSource.includes(".punchlab.json") || !desktopSource.includes(".punchlab.zip")) {
  fail("Desktop runtime manifest must expose PunchLab file associations.");
}
if (!desktopSource.includes("TAURI_CAPABILITIES") || !desktopSource.includes("src-tauri/capabilities/main.json")) {
  fail("Desktop runtime manifest must expose Tauri capability paths.");
}
if (!desktopSource.includes("tauriBridge: window.PunchLabTauriBridge?.getStatus?.()")) {
  fail("Desktop readiness must expose the Tauri bridge probe status.");
}
if (!tauriBridgeSource.includes("window.__TAURI__?.core?.invoke") || !tauriBridgeSource.includes("get_punchlab_bridge_status")) {
  fail("Tauri bridge adapter must use the global Tauri core invoke status command.");
}
for (const requiredSnippet of ["nativeBridgeReady", "implementedMethods", "missingRequiredMethods", "window.__PUNCHLAB_NATIVE__", "punchlab:tauri-native-ready"]) {
  if (!tauriBridgeSource.includes(requiredSnippet)) {
    fail(`Tauri bridge adapter missing ${requiredSnippet}.`);
  }
}
if (!tauriBridgeSource.includes("payload === null ? invoke(command) : invoke(command, { payload })")) {
  fail("Tauri bridge adapter must omit payload args for no-argument commands.");
}
if (!tauriBridgeSource.includes("!status.implementedMethods.length") || tauriBridgeSource.includes("!status.nativeBridgeReady || window.__PUNCHLAB_NATIVE__")) {
  fail("Tauri bridge adapter must install partial native hosts without enabling the native engine.");
}
if (!tauriBridgeSource.includes("nativeBridgeReady: status.nativeBridgeReady")) {
  fail("Tauri partial native host must expose nativeBridgeReady to the shared native bridge.");
}
if (!readFileSync("src/native-bridge.js", "utf8").includes("available: nativeBridgeReady && missingMethods.length === 0")) {
  fail("Shared native bridge must keep full engine unavailable until nativeBridgeReady is true.");
}

if (tauriConfig.$schema !== "https://schema.tauri.app/config/2") {
  fail("Tauri config must use the Tauri v2 schema.");
}
if (tauriConfig.identifier !== wrapper.appId || tauriConfig.identifier !== packageManifest.appId) {
  fail("Tauri config identifier must match PunchLab desktop appId.");
}
if (tauriConfig.productName !== wrapper.appName || tauriConfig.productName !== packageManifest.appName) {
  fail("Tauri config productName must match PunchLab desktop appName.");
}
if (tauriConfig.build?.devUrl !== wrapper.shell?.devServer) {
  fail("Tauri config devUrl must match the desktop wrapper dev server.");
}
if (tauriConfig.build?.frontendDist !== "../") {
  fail("Tauri config frontendDist must point to the static PunchLab shell.");
}
if (tauriConfig.app?.withGlobalTauri !== true) {
  fail("Tauri config must enable app.withGlobalTauri for the vanilla JS bridge adapter.");
}
if (wrapper.shell?.cargoManifest !== "src-tauri/Cargo.toml") {
  fail("Desktop wrapper shell must point to src-tauri/Cargo.toml.");
}
if (wrapper.shell?.rustEntry !== "src-tauri/src/main.rs" || wrapper.shell?.rustLibrary !== "src-tauri/src/lib.rs") {
  fail("Desktop wrapper shell must point to Tauri Rust main/lib entry files.");
}
if (!tauriCargo.includes('name = "punchlab"') || !tauriCargo.includes('name = "punchlab_lib"')) {
  fail("Tauri Cargo manifest must define punchlab package and punchlab_lib library.");
}
for (const requiredSnippet of [
  'base64 = "0.22"',
  'crate-type = ["staticlib", "cdylib", "rlib"]',
  'serde = { version = "1", features = ["derive"] }',
  'tauri-build = { version = "2"',
  'tauri = { version = "2"',
  'tauri-plugin-dialog = "2"',
  'tauri-plugin-fs = "2"',
]) {
  if (!tauriCargo.includes(requiredSnippet)) {
    fail(`Tauri Cargo manifest missing ${requiredSnippet}.`);
  }
}
if (!tauriBuildScript.includes("tauri_build::build()")) {
  fail("Tauri build.rs must invoke tauri_build::build().");
}
if (!tauriMainSource.includes("windows_subsystem = \"windows\"") || !tauriMainSource.includes("punchlab_lib::run()")) {
  fail("Tauri main.rs must hide the Windows console in release and call punchlab_lib::run().");
}
for (const requiredSnippet of [
  "#[tauri::command]",
  "get_punchlab_bridge_status",
  "get_capabilities",
  "get_devices",
  "get_latency_stats",
  "set_output_device",
  "set_buffer_size",
  "export_compressed_audio",
  "scan_plugin_hosts",
  "open_project_file",
  "save_project_file",
  "PunchLabBridgeStatus",
  "PunchLabCapabilities",
  "PunchLabDevices",
  "OutputDeviceResult",
  "CompressedAudioExportResult",
  "PluginScanResult",
  "NativeAudioState",
  "PunchLabLatencyStats",
  "SetBufferSizePayload",
  "ProjectFileResult",
  "OpenProjectFilePayload",
  "SaveProjectFilePayload",
  "native_bridge_ready: false",
  "IMPLEMENTED_NATIVE_METHODS",
  "getLatencyStats",
  "setOutputDevice",
  "setBufferSize",
  "openProjectFile",
  "saveProjectFile",
  "exportCompressedAudio",
  "scanPluginHosts",
  "implemented_methods: IMPLEMENTED_NATIVE_METHODS.to_vec()",
  "native_audio_engine_ready: false",
  "realtime_native_monitoring: false",
  "round_trip_latency_ms: None",
  "source: \"tauri-shell\"",
  "make_latency_stats",
  "unsupported: true",
  "state.set_output_device_id",
  "state.set_buffer_size(buffer_size)",
  "normalize_compressed_format",
  "compressed_audio_export: false",
  "plugin_host_ready: false",
  "plugin_host: false",
  "default_plugin_scan_formats",
  "SUPPORTED_BUFFER_SIZES",
  "audio_input: Vec::new()",
  "audio_output: Vec::new()",
  "blocking_pick_file()",
  "blocking_save_file()",
  "fs::read(&path)",
  "fs::write(&path, &bytes)",
  "decode_data_payload",
  "encode_data_url",
  "PLANNED_NATIVE_METHODS",
  "get_capabilities,",
  "get_devices",
  "get_latency_stats,",
  "set_output_device,",
  "set_buffer_size,",
  "export_compressed_audio,",
  "scan_plugin_hosts,",
  "open_project_file,",
  "save_project_file",
  ".manage(NativeAudioState::default())",
  "tauri::Builder::default()",
  "tauri_plugin_dialog::init()",
  "tauri_plugin_fs::init()",
  "tauri::generate_context!()",
  "pub fn run()",
]) {
  if (!tauriLibSource.includes(requiredSnippet)) {
    fail(`Tauri lib.rs missing ${requiredSnippet}.`);
  }
}
const selectedCapabilities = tauriConfig.app?.security?.capabilities || [];
if (!Array.isArray(selectedCapabilities) || !selectedCapabilities.includes("main")) {
  fail("Tauri config security.capabilities must include the main capability.");
}
const mainWindow = (tauriConfig.app?.windows || []).find((windowConfig) => windowConfig.label === "main");
if (!mainWindow) {
  fail("Tauri config must define a main window.");
} else {
  if (mainWindow.title !== wrapper.shell?.windowTitle) {
    fail("Tauri main window title must match wrapper shell windowTitle.");
  }
  if (Number(mainWindow.minWidth || 0) !== Number(wrapper.shell?.minWidth || 0)) {
    fail("Tauri main window minWidth must match wrapper shell minWidth.");
  }
  if (Number(mainWindow.minHeight || 0) !== Number(wrapper.shell?.minHeight || 0)) {
    fail("Tauri main window minHeight must match wrapper shell minHeight.");
  }
}
const expectedTauriCapability = {
  id: "main",
  path: "src-tauri/capabilities/main.json",
  windows: ["main"],
  permissions: ["core:default", "dialog:default", "fs:default"],
};
if (mainCapability.identifier !== expectedTauriCapability.id) {
  fail("Tauri main capability identifier must be main.");
}
if (!Array.isArray(mainCapability.windows) || !expectedTauriCapability.windows.every((windowName) => mainCapability.windows.includes(windowName))) {
  fail("Tauri main capability must target the main window.");
}
if (!Array.isArray(mainCapability.permissions) || !expectedTauriCapability.permissions.every((permission) => mainCapability.permissions.includes(permission))) {
  fail("Tauri main capability must include core, dialog, and fs default permissions.");
}
if (mainCapability.remote) {
  fail("PunchLab main capability must remain local-only.");
}
const wrapperTauriCapability = (wrapper.tauriCapabilities || []).find((capability) => capability.id === expectedTauriCapability.id);
const packageTauriCapability = (packageManifest.tauriCapabilities || []).find((capability) => capability.id === expectedTauriCapability.id);
for (const [label, capability] of [
  ["wrapper", wrapperTauriCapability],
  ["package", packageTauriCapability],
]) {
  if (!capability) {
    fail(`Desktop ${label} manifest missing main Tauri capability.`);
    continue;
  }
  if (capability.path !== expectedTauriCapability.path) {
    fail(`Desktop ${label} main Tauri capability path mismatch.`);
  }
  if (!expectedTauriCapability.windows.every((windowName) => capability.windows?.includes(windowName))) {
    fail(`Desktop ${label} main Tauri capability must target the main window.`);
  }
  if (!expectedTauriCapability.permissions.every((permission) => capability.permissions?.includes(permission))) {
    fail(`Desktop ${label} main Tauri capability permissions mismatch.`);
  }
}
const tauriResources = tauriConfig.bundle?.resources || [];
for (const resource of ["../desktop-host-manifest.json", "../desktop-wrapper-manifest.json", "../desktop-package-manifest.json", "../plugin-host-manifest.json"]) {
  if (!tauriResources.includes(resource)) {
    fail(`Tauri bundle resources must include ${resource}.`);
  }
}
const expectedFileAssociations = [
  {
    id: "project",
    extension: ".punchlab.json",
    tauriExt: "punchlab.json",
    mimeType: "application/vnd.punchlab.project+json",
    exportedType: "ai.isuu2008.punchrap.project",
  },
  {
    id: "archive",
    extension: ".punchlab.zip",
    tauriExt: "punchlab.zip",
    mimeType: "application/vnd.punchlab.archive+zip",
    exportedType: "ai.isuu2008.punchrap.archive",
  },
];
const tauriFileAssociations = tauriConfig.bundle?.fileAssociations || [];
const packageFileAssociations = packageManifest.fileAssociations || [];
const wrapperFileAssociations = wrapper.fileAssociations || [];
for (const expected of expectedFileAssociations) {
  const tauriAssociation = tauriFileAssociations.find((association) => association.ext?.includes(expected.tauriExt));
  if (!tauriAssociation) {
    fail(`Tauri file association missing ${expected.tauriExt}.`);
    continue;
  }
  if (tauriAssociation.mimeType !== expected.mimeType) {
    fail(`Tauri file association ${expected.tauriExt} must use ${expected.mimeType}.`);
  }
  if (tauriAssociation.role !== "Editor" || tauriAssociation.rank !== "Owner") {
    fail(`Tauri file association ${expected.tauriExt} must be registered as owning editor.`);
  }
  if (tauriAssociation.exportedType?.identifier !== expected.exportedType) {
    fail(`Tauri file association ${expected.tauriExt} must export ${expected.exportedType}.`);
  }
  const packageAssociation = packageFileAssociations.find((association) => association.id === expected.id);
  const wrapperAssociation = wrapperFileAssociations.find((association) => association.id === expected.id);
  if (packageAssociation?.extension !== expected.extension || packageAssociation?.mimeType !== expected.mimeType) {
    fail(`Desktop package file association mismatch for ${expected.id}.`);
  }
  if (wrapperAssociation?.extension !== expected.extension || wrapperAssociation?.mimeType !== expected.mimeType) {
    fail(`Desktop wrapper file association mismatch for ${expected.id}.`);
  }
}

if (failed) {
  process.exit(1);
}

console.log(`PunchLab desktop contract check passed: ${requiredStages.length} handoff stages.`);
