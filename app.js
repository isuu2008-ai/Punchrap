const DEFAULT_CUSTOM_SCALE_INTERVALS = [0, 2, 3, 5, 7, 8, 10];

const state = {
  audioContext: null,
  stream: null,
  processedStream: null,
  analyser: null,
  gainNode: null,
  monitorGain: null,
  monitorConnected: false,
  monitorMode: null,
  nativeMonitorActive: false,
  recorderDestination: null,
  mediaRecorder: null,
  chunks: [],
  isRecording: false,
  recordStart: 0,
  recordStartPosition: 0,
  recordLatencyMs: 0,
  timerFrame: 0,
  waveFrame: 0,
  recordWaveform: [],
  latestTake: null,
  activeView: "record",
  armedTrackId: "main",
  trackFolderCollapsed: {
    lead: false,
    adlibs: false,
    hook: false,
  },
  selectedPresetId: "trap-hard",
  selectedVocalTakeId: null,
  isAnalyzingVocal: false,
  isBatchRendering: false,
  beatUrl: "",
  beatArrayBuffer: null,
  beatFileName: "",
  mimeType: "",
  inputGain: 2,
  audioInputDeviceId: "",
  audioOutputDeviceId: "",
  nativeBufferSize: 128,
  monitorEnabled: false,
  isExportingMix: false,
  isExportingAssets: false,
  isExportQueueRunning: false,
  exportQueue: [],
  exportJobSeq: 1,
  exportPreviewAudio: null,
  lastExportNormalizeGain: 1,
  lastExportLoudnessGain: 1,
  isAnalyzingLoudness: false,
  loudnessReport: null,
  isRenderingVocal: false,
  autosaveTimer: 0,
  isAutosaving: false,
  lastBackupAt: 0,
  hasAutosave: false,
  backupHistory: [],
  currentTakeAudio: null,
  currentTakeId: null,
  currentTakeResolve: null,
  pluginScanResult: null,
  loadedProjectEnvironment: null,
  isPluginScanning: false,
  isRefreshingNativeStats: false,
  isQueuePlaying: false,
  queueMode: "all",
  queueTakeIds: [],
  queueIndex: -1,
  isSessionPlaying: false,
  sessionOrigin: 0,
  sessionStartedAt: 0,
  sessionEndTimer: 0,
  sessionTimers: [],
  sessionPlayers: [],
  sessionPlayingTakeIds: new Set(),
  punchEnabled: false,
  loopEnabled: false,
  metronomeEnabled: false,
  metronomeTimer: 0,
  metronomeBeat: 0,
  isCountInActive: false,
  countInToken: 0,
  punchIn: 0,
  punchOut: 4,
  punchTimers: [],
  isPunchWaiting: false,
  isPunchRecording: false,
  isLoopRecording: false,
  currentLoopCycle: false,
  loopRecordTakeCount: 0,
  markers: [
    { id: "marker-intro", type: "Intro", time: 0 },
    { id: "marker-verse", type: "Verse", time: 16 },
    { id: "marker-hook", type: "Hook", time: 48 },
  ],
  customScaleIntervals: [...DEFAULT_CUSTOM_SCALE_INTERVALS],
  timelineUndoStack: [],
  timelineRedoStack: [],
};

const tracks = [
  { id: "main", name: "Main", color: "#c8ff4d", volume: 0.9, pan: 0, muted: false, solo: false, takes: [] },
  { id: "double", name: "Double", color: "#41e6d0", volume: 0.72, pan: 0, muted: false, solo: false, takes: [] },
  { id: "adlib-l", name: "Adlib L", color: "#ffb74a", volume: 0.68, pan: -0.45, muted: false, solo: false, takes: [] },
  { id: "adlib-r", name: "Adlib R", color: "#7db2ff", volume: 0.68, pan: 0.45, muted: false, solo: false, takes: [] },
  { id: "hook", name: "Hook", color: "#ff4f64", volume: 0.82, pan: 0, muted: false, solo: false, takes: [] },
];

const TRACK_FOLDERS = [
  { id: "lead", name: "Lead stack", trackIds: ["main", "double"], color: "#c8ff4d" },
  { id: "adlibs", name: "Adlib stack", trackIds: ["adlib-l", "adlib-r"], color: "#ffb74a" },
  { id: "hook", name: "Hook stack", trackIds: ["hook"], color: "#ff4f64" },
];

const REGION_GROUPS = [
  { id: "verse", label: "Verse" },
  { id: "hook", label: "Hook" },
  { id: "adlib", label: "Adlib" },
  { id: "intro", label: "Intro" },
  { id: "bridge", label: "Bridge" },
  { id: "outro", label: "Outro" },
];

const presets = [
  { id: "trap-hard", name: "Trap Hard", retune: 88, humanize: 10, vibrato: 42, formant: 10, gate: 18, deEss: 28, comp: 72, saturation: 38, space: 18, width: 42 },
  { id: "drill-dark", name: "Drill Dark", retune: 72, humanize: 18, vibrato: 38, formant: -12, gate: 24, deEss: 34, comp: 82, saturation: 46, space: 12, width: 28 },
  { id: "clean-rap", name: "Clean Rap", retune: 22, humanize: 60, vibrato: 72, formant: 0, gate: 10, deEss: 20, comp: 62, saturation: 18, space: 8, width: 18 },
  { id: "rage-wide", name: "Rage Wide", retune: 95, humanize: 5, vibrato: 30, formant: 18, gate: 16, deEss: 38, comp: 76, saturation: 58, space: 34, width: 86 },
  { id: "radio-hook", name: "Radio Hook", retune: 58, humanize: 30, vibrato: 64, formant: 8, gate: 12, deEss: 30, comp: 68, saturation: 32, space: 45, width: 72 },
  { id: "lofi-demo", name: "Lo-Fi Demo", retune: 36, humanize: 55, vibrato: 78, formant: -18, gate: 4, deEss: 14, comp: 54, saturation: 62, space: 22, width: 12 },
];

const els = {
  viewTabs: document.querySelectorAll("[data-view]"),
  viewPanels: document.querySelectorAll("[data-view-panel]"),
  projectInput: document.querySelector("#projectInput"),
  openProjectButton: document.querySelector("#openProjectButton"),
  saveProjectButton: document.querySelector("#saveProjectButton"),
  saveProjectZipButton: document.querySelector("#saveProjectZipButton"),
  recoverProjectButton: document.querySelector("#recoverProjectButton"),
  recoverySelect: document.querySelector("#recoverySelect"),
  templateSelect: document.querySelector("#templateSelect"),
  templateMeta: document.querySelector("#templateMeta"),
  applyTemplateButton: document.querySelector("#applyTemplateButton"),
  beatInput: document.querySelector("#beatInput"),
  beatName: document.querySelector("#beatName"),
  beatAudio: document.querySelector("#beatAudio"),
  bpmInput: document.querySelector("#bpmInput"),
  countInSelect: document.querySelector("#countInSelect"),
  keySelect: document.querySelector("#keySelect"),
  scaleModeSelect: document.querySelector("#scaleModeSelect"),
  targetMidiSelect: document.querySelector("#targetMidiSelect"),
  audioInputSelect: document.querySelector("#audioInputSelect"),
  audioOutputSelect: document.querySelector("#audioOutputSelect"),
  nativeBufferSizeSelect: document.querySelector("#nativeBufferSizeSelect"),
  nativeAudioSummary: document.querySelector("#nativeAudioSummary"),
  nativeAudioDriverText: document.querySelector("#nativeAudioDriverText"),
  nativeAudioDetailText: document.querySelector("#nativeAudioDetailText"),
  nativeLatencyRefreshButton: document.querySelector("#nativeLatencyRefreshButton"),
  inputGainSlider: document.querySelector("#inputGainSlider"),
  inputGainText: document.querySelector("#inputGainText"),
  micButton: document.querySelector("#micButton"),
  monitorButton: document.querySelector("#monitorButton"),
  playButton: document.querySelector("#playButton"),
  stopButton: document.querySelector("#stopButton"),
  recordButton: document.querySelector("#recordButton"),
  engineStatus: document.querySelector("#engineStatus"),
  engineStatusText: document.querySelector("#engineStatusText"),
  pluginScanStatus: document.querySelector("#pluginScanStatus"),
  pluginScanStatusText: document.querySelector("#pluginScanStatusText"),
  sessionState: document.querySelector("#sessionState"),
  clock: document.querySelector("#clock"),
  micStatus: document.querySelector("#micStatus"),
  inputMeter: document.querySelector("#inputMeter"),
  inputLevelText: document.querySelector("#inputLevelText"),
  waveCanvas: document.querySelector("#waveCanvas"),
  waveformStatus: document.querySelector("#waveformStatus"),
  countdown: document.querySelector("#countdown"),
  quickTakeTitle: document.querySelector("#quickTakeTitle"),
  quickTakeMeta: document.querySelector("#quickTakeMeta"),
  playLatestTakeButton: document.querySelector("#playLatestTakeButton"),
  sendLatestToVocalButton: document.querySelector("#sendLatestToVocalButton"),
  quickTakeList: document.querySelector("#quickTakeList"),
  trackList: document.querySelector("#trackList"),
  armTrackList: document.querySelector("#armTrackList"),
  armedTrackName: document.querySelector("#armedTrackName"),
  punchToggle: document.querySelector("#punchToggle"),
  loopToggle: document.querySelector("#loopToggle"),
  metronomeToggle: document.querySelector("#metronomeToggle"),
  punchStatus: document.querySelector("#punchStatus"),
  punchInInput: document.querySelector("#punchInInput"),
  punchOutInput: document.querySelector("#punchOutInput"),
  recordLatencyInput: document.querySelector("#recordLatencyInput"),
  setPunchInButton: document.querySelector("#setPunchInButton"),
  setPunchOutButton: document.querySelector("#setPunchOutButton"),
  punchWindowText: document.querySelector("#punchWindowText"),
  presetGrid: document.querySelector("#presetGrid"),
  customPresetNameInput: document.querySelector("#customPresetNameInput"),
  updateCustomPresetButton: document.querySelector("#updateCustomPresetButton"),
  saveCustomPresetButton: document.querySelector("#saveCustomPresetButton"),
  presetName: document.querySelector("#presetName"),
  retuneValue: document.querySelector("#retuneValue"),
  compValue: document.querySelector("#compValue"),
  spaceValue: document.querySelector("#spaceValue"),
  widthValue: document.querySelector("#widthValue"),
  retuneSpeedSlider: document.querySelector("#retuneSpeedSlider"),
  retuneSpeedText: document.querySelector("#retuneSpeedText"),
  humanizeSlider: document.querySelector("#humanizeSlider"),
  humanizeText: document.querySelector("#humanizeText"),
  vibratoSlider: document.querySelector("#vibratoSlider"),
  vibratoText: document.querySelector("#vibratoText"),
  formantSlider: document.querySelector("#formantSlider"),
  formantText: document.querySelector("#formantText"),
  gateSlider: document.querySelector("#gateSlider"),
  gateText: document.querySelector("#gateText"),
  deEssSlider: document.querySelector("#deEssSlider"),
  deEssText: document.querySelector("#deEssText"),
  compSlider: document.querySelector("#compSlider"),
  compText: document.querySelector("#compText"),
  compDetailText: document.querySelector("#compDetailText"),
  compThresholdSlider: document.querySelector("#compThresholdSlider"),
  compThresholdText: document.querySelector("#compThresholdText"),
  compRatioSlider: document.querySelector("#compRatioSlider"),
  compRatioText: document.querySelector("#compRatioText"),
  compAttackSlider: document.querySelector("#compAttackSlider"),
  compAttackText: document.querySelector("#compAttackText"),
  compReleaseSlider: document.querySelector("#compReleaseSlider"),
  compReleaseText: document.querySelector("#compReleaseText"),
  saturationSlider: document.querySelector("#saturationSlider"),
  saturationText: document.querySelector("#saturationText"),
  spaceSlider: document.querySelector("#spaceSlider"),
  spaceText: document.querySelector("#spaceText"),
  delaySlider: document.querySelector("#delaySlider"),
  delayText: document.querySelector("#delayText"),
  reverbSlider: document.querySelector("#reverbSlider"),
  reverbText: document.querySelector("#reverbText"),
  widthSlider: document.querySelector("#widthSlider"),
  widthText: document.querySelector("#widthText"),
  lowEqSlider: document.querySelector("#lowEqSlider"),
  lowEqText: document.querySelector("#lowEqText"),
  midEqSlider: document.querySelector("#midEqSlider"),
  midEqText: document.querySelector("#midEqText"),
  airEqSlider: document.querySelector("#airEqSlider"),
  airEqText: document.querySelector("#airEqText"),
  limiterCeilingSlider: document.querySelector("#limiterCeilingSlider"),
  limiterCeilingText: document.querySelector("#limiterCeilingText"),
  vocalTakeSelect: document.querySelector("#vocalTakeSelect"),
  selectedTakeMeta: document.querySelector("#selectedTakeMeta"),
  vocalStatus: document.querySelector("#vocalStatus"),
  previewVocalButton: document.querySelector("#previewVocalButton"),
  analyzeVocalButton: document.querySelector("#analyzeVocalButton"),
  renderVocalButton: document.querySelector("#renderVocalButton"),
  compareSourceButton: document.querySelector("#compareSourceButton"),
  compareProcessedButton: document.querySelector("#compareProcessedButton"),
  compareStatus: document.querySelector("#compareStatus"),
  compareMeta: document.querySelector("#compareMeta"),
  versionStatus: document.querySelector("#versionStatus"),
  versionList: document.querySelector("#versionList"),
  pitchKeyText: document.querySelector("#pitchKeyText"),
  pitchDetectedText: document.querySelector("#pitchDetectedText"),
  pitchTargetText: document.querySelector("#pitchTargetText"),
  pitchCorrectionText: document.querySelector("#pitchCorrectionText"),
  pitchConfidenceText: document.querySelector("#pitchConfidenceText"),
  pitchLane: document.querySelector("#pitchLane"),
  pitchLaneMeta: document.querySelector("#pitchLaneMeta"),
  resetPitchLaneButton: document.querySelector("#resetPitchLaneButton"),
  customScaleEditor: document.querySelector("#customScaleEditor"),
  customScaleGrid: document.querySelector("#customScaleGrid"),
  customScaleMeta: document.querySelector("#customScaleMeta"),
  batchScopeSelect: document.querySelector("#batchScopeSelect"),
  batchSkipRenderedInput: document.querySelector("#batchSkipRenderedInput"),
  batchRenderButton: document.querySelector("#batchRenderButton"),
  batchStatus: document.querySelector("#batchStatus"),
  batchMeta: document.querySelector("#batchMeta"),
  batchTargetList: document.querySelector("#batchTargetList"),
  takesList: document.querySelector("#takesList"),
  playQueueButton: document.querySelector("#playQueueButton"),
  playCompButton: document.querySelector("#playCompButton"),
  compLaneList: document.querySelector("#compLaneList"),
  compPoolList: document.querySelector("#compPoolList"),
  compLaneMeta: document.querySelector("#compLaneMeta"),
  compPoolMeta: document.querySelector("#compPoolMeta"),
  compPlayButton: document.querySelector("#compPlayButton"),
  compClearButton: document.querySelector("#compClearButton"),
  compBestButton: document.querySelector("#compBestButton"),
  exportMixButton: document.querySelector("#exportMixButton"),
  downloadLatestButton: document.querySelector("#downloadLatestButton"),
  timelineLength: document.querySelector("#timelineLength"),
  timelineRuler: document.querySelector("#timelineRuler"),
  timelineMarkers: document.querySelector("#timelineMarkers"),
  timelineRegions: document.querySelector("#timelineRegions"),
  markerTypeSelect: document.querySelector("#markerTypeSelect"),
  markerTimeInput: document.querySelector("#markerTimeInput"),
  addMarkerButton: document.querySelector("#addMarkerButton"),
  timelineGrid: document.querySelector("#timelineGrid"),
  timelineSnapSelect: document.querySelector("#timelineSnapSelect"),
  timelineGridMeta: document.querySelector("#timelineGridMeta"),
  markerList: document.querySelector("#markerList"),
  regionList: document.querySelector("#regionList"),
  timelineUndoButton: document.querySelector("#timelineUndoButton"),
  timelineRedoButton: document.querySelector("#timelineRedoButton"),
  exportStemsButton: document.querySelector("#exportStemsButton"),
  exportBeatStemButton: document.querySelector("#exportBeatStemButton"),
  exportVocalStemButton: document.querySelector("#exportVocalStemButton"),
  exportDryVocalsButton: document.querySelector("#exportDryVocalsButton"),
  exportTunedVocalsButton: document.querySelector("#exportTunedVocalsButton"),
  analyzeLoudnessButton: document.querySelector("#analyzeLoudnessButton"),
  exportStatusText: document.querySelector("#exportStatusText"),
  exportList: document.querySelector("#exportList"),
  exportArtistInput: document.querySelector("#exportArtistInput"),
  exportTitleInput: document.querySelector("#exportTitleInput"),
  exportBitDepthSelect: document.querySelector("#exportBitDepthSelect"),
  exportNormalizeInput: document.querySelector("#exportNormalizeInput"),
  exportLoudnessNormalizeInput: document.querySelector("#exportLoudnessNormalizeInput"),
  lyricsInput: document.querySelector("#lyricsInput"),
  sessionNotesInput: document.querySelector("#sessionNotesInput"),
  lyricSectionList: document.querySelector("#lyricSectionList"),
};

function init() {
  state.mimeType = getBestMimeType();
  renderTargetMidiOptions();
  bindEvents();
  renderTracks();
  renderArmTracks();
  renderTakes();
  renderTimeline();
  renderExportPanel();
  renderPresets();
  renderProjectTemplates();
  renderLyrics();
  applyPreset("trap-hard");
  renderEngineStatus();
  refreshAudioDevices();
  updateTimelineHistoryButtons();
  updateInputGain();
  updatePunchControls();
  checkAutosave();
  drawIdleWave();
  updateTimer();

  window.addEventListener("resize", drawIdleWave);
  window.addEventListener("keydown", handleGlobalShortcut);
  window.addEventListener("punchlab:native-ready", renderEngineStatus);
  window.addEventListener("punchlab:platform-ready", renderEngineStatus);
  navigator.mediaDevices?.addEventListener?.("devicechange", refreshAudioDevices);
  window.addEventListener("load", () => {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  });
}

function renderEngineStatus() {
  if (!els.engineStatus || !els.engineStatusText) {
    return;
  }

  const driver = window.PunchLabEngine?.getDriver?.();
  const bridgeStatus = window.PunchLabNativeBridge?.getStatus?.();
  const descriptor = window.PunchLabEngineContract?.describeDriver?.(driver, bridgeStatus) || {
    kind: driver?.id === "native" ? "native" : "web",
    label: driver?.id === "native" ? "Native" : "Web Audio",
    title: driver?.name || "Web Audio Engine",
  };
  const desktopReadiness = window.PunchLabDesktop?.getReadiness?.();

  els.engineStatus.dataset.engine = descriptor.kind;
  els.engineStatus.dataset.desktop = desktopReadiness?.nativeAvailable ? "native" : "fallback";
  els.engineStatusText.textContent = descriptor.label;
  els.engineStatus.title = desktopReadiness
    ? [
      descriptor.title,
      `Desktop ${desktopReadiness.summary}`,
      desktopReadiness.wrapper?.summary || "wrapper pending",
      `Buffer ${desktopReadiness.nativeAudioEngine?.preferredRuntimeBufferSize || state.nativeBufferSize} samples`,
      formatRuntimeLatency(getDisplayRoundTripLatency(desktopReadiness)),
      formatDisplaySampleRate(getDisplaySampleRate(desktopReadiness)),
      desktopReadiness.nativeAudioEngine?.detail || "",
    ].filter(Boolean).join(" / ")
    : descriptor.title;
  renderNativeAudioSummary(desktopReadiness);
  renderPluginScanStatus(desktopReadiness);
}

function renderNativeAudioSummary(desktopReadiness = window.PunchLabDesktop?.getReadiness?.()) {
  if (!els.nativeAudioSummary || !els.nativeAudioDriverText || !els.nativeAudioDetailText) {
    return;
  }

  const nativeAudio = desktopReadiness?.nativeAudioEngine || {};
  const driver = nativeAudio.ready ? nativeAudio.fixture ? "Native fixture" : nativeAudio.driver || "Native ready" : "Web fallback";
  const buffer = nativeAudio.preferredRuntimeBufferSize || state.nativeBufferSize;
  const latencyText = formatRuntimeLatency(getDisplayRoundTripLatency(desktopReadiness)) || "Latency pending";
  const sampleRateText = formatDisplaySampleRate(getDisplaySampleRate(desktopReadiness)) || "Rate pending";
  const updatedText = formatDisplayTimestamp(getDisplayLatencyStatsUpdatedAt(desktopReadiness));
  const detail = [`${buffer} samples`, latencyText, sampleRateText, updatedText].filter(Boolean).join(" / ");
  const canRefresh = Boolean(desktopReadiness?.latencyControl?.available && window.PunchLabPlatform?.refreshLatencyStats);

  els.nativeAudioSummary.dataset.ready = nativeAudio.ready ? "true" : "false";
  els.nativeAudioDriverText.textContent = driver;
  els.nativeAudioDetailText.textContent = detail;
  els.nativeAudioSummary.title = nativeAudio.detail ? `${driver} / ${detail} / ${nativeAudio.detail}` : `${driver} / ${detail}`;
  if (els.nativeLatencyRefreshButton) {
    els.nativeLatencyRefreshButton.disabled = !canRefresh || state.isRefreshingNativeStats;
    els.nativeLatencyRefreshButton.title = canRefresh
      ? state.isRefreshingNativeStats ? "Refreshing native audio stats" : "Refresh native audio stats"
      : "Native latency refresh unavailable";
  }
}

function formatRuntimeLatency(value) {
  const latencyMs = Number(value);
  return Number.isFinite(latencyMs) ? `Latency ${Math.round(latencyMs)} ms` : "";
}

function getDisplayRoundTripLatency(desktopReadiness) {
  return desktopReadiness?.nativeAudioEngine?.runtimeRoundTripLatencyMs
    ?? state.loadedProjectEnvironment?.nativeAudio?.roundTripLatencyMs
    ?? null;
}

function formatDisplaySampleRate(value) {
  const sampleRate = Number(value);
  return Number.isFinite(sampleRate) && sampleRate > 0 ? `${(sampleRate / 1000).toFixed(sampleRate % 1000 ? 1 : 0)} kHz` : "";
}

function getDisplaySampleRate(desktopReadiness) {
  return desktopReadiness?.latencyControl?.stats?.sampleRate
    ?? state.loadedProjectEnvironment?.nativeAudio?.stats?.sampleRate
    ?? null;
}

function getDisplayLatencyStatsUpdatedAt(desktopReadiness) {
  return desktopReadiness?.latencyControl?.statsUpdatedAt
    ?? state.loadedProjectEnvironment?.nativeAudio?.statsUpdatedAt
    ?? null;
}

function formatDisplayTimestamp(value) {
  const timestamp = value ? new Date(value) : null;
  return timestamp && !Number.isNaN(timestamp.getTime())
    ? `Updated ${timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    : "";
}

function renderPluginScanStatus(desktopReadiness = window.PunchLabDesktop?.getReadiness?.()) {
  if (!els.pluginScanStatus || !els.pluginScanStatusText) {
    return;
  }

  const pluginHost = desktopReadiness?.pluginHost || {};
  const scanAvailable = Boolean(pluginHost.scanAvailable);
  const pluginHostReady = Boolean(pluginHost.ready);
  const resultCount = Array.isArray(state.pluginScanResult?.plugins) ? state.pluginScanResult.plugins.length : null;
  els.pluginScanStatus.disabled = !scanAvailable || state.isPluginScanning;
  els.pluginScanStatus.dataset.scan = pluginHostReady ? "ready" : scanAvailable ? "pending" : "fallback";
  els.pluginScanStatusText.textContent = state.isPluginScanning
    ? "Scanning"
    : resultCount === null ? "Plugin" : `Plugin ${resultCount}`;
  els.pluginScanStatus.title = formatPluginScanStatusTitle({ pluginHost, scanAvailable, pluginHostReady, resultCount });
}

function formatPluginScanStatusTitle({ pluginHost = {}, scanAvailable = false, pluginHostReady = false, resultCount = null }) {
  if (!scanAvailable) {
    return `Plugin scan unavailable: ${(pluginHost.missingMethods || ["scanPluginHosts"]).join(", ")}`;
  }
  if (resultCount === null) {
    return pluginHostReady ? "Scan VST3/AU plugins" : "Scan VST3/AU locations; plugin hosting pending";
  }

  const formats = Array.isArray(state.pluginScanResult?.formats) && state.pluginScanResult.formats.length
    ? ` / ${state.pluginScanResult.formats.join(", ")}`
    : "";
  const scannedAt = formatDisplayTimestamp(state.pluginScanResult?.scannedAt);
  const hostState = state.pluginScanResult?.pluginHostReady || pluginHostReady ? " / Host ready" : " / Host pending";
  return `${resultCount} plugin(s) found${formats}${scannedAt ? ` / ${scannedAt}` : ""}${hostState}`;
}

async function scanPluginHosts() {
  const desktopReadiness = window.PunchLabDesktop?.getReadiness?.();
  if (!desktopReadiness?.pluginHost?.scanAvailable) {
    els.sessionState.textContent = "Plugin scan unavailable";
    renderPluginScanStatus(desktopReadiness);
    return;
  }

  try {
    state.isPluginScanning = true;
    renderPluginScanStatus(desktopReadiness);
    els.sessionState.textContent = "Scanning plugins";
    const result = await window.PunchLabEngine.scanPluginHosts();
    state.pluginScanResult = {
      ...(result || {}),
      plugins: Array.isArray(result?.plugins) ? result.plugins : [],
      pluginHostReady: Boolean(result?.pluginHostReady),
      scannedAt: result?.scannedAt || new Date().toISOString(),
    };
    const count = Array.isArray(state.pluginScanResult.plugins) ? state.pluginScanResult.plugins.length : 0;
    els.sessionState.textContent = `Plugin scan ${count}`;
  } catch (error) {
    els.sessionState.textContent = "Plugin scan failed";
    console.error(error);
  } finally {
    state.isPluginScanning = false;
    renderPluginScanStatus();
  }
}

async function refreshNativeLatencyStats() {
  const desktopReadiness = window.PunchLabDesktop?.getReadiness?.();
  if (!desktopReadiness?.latencyControl?.available || !window.PunchLabPlatform?.refreshLatencyStats) {
    els.sessionState.textContent = "Native latency unavailable";
    renderNativeAudioSummary(desktopReadiness);
    return;
  }

  try {
    state.isRefreshingNativeStats = true;
    els.sessionState.textContent = "Refreshing native latency";
    renderNativeAudioSummary(desktopReadiness);
    const stats = await window.PunchLabPlatform.refreshLatencyStats();
    renderEngineStatus();
    els.sessionState.textContent = stats ? "Native latency refreshed" : "Native latency unavailable";
  } catch (error) {
    els.sessionState.textContent = "Native latency failed";
    console.error(error);
  } finally {
    state.isRefreshingNativeStats = false;
    renderEngineStatus();
  }
}

function bindEvents() {
  els.viewTabs.forEach((button) => {
    button.addEventListener("click", () => setActiveView(button.dataset.view));
  });
  els.micButton.addEventListener("click", enableMic);
  els.monitorButton.addEventListener("click", toggleInputMonitor);
  els.playButton.addEventListener("click", toggleSessionPlayback);
  els.stopButton.addEventListener("click", stopAll);
  els.recordButton.addEventListener("click", toggleRecord);
  els.pluginScanStatus.addEventListener("click", scanPluginHosts);
  els.nativeLatencyRefreshButton?.addEventListener("click", refreshNativeLatencyStats);
  els.beatInput.addEventListener("change", loadBeat);
  els.bpmInput.addEventListener("input", updateTempoSettings);
  els.countInSelect.addEventListener("change", scheduleAutosave);
  els.templateSelect.addEventListener("change", updateTemplateMeta);
  els.applyTemplateButton.addEventListener("click", applySelectedTemplate);
  els.inputGainSlider.addEventListener("input", updateInputGain);
  els.audioInputSelect.addEventListener("change", changeAudioInputDevice);
  els.audioOutputSelect.addEventListener("change", changeAudioOutputDevice);
  els.nativeBufferSizeSelect.addEventListener("change", changeNativeBufferSize);
  els.punchToggle.addEventListener("click", togglePunchMode);
  els.loopToggle.addEventListener("click", toggleLoopMode);
  els.metronomeToggle.addEventListener("click", toggleMetronome);
  els.punchInInput.addEventListener("input", updatePunchFromInputs);
  els.punchOutInput.addEventListener("input", updatePunchFromInputs);
  els.recordLatencyInput.addEventListener("input", updateRecordLatency);
  els.keySelect.addEventListener("change", () => {
    renderVocalPanel();
    scheduleAutosave();
  });
  els.scaleModeSelect.addEventListener("change", () => {
    renderVocalPanel();
    scheduleAutosave();
  });
  els.targetMidiSelect.addEventListener("change", () => {
    renderVocalPanel();
    scheduleAutosave();
  });
  els.setPunchInButton.addEventListener("click", () => setPunchPoint("in"));
  els.setPunchOutButton.addEventListener("click", () => setPunchPoint("out"));
  els.beatAudio.addEventListener("timeupdate", maintainLoopPlayback);
  els.playQueueButton.addEventListener("click", () => toggleTakeQueue("all"));
  els.playCompButton.addEventListener("click", () => toggleTakeQueue("comp"));
  els.compPlayButton.addEventListener("click", () => toggleTakeQueue("comp"));
  els.compClearButton.addEventListener("click", clearCompLane);
  els.compBestButton.addEventListener("click", addBestTakesToComp);
  els.exportMixButton.addEventListener("click", exportFullMix);
  els.playLatestTakeButton.addEventListener("click", playLatestTake);
  els.sendLatestToVocalButton.addEventListener("click", sendLatestTakeToVocal);
  els.downloadLatestButton.addEventListener("click", downloadLatestTake);
  els.retuneSpeedSlider.addEventListener("input", () => {
    updateTuneControls();
    scheduleAutosave();
  });
  els.humanizeSlider.addEventListener("input", () => {
    updateTuneControls();
    scheduleAutosave();
  });
  els.vibratoSlider.addEventListener("input", () => {
    updateTuneControls();
    scheduleAutosave();
  });
  els.formantSlider.addEventListener("input", () => {
    updateTuneControls();
    scheduleAutosave();
  });
  els.gateSlider.addEventListener("input", () => {
    updateTuneControls();
    scheduleAutosave();
  });
  els.deEssSlider.addEventListener("input", () => {
    updateTuneControls();
    scheduleAutosave();
  });
  els.compSlider.addEventListener("input", () => {
    syncCompDetailDefaults();
    updateTuneControls();
    scheduleAutosave();
  });
  els.compThresholdSlider.addEventListener("input", () => {
    updateTuneControls();
    scheduleAutosave();
  });
  els.compRatioSlider.addEventListener("input", () => {
    updateTuneControls();
    scheduleAutosave();
  });
  els.compAttackSlider.addEventListener("input", () => {
    updateTuneControls();
    scheduleAutosave();
  });
  els.compReleaseSlider.addEventListener("input", () => {
    updateTuneControls();
    scheduleAutosave();
  });
  els.saturationSlider.addEventListener("input", () => {
    updateTuneControls();
    scheduleAutosave();
  });
  els.spaceSlider.addEventListener("input", () => {
    updateTuneControls();
    scheduleAutosave();
  });
  els.delaySlider.addEventListener("input", () => {
    updateTuneControls();
    scheduleAutosave();
  });
  els.reverbSlider.addEventListener("input", () => {
    updateTuneControls();
    scheduleAutosave();
  });
  els.widthSlider.addEventListener("input", () => {
    updateTuneControls();
    scheduleAutosave();
  });
  els.lowEqSlider.addEventListener("input", () => {
    updateTuneControls();
    scheduleAutosave();
  });
  els.midEqSlider.addEventListener("input", () => {
    updateTuneControls();
    scheduleAutosave();
  });
  els.airEqSlider.addEventListener("input", () => {
    updateTuneControls();
    scheduleAutosave();
  });
  els.limiterCeilingSlider.addEventListener("input", () => {
    updateTuneControls();
    scheduleAutosave();
  });
  els.vocalTakeSelect.addEventListener("change", () => {
    state.selectedVocalTakeId = els.vocalTakeSelect.value || null;
    renderVocalPanel();
  });
  els.previewVocalButton.addEventListener("click", previewSelectedVocalTake);
  els.analyzeVocalButton.addEventListener("click", analyzeSelectedVocalTake);
  els.renderVocalButton.addEventListener("click", renderSelectedVocalTake);
  els.compareSourceButton.addEventListener("click", () => playComparisonTake("source"));
  els.compareProcessedButton.addEventListener("click", () => playComparisonTake("processed"));
  els.pitchLane.addEventListener("click", handlePitchLaneClick);
  els.resetPitchLaneButton.addEventListener("click", clearManualPitchLane);
  els.customScaleGrid.addEventListener("click", handleCustomScaleClick);
  els.batchScopeSelect.addEventListener("change", renderVocalPanel);
  els.batchSkipRenderedInput.addEventListener("change", renderVocalPanel);
  els.batchRenderButton.addEventListener("click", renderBatchVocalTakes);
  els.saveProjectButton.addEventListener("click", saveProject);
  els.saveProjectZipButton.addEventListener("click", saveProjectZip);
  els.openProjectButton.addEventListener("click", openProject);
  els.projectInput.addEventListener("change", loadProject);
  els.recoverProjectButton.addEventListener("click", recoverAutosave);
  els.recoverySelect.addEventListener("change", updateRecoveryButton);
  els.addMarkerButton.addEventListener("click", addTimelineMarker);
  els.timelineSnapSelect.addEventListener("change", updateTimelineSnapMode);
  els.timelineUndoButton.addEventListener("click", undoTimelineEdit);
  els.timelineRedoButton.addEventListener("click", redoTimelineEdit);
  els.exportStemsButton.addEventListener("click", exportTrackStems);
  els.exportBeatStemButton.addEventListener("click", exportBeatStem);
  els.exportVocalStemButton.addEventListener("click", exportVocalStem);
  els.exportDryVocalsButton.addEventListener("click", exportDryVocals);
  els.exportTunedVocalsButton.addEventListener("click", exportTunedVocals);
  els.analyzeLoudnessButton.addEventListener("click", analyzeLoudness);
  els.exportArtistInput.addEventListener("input", updateExportMetadata);
  els.exportTitleInput.addEventListener("input", updateExportMetadata);
  els.exportBitDepthSelect.addEventListener("change", updateExportMetadata);
  els.exportNormalizeInput.addEventListener("change", updateExportMetadata);
  els.exportLoudnessNormalizeInput.addEventListener("change", updateExportMetadata);
  els.lyricsInput.addEventListener("input", updateProjectLyrics);
  els.sessionNotesInput.addEventListener("input", updateProjectNotes);
  els.updateCustomPresetButton.addEventListener("click", updateCustomPreset);
  els.saveCustomPresetButton.addEventListener("click", saveCustomPreset);
}

function handleGlobalShortcut(event) {
  const isTyping = isTypingTarget(event.target) || isTypingTarget(document.activeElement);
  if ((event.ctrlKey || event.metaKey) && !event.altKey && !isTyping && state.activeView === "timeline") {
    if (event.code === "KeyZ" && event.shiftKey) {
      event.preventDefault();
      redoTimelineEdit();
      return;
    }

    if (event.code === "KeyZ") {
      event.preventDefault();
      undoTimelineEdit();
      return;
    }

    if (event.code === "KeyY") {
      event.preventDefault();
      redoTimelineEdit();
      return;
    }
  }

  if (event.ctrlKey || event.metaKey || event.altKey || isTyping) {
    return;
  }

  if (event.code === "Space") {
    event.preventDefault();
    toggleSessionPlayback();
    return;
  }

  if (event.code === "KeyR") {
    event.preventDefault();
    toggleRecord();
    return;
  }

  if (event.code === "KeyS") {
    event.preventDefault();
    stopAll();
    return;
  }

  if (event.code === "KeyM") {
    event.preventDefault();
    toggleMetronome();
    return;
  }

  if (/^Digit[1-8]$/.test(event.code)) {
    const index = Number(event.code.replace("Digit", "")) - 1;
    const tab = Array.from(els.viewTabs)[index];
    if (tab) {
      event.preventDefault();
      setActiveView(tab.dataset.view);
    }
  }
}

function isTypingTarget(target) {
  const tag = target?.tagName?.toLowerCase();
  return tag === "input" || tag === "select" || tag === "textarea" || target?.isContentEditable;
}

function setActiveView(view) {
  state.activeView = view;
  els.viewTabs.forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });
  els.viewPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.viewPanel === view);
  });
  if (view === "timeline") {
    renderTimeline();
  }
  if (view === "comp") {
    renderCompView();
  }
  if (view === "lyrics") {
    renderLyrics();
  }
}

function getBestMimeType() {
  const types = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", ""];
  return types.find((type) => !type || MediaRecorder.isTypeSupported(type)) || "";
}

async function refreshAudioDevices() {
  if (!window.PunchLabDevices?.listAudioDevices) {
    return;
  }

  try {
    const [inputs, outputs] = await Promise.all([
      window.PunchLabDevices.listAudioDevices("audioinput"),
      window.PunchLabDevices.listAudioDevices("audiooutput"),
    ]);
    renderAudioDeviceSelect(els.audioInputSelect, inputs, state.audioInputDeviceId, "Default mic");
    renderAudioDeviceSelect(els.audioOutputSelect, outputs, state.audioOutputDeviceId, "Default output");
    if (els.audioOutputSelect) {
      const outputRouting = window.PunchLabDesktop?.getReadiness?.()?.outputRouting || {};
      const browserOutputReady = window.PunchLabDevices.canSetMediaOutput?.() || window.PunchLabDevices.canSetAudioContextOutput?.();
      els.audioOutputSelect.disabled = !(browserOutputReady || outputRouting.nativeAvailable);
    }
    state.audioInputDeviceId = els.audioInputSelect.value;
    state.audioOutputDeviceId = els.audioOutputSelect.value;
  } catch (error) {
    console.error(error);
  }
}

function renderAudioDeviceSelect(select, devices, selectedId, defaultLabel) {
  if (!select) {
    return;
  }

  const options = [
    `<option value="">${defaultLabel}</option>`,
    ...devices.map((device) => `<option value="${escapeHtml(device.id)}">${escapeHtml(device.label)}</option>`),
  ];

  select.innerHTML = options.join("");
  select.value = devices.some((device) => device.id === selectedId) ? selectedId : "";
}

function getMicConstraints() {
  if (window.PunchLabDevices?.getMicConstraints) {
    return window.PunchLabDevices.getMicConstraints(state.audioInputDeviceId);
  }

  return { audio: true };
}

function releaseMicInput() {
  cancelAnimationFrame(state.waveFrame);
  state.waveFrame = 0;
  if (state.nativeMonitorActive) {
    void stopNativeInputMonitor();
  }
  state.stream?.getTracks().forEach((track) => track.stop());

  try {
    state.gainNode?.disconnect();
    state.monitorGain?.disconnect();
  } catch {
    // Browser audio nodes can already be disconnected during device swaps.
  }

  state.stream = null;
  state.processedStream = null;
  state.analyser = null;
  state.gainNode = null;
  state.monitorGain = null;
  state.recorderDestination = null;
  state.monitorConnected = false;
  state.monitorMode = null;
  els.micStatus.classList.remove("ready");
}

async function changeAudioInputDevice() {
  if (state.isRecording || state.isPunchWaiting || state.isPunchRecording) {
    els.audioInputSelect.value = state.audioInputDeviceId;
    els.sessionState.textContent = "Stop recording first";
    return;
  }

  state.audioInputDeviceId = els.audioInputSelect.value;
  scheduleAutosave();

  if (!state.stream) {
    els.sessionState.textContent = state.audioInputDeviceId ? "Input selected" : "Default input";
    return;
  }

  if (state.nativeMonitorActive) {
    await stopNativeInputMonitor();
  }
  releaseMicInput();
  await enableMic();
  if (state.monitorEnabled) {
    await activateInputMonitorRoute();
  }
}

async function changeAudioOutputDevice() {
  state.audioOutputDeviceId = els.audioOutputSelect.value;
  scheduleAutosave();
  const supported = await applyCurrentPlaybackOutput();
  if (state.monitorEnabled) {
    await activateInputMonitorRoute();
  }
  els.sessionState.textContent = supported
    ? state.audioOutputDeviceId
      ? "Output selected"
      : "Default output"
    : "Output routing unsupported";
}

async function applyNativePlaybackOutput() {
  try {
    const result = await window.PunchLabPlatform?.setOutputDevice?.(state.audioOutputDeviceId);
    return Boolean(result?.supported);
  } catch (error) {
    els.sessionState.textContent = "Native output failed";
    console.error(error);
    return false;
  }
}

async function applyPlaybackOutput(audio) {
  let supported = false;

  try {
    if (window.PunchLabDevices?.setMediaOutput) {
      supported = (await window.PunchLabDevices.setMediaOutput(audio, state.audioOutputDeviceId)) || supported;
    }
  } catch (error) {
    els.sessionState.textContent = "Output switch failed";
    console.error(error);
  }

  return supported;
}

async function applyAudioContextOutput() {
  try {
    if (window.PunchLabDevices?.setAudioContextOutput) {
      return await window.PunchLabDevices.setAudioContextOutput(state.audioContext, state.audioOutputDeviceId);
    }
  } catch (error) {
    console.error(error);
  }

  return false;
}

async function applyCurrentPlaybackOutput() {
  const nativeResult = await applyNativePlaybackOutput();
  const targets = [
    els.beatAudio,
    state.currentTakeAudio,
    state.exportPreviewAudio,
    ...state.sessionPlayers.map((player) => player.audio),
  ].filter(Boolean);
  const mediaResults = await Promise.all(targets.map((audio) => applyPlaybackOutput(audio)));
  const contextResult = await applyAudioContextOutput();
  return nativeResult || contextResult || mediaResults.some(Boolean);
}

async function ensureAudioContext() {
  if (!state.audioContext) {
    state.audioContext = new AudioContext();
  }

  if (state.audioContext.state === "suspended") {
    await state.audioContext.resume();
  }

  await applyAudioContextOutput();
  await applyNativePlaybackOutput();
  return state.audioContext;
}

async function enableMic() {
  if (state.stream) {
    return;
  }

  try {
    try {
      state.stream = await navigator.mediaDevices.getUserMedia(getMicConstraints());
    } catch (error) {
      if (!state.audioInputDeviceId) {
        throw error;
      }
      state.audioInputDeviceId = "";
      els.audioInputSelect.value = "";
      state.stream = await navigator.mediaDevices.getUserMedia(getMicConstraints());
    }

    state.audioContext = await ensureAudioContext();
    const source = state.audioContext.createMediaStreamSource(state.stream);
    state.gainNode = state.audioContext.createGain();
    state.analyser = state.audioContext.createAnalyser();
    state.monitorGain = state.audioContext.createGain();
    state.recorderDestination = state.audioContext.createMediaStreamDestination();

    state.analyser.fftSize = 2048;
    state.gainNode.gain.value = state.inputGain;
    state.monitorGain.gain.value = 0.35;
    source.connect(state.gainNode);
    state.gainNode.connect(state.analyser);
    state.gainNode.connect(state.recorderDestination);
    state.processedStream = state.recorderDestination.stream;
    syncMonitorRouting();

    els.micStatus.classList.add("ready");
    els.sessionState.textContent = "Mic ready";
    updateMonitorButton();
    updateInputGain();
    refreshAudioDevices();
    startMeter();
  } catch (error) {
    els.sessionState.textContent = "Mic blocked";
    console.error(error);
  }
}

async function toggleInputMonitor() {
  const nextEnabled = !state.monitorEnabled;
  if (nextEnabled && !state.stream) {
    await enableMic();
    if (!state.stream) {
      state.monitorEnabled = false;
      state.monitorMode = null;
      updateMonitorButton();
      return;
    }
  }

  state.monitorEnabled = nextEnabled;
  if (state.monitorEnabled) {
    await activateInputMonitorRoute();
  } else {
    await deactivateInputMonitorRoute();
  }
  updateMonitorButton();
  els.sessionState.textContent = state.monitorEnabled
    ? state.monitorMode === "native" ? "Native monitor on" : "Monitor on"
    : "Monitor off";
}

async function activateInputMonitorRoute() {
  await stopNativeInputMonitor();
  disconnectBrowserInputMonitor();
  state.monitorMode = null;

  if (await startNativeInputMonitor()) {
    state.monitorMode = "native";
    updateMonitorButton();
    return;
  }

  state.monitorMode = "web";
  syncMonitorRouting();
  updateMonitorButton();
}

async function deactivateInputMonitorRoute() {
  await stopNativeInputMonitor();
  state.monitorMode = null;
  syncMonitorRouting();
  updateMonitorButton();
}

async function startNativeInputMonitor() {
  const driver = window.PunchLabEngine?.getDriver?.();
  if (
    driver?.id !== "native" ||
    driver?.capabilities?.realtimeNativeMonitoring !== true ||
    typeof window.PunchLabEngine?.startInputMonitor !== "function"
  ) {
    return false;
  }

  try {
    const result = await window.PunchLabEngine.startInputMonitor(getNativeMonitorPayload());
    if (!result || result.unsupported) {
      state.nativeMonitorActive = false;
      return false;
    }
    state.nativeMonitorActive = result.active !== false;
    return state.nativeMonitorActive;
  } catch (error) {
    state.nativeMonitorActive = false;
    console.warn("PunchLab native input monitor failed; falling back to Web Audio.", error);
    return false;
  }
}

async function stopNativeInputMonitor() {
  if (!state.nativeMonitorActive || typeof window.PunchLabEngine?.stopInputMonitor !== "function") {
    state.nativeMonitorActive = false;
    return false;
  }

  try {
    await window.PunchLabEngine.stopInputMonitor(getNativeMonitorPayload());
  } catch (error) {
    console.warn("PunchLab native input monitor stop failed.", error);
  }

  state.nativeMonitorActive = false;
  return true;
}

function getNativeMonitorPayload() {
  return {
    inputDeviceId: state.audioInputDeviceId || "",
    outputDeviceId: state.audioOutputDeviceId || "",
    gain: Number(state.monitorGain?.gain?.value ?? 0.35),
    bufferSize: state.nativeBufferSize,
    sampleRate: state.audioContext?.sampleRate || null,
  };
}

function syncMonitorRouting() {
  if (!state.gainNode || !state.monitorGain || !state.audioContext) {
    return;
  }

  if (state.monitorEnabled && state.monitorMode !== "native" && !state.monitorConnected) {
    state.gainNode.connect(state.monitorGain).connect(state.audioContext.destination);
    state.monitorConnected = true;
    return;
  }

  if ((!state.monitorEnabled || state.monitorMode === "native") && state.monitorConnected) {
    disconnectBrowserInputMonitor();
  }
}

function disconnectBrowserInputMonitor() {
  if (!state.monitorConnected) {
    return;
  }

  try {
    state.gainNode?.disconnect(state.monitorGain);
    state.monitorGain?.disconnect();
  } catch {
    // The node may already be disconnected by the browser.
  }
  state.monitorConnected = false;
}

function updateMonitorButton() {
  if (!els.monitorButton) {
    return;
  }

  els.monitorButton.classList.toggle("monitor-active", state.monitorEnabled);
  els.monitorButton.setAttribute("aria-pressed", String(state.monitorEnabled));
  els.monitorButton.title = state.monitorEnabled
    ? state.monitorMode === "native" ? "Native input monitor on" : "Input monitor on"
    : "Input monitor";
}

async function loadBeat(event) {
  const [file] = event.target.files;
  if (!file) {
    return;
  }

  if (state.beatUrl) {
    URL.revokeObjectURL(state.beatUrl);
  }

  state.beatArrayBuffer = await file.arrayBuffer();
  state.beatFileName = file.name;
  state.beatUrl = URL.createObjectURL(file);
  els.beatAudio.src = state.beatUrl;
  await applyPlaybackOutput(els.beatAudio);
  els.beatName.textContent = file.name;
  els.sessionState.textContent = "Beat loaded";
  updateExportButtons();
  renderTimeline();
  scheduleAutosave();
}

async function saveProject() {
  if (!window.PunchLabProject) {
    els.sessionState.textContent = "Project module missing";
    return;
  }

  try {
    els.saveProjectButton.disabled = true;
    els.sessionState.textContent = "Saving project";
    const bundle = await window.PunchLabProject.buildProjectBundle({
      state,
      tracks,
      presets,
      settings: getProjectSettings(),
      environment: getProjectEnvironment(),
    });
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
    const result = await saveBlobWithPlatform(blob, window.PunchLabProject.makeProjectFilename(state.beatFileName), {
      types: [
        {
          description: "PunchLab project",
          accept: { "application/json": [".json"] },
        },
      ],
    });
    els.sessionState.textContent = result.canceled
      ? "Save canceled"
      : result.method === "file-system"
        ? "Project saved"
        : "Project downloaded";
  } catch (error) {
    els.sessionState.textContent = "Save failed";
    console.error(error);
  } finally {
    els.saveProjectButton.disabled = false;
  }
}

async function saveProjectZip() {
  if (!window.PunchLabProject || !window.PunchLabProjectZip) {
    els.sessionState.textContent = "Project zip module missing";
    return;
  }

  try {
    els.saveProjectZipButton.disabled = true;
    els.sessionState.textContent = "Saving zip";
    const bundle = await window.PunchLabProject.buildProjectBundle({
      state,
      tracks,
      presets,
      settings: getProjectSettings(),
      environment: getProjectEnvironment(),
    });
    const projectFilename = window.PunchLabProject.makeProjectFilename(state.beatFileName);
    const files = await buildProjectZipFiles(bundle, projectFilename);
    const zipBlob = window.PunchLabProject.buildProjectZip(files);
    const result = await saveBlobWithPlatform(zipBlob, window.PunchLabProject.makeProjectZipFilename(state.beatFileName), {
      types: [
        {
          description: "PunchLab project archive",
          accept: { "application/zip": [".zip"] },
        },
      ],
    });
    els.sessionState.textContent = result.canceled
      ? "Zip canceled"
      : result.method === "file-system"
        ? "Zip saved with assets"
        : "Zip downloaded with assets";
  } catch (error) {
    els.sessionState.textContent = "Zip failed";
    console.error(error);
  } finally {
    els.saveProjectZipButton.disabled = false;
  }
}

async function buildProjectZipFiles(bundle, projectFilename) {
  const { files, usedPaths } = window.PunchLabProjectZip.createProjectZipArchiveFiles(projectFilename, bundle);
  const manifest = window.PunchLabProjectZip.createProjectZipManifest({
    projectFilename,
    session: summarizeSessionManifest(bundle),
    exportSettings: summarizeExportSettings(),
    pluginHost: summarizePluginHostScan(),
    automationManifest: summarizeAutomationParameterManifest(),
    nativeAudio: summarizeNativeAudioEnvironment(),
    desktopReadiness: summarizeDesktopReadinessEnvironment(),
    presets: summarizePresetManifest(bundle.presets || presets, bundle.settings?.selectedPresetId),
    notes: summarizeProjectNotes(bundle),
  });

  if (state.beatArrayBuffer) {
    const beatPath = window.PunchLabProjectZip.createProjectZipBeatAssetPath(usedPaths, state.beatFileName || "beat");
    files[beatPath] = state.beatArrayBuffer;
    manifest.beat = window.PunchLabProjectZip.createProjectZipBeatManifestEntry({
      path: beatPath,
      fileName: state.beatFileName || "beat",
      bytes: state.beatArrayBuffer.byteLength,
    });
  }

  const allTakes = getAllTakes();
  for (let index = 0; index < allTakes.length; index += 1) {
    const take = allTakes[index];
    if (!take.blob) {
      continue;
    }

    const takeName = getTakeShortName(take);
    const takePath = window.PunchLabProjectZip.createProjectZipTakeAssetPath(usedPaths, {
      index,
      trackName: take.trackName,
      takeName,
      extension: take.extension || "wav",
    });
    const data = await take.blob.arrayBuffer();
    files[takePath] = data;
    const track = findTrack(take.trackId);
    const sourceTake = take.sourceTakeId ? findTake(take.sourceTakeId) : null;
    const processedChain = summarizeProcessedChain(take);
    manifest.takes.push(window.PunchLabProjectZip.createProjectZipTakeManifestEntry({
      take,
      path: takePath,
      name: takeName,
      sourceTakeName: sourceTake ? getTakeShortName(sourceTake) : null,
      processedChain,
      regionColor: getTakeRegionColor(take),
      regionGroup: getTakeRegionGroup(take),
      trackVolume: getTrackOutputVolume(track),
      pan: Number(track?.pan || 0),
      clipGain: getTakeClipGain(take),
      visibleDuration: getTakeVisibleDuration(take),
      sourceOffset: getTakeSourceOffset(take),
      sourceDuration: getTakeSourceDuration(take),
      fadeIn: getTakeFadeIn(take),
      fadeOut: getTakeFadeOut(take),
      automationState: processedChain?.automationState || summarizeAutomationState(take.chainSnapshot?.automationState),
      bytes: data.byteLength,
    }));
  }

  manifest.markers = window.PunchLabProjectZip.createProjectZipMarkerManifestEntries(bundle.markers);
  return window.PunchLabProjectZip.finalizeProjectZipArchiveFiles(files, {
    manifest,
    previewHtml: buildProjectZipPreviewHtml(manifest, bundle, projectFilename),
    readmeText: window.PunchLabProjectZip.buildProjectZipReadme(projectFilename),
  });
}

function buildProjectZipPreviewHtml(manifest, bundle, projectFilename) {
  const settings = bundle.settings || {};
  const metadata = settings.exportMetadata || {};
  return window.PunchLabProjectZip.buildProjectZipPreviewHtml({
    manifest,
    projectFilename,
    title: metadata.title || state.beatFileName || "PunchLab Session",
    artist: metadata.artist || "PunchLab",
    bpm: settings.bpm || Number(els.bpmInput.value) || 140,
    key: settings.key || els.keySelect.value || "C minor",
  });
}

function summarizePresetManifest(presetList = [], selectedPresetId = "") {
  return (Array.isArray(presetList) ? presetList : [])
    .map(normalizePreset)
    .map((preset) => {
      const tuneSettings = getTuneSettingsForPreset(preset);
      return {
        id: preset.id,
        name: preset.name,
        custom: Boolean(preset.custom),
        selected: preset.id === selectedPresetId,
        retune: preset.retune,
        humanize: preset.humanize,
        comp: preset.comp,
        saturation: preset.saturation,
        space: preset.space,
        delay: preset.delay,
        reverb: preset.reverb,
        width: preset.width,
        lowEq: preset.lowEq,
        midEq: preset.midEq,
        airEq: preset.airEq,
        limiterCeiling: preset.limiterCeiling,
        tuneSignature: getTuneSignature(tuneSettings),
      };
    });
}

function summarizeSessionManifest(bundle = {}) {
  const settings = bundle.settings || {};
  const track = (bundle.tracks || []).find((item) => item.id === settings.armedTrackId);
  const targetMidi = Number.isFinite(Number(settings.targetMidi)) ? Number(settings.targetMidi) : null;
  return {
    bpm: Number(settings.bpm) || 140,
    key: settings.key || "C minor",
    scaleMode: settings.scaleMode || "minor",
    targetMidi,
    targetNote: targetMidi === null ? "Scale nearest" : formatPitchNote(targetMidi),
    countInBars: Number(settings.countIn) || 0,
    timelineSnap: normalizeTimelineSnapMode(settings.timelineSnap || "off"),
    armedTrackId: settings.armedTrackId || "main",
    armedTrackName: track?.name || settings.armedTrackId || "Main",
    punchEnabled: Boolean(settings.punchEnabled),
    loopEnabled: Boolean(settings.loopEnabled),
    metronomeEnabled: Boolean(settings.metronomeEnabled),
    punchIn: Number(settings.punchIn) || 0,
    punchOut: Number(settings.punchOut) || 0,
    recordLatencyMs: Number(settings.recordLatencyMs) || 0,
    nativeBufferSize: Number(settings.nativeBufferSize) || null,
  };
}

function getTuneSettingsForPreset(preset) {
  return {
    retuneSpeed: preset.retune,
    humanize: preset.humanize,
    vibrato: preset.vibrato,
    formant: preset.formant,
    gate: preset.gate,
    deEss: preset.deEss,
    comp: preset.comp,
    compThreshold: preset.compThreshold,
    compRatio: preset.compRatio,
    saturation: preset.saturation,
    space: preset.space,
    delay: preset.delay,
    reverb: preset.reverb,
    width: preset.width,
    lowEq: preset.lowEq,
    midEq: preset.midEq,
    airEq: preset.airEq,
    limiterCeiling: preset.limiterCeiling,
  };
}

function summarizeProjectNotes(bundle = {}) {
  const settings = bundle.settings || {};
  const markers = normalizeMarkers(bundle.markers || []);
  const scratchLyrics = String(settings.lyrics || "");
  const sessionNotes = String(settings.sessionNotes || "");
  const markerLyricLines = markers.reduce((count, marker) => count + getLyricLineCount(marker.lyrics), 0);
  return {
    scratchLyrics,
    sessionNotes,
    scratchLyricLines: getLyricLineCount(scratchLyrics),
    sessionNoteLines: getLyricLineCount(sessionNotes),
    markerLyricLines,
    totalLyricLines: getLyricLineCount(scratchLyrics) + markerLyricLines,
  };
}

function summarizeExportSettings() {
  const report = state.loudnessReport;
  const stale = report ? report.sourceSignature !== getMixSourceSignature() : false;
  return {
    metadata: getExportMetadata(),
    wav: {
      bitDepth: getExportBitDepth(),
      format: "wav",
    },
    normalize: {
      enabled: Boolean(els.exportNormalizeInput?.checked),
      targetPeakDbfs: -1,
      lastGainDb: gainToDb(state.lastExportNormalizeGain),
    },
    loudnessNormalize: {
      enabled: Boolean(els.exportLoudnessNormalizeInput?.checked),
      targetLufs: -14,
      lastGainDb: gainToDb(state.lastExportLoudnessGain),
    },
    analysis: report
      ? {
        stale,
        integratedLufs: Number(report.integratedLufs || 0),
        peakDbfs: Number(report.peakDbfs || 0),
        truePeakDbfs: Number(report.truePeakDbfs ?? report.peakDbfs ?? 0),
        clippingSamples: Number(report.clippingSamples || 0),
        recommendedGainDb: Number(report.recommendedGainDb || 0),
      }
      : null,
  };
}

function summarizePluginHostScan() {
  const result = state.pluginScanResult;
  const plugins = Array.isArray(result?.plugins) ? result.plugins : [];
  const formats = Array.isArray(result?.formats) ? result.formats : [];
  return {
    manifest: "plugin-host-manifest.json",
    scanAvailable: Boolean(window.PunchLabDesktop?.getReadiness?.()?.pluginHost?.scanAvailable),
    methodAvailable: Boolean(window.PunchLabDesktop?.getReadiness?.()?.pluginHost?.methodAvailable),
    capabilityReady: Boolean(window.PunchLabDesktop?.getReadiness?.()?.pluginHost?.capabilityReady),
    hostReady: Boolean(result?.pluginHostReady || window.PunchLabDesktop?.getReadiness?.()?.pluginHost?.ready),
    scanned: Boolean(result),
    scannedAt: result?.scannedAt || null,
    fixture: Boolean(result?.fixture),
    source: result?.source || (result?.fixture ? "fixture" : "runtime"),
    formats: formats.map((format) => String(format)),
    pluginCount: plugins.length,
  };
}

function summarizeAutomationParameterManifest() {
  const manifest = window.PunchLabChainParams?.getAutomationManifest?.();
  if (!manifest?.parameters?.length) {
    return null;
  }

  return {
    version: Number(manifest.version || 1),
    parameters: manifest.parameters.map((parameter) => ({
      automationId: String(parameter.automationId || ""),
      defaultValue: Number(parameter.defaultValue || 0),
      group: String(parameter.group || ""),
      id: String(parameter.id || ""),
      label: String(parameter.label || ""),
      max: Number(parameter.max || 0),
      min: Number(parameter.min || 0),
      step: Number(parameter.step || 1),
      unit: String(parameter.unit || ""),
    })),
  };
}

function summarizeNativeAudioEnvironment() {
  const readiness = window.PunchLabDesktop?.getReadiness?.();
  const latencyStats = readiness?.latencyControl?.stats || null;
  const nativeAudio = readiness?.nativeAudioEngine || {};
  const loadedNativeAudio = state.loadedProjectEnvironment?.nativeAudio || null;
  const statsUpdatedAt = readiness?.latencyControl?.statsUpdatedAt ?? loadedNativeAudio?.statsUpdatedAt ?? null;
  return {
    driver: readiness?.engineDriver?.id || "web-audio",
    fixture: Boolean(nativeAudio.fixture || readiness?.engineDriver?.capabilities?.nativeFixture),
    nativeAvailable: Boolean(readiness?.nativeAvailable),
    preferredBufferSize: nativeAudio.preferredRuntimeBufferSize || state.nativeBufferSize,
    roundTripLatencyMs: nativeAudio.runtimeRoundTripLatencyMs ?? loadedNativeAudio?.roundTripLatencyMs ?? null,
    loadedRoundTripLatencyMs: loadedNativeAudio?.roundTripLatencyMs ?? null,
    statsUpdatedAt,
    stats: latencyStats
      ? {
        inputLatencyMs: latencyStats.inputLatencyMs,
        outputLatencyMs: latencyStats.outputLatencyMs,
        roundTripLatencyMs: latencyStats.roundTripLatencyMs,
        bufferSize: latencyStats.bufferSize,
        sampleRate: latencyStats.sampleRate,
      }
      : loadedNativeAudio?.stats || null,
  };
}

function summarizeDesktopReadinessEnvironment() {
  const readiness = window.PunchLabDesktop?.getReadiness?.();
  const loadedDesktop = state.loadedProjectEnvironment?.desktopReadiness || null;
  if (!readiness) {
    return loadedDesktop;
  }
  const handoffStages = readiness.wrapper?.handoffStages || readiness.handoffStages || [];

  return {
    summary: readiness.summary || null,
    nativeAvailable: Boolean(readiness.nativeAvailable),
    desktopReady: Boolean(readiness.desktopReady),
    wrapper: readiness.wrapper
      ? {
        status: readiness.wrapper.status || null,
        summary: readiness.wrapper.summary || null,
      }
      : null,
    nativeAudioEngine: readiness.nativeAudioEngine
      ? {
        ready: Boolean(readiness.nativeAudioEngine.ready),
        fixture: Boolean(readiness.nativeAudioEngine.fixture),
        detail: readiness.nativeAudioEngine.detail || null,
      }
      : null,
    inputMonitoring: readiness.inputMonitoring
      ? {
        methodAvailable: Boolean(readiness.inputMonitoring.methodAvailable),
        ready: Boolean(readiness.inputMonitoring.ready),
        capabilityReady: Boolean(readiness.inputMonitoring.capabilityReady),
        fallback: readiness.inputMonitoring.fallback || null,
        summary: readiness.inputMonitoring.summary || null,
      }
      : null,
    pluginHost: readiness.pluginHost
      ? {
        scanAvailable: Boolean(readiness.pluginHost.scanAvailable),
        methodAvailable: Boolean(readiness.pluginHost.methodAvailable),
        ready: Boolean(readiness.pluginHost.ready),
        capabilityReady: Boolean(readiness.pluginHost.capabilityReady),
        summary: readiness.pluginHost.summary || null,
      }
      : null,
    handoffStages: Array.isArray(handoffStages)
      ? handoffStages.map((stage) => ({
        id: stage.id,
        status: stage.status,
      }))
      : [],
  };
}

function getProjectEnvironment() {
  return {
    nativeAudio: summarizeNativeAudioEnvironment(),
    desktopReadiness: summarizeDesktopReadinessEnvironment(),
  };
}

function summarizeProcessedChain(take) {
  if (!take?.processed) {
    return null;
  }

  const snapshot = take.chainSnapshot || {};
  const tuneSettings = take.tuneSettings || snapshot.tuneSettings || null;
  const renderVersion = Number(take.version || 1);
  return {
    renderVersion: Number.isFinite(renderVersion) ? renderVersion : 1,
    renderLabel: take.renderLabel || `${take.presetName || "Processed"} v${Number.isFinite(renderVersion) ? renderVersion : 1}`,
    presetId: take.presetId || null,
    presetName: take.presetName || snapshot.preset?.name || null,
    tuneSignature: tuneSettings ? getTuneSignature(tuneSettings) : null,
    key: snapshot.key || null,
    scaleMode: snapshot.scaleMode || null,
    customScaleIntervals: Array.isArray(snapshot.customScaleIntervals) ? [...snapshot.customScaleIntervals] : null,
    automationState: summarizeAutomationState(snapshot.automationState),
  };
}

function summarizeAutomationState(automationState) {
  if (!automationState?.parameters?.length) {
    return null;
  }

  return {
    version: Number(automationState.version || 1),
    metadata: { ...(automationState.metadata || {}) },
    parameters: automationState.parameters.map((parameter) => ({
      automationId: String(parameter.automationId || ""),
      id: String(parameter.id || ""),
      value: Number(parameter.value || 0),
    })),
  };
}

async function loadProject(event) {
  const [file] = event.target.files;
  if (!file || !window.PunchLabProject) {
    return;
  }

  try {
    await loadProjectFile(file);
  } finally {
    els.projectInput.value = "";
  }
}

async function openProject() {
  if (!window.PunchLabProject) {
    els.sessionState.textContent = "Project module missing";
    return;
  }
  if (!window.PunchLabFiles?.openProjectFile) {
    els.projectInput.click();
    return;
  }

  try {
    els.openProjectButton.disabled = true;
    const result = await window.PunchLabPlatform?.openProjectFile?.() || await window.PunchLabFiles.openProjectFile(els.projectInput);
    if (result.canceled) {
      els.sessionState.textContent = "Open canceled";
      return;
    }
    if (result.file) {
      await loadProjectFile(result.file);
    }
  } finally {
    els.openProjectButton.disabled = false;
  }
}

async function loadProjectFile(file) {
  if (!file || !window.PunchLabProject) {
    return;
  }

  try {
    els.sessionState.textContent = "Opening project";
    stopAll();
    const bundle = JSON.parse(await file.text());
    const project = await window.PunchLabProject.hydrateProjectBundle(bundle);
    applyLoadedProject(project);
    els.sessionState.textContent = "Project opened";
    scheduleAutosave();
  } catch (error) {
    els.sessionState.textContent = "Open failed";
    console.error(error);
  }
}

async function recoverAutosave() {
  if (!window.PunchLabStorage || !window.PunchLabProject) {
    return;
  }

  try {
    els.sessionState.textContent = "Recovering";
    const selectedRecovery = els.recoverySelect?.value || "autosave";
    let candidates = [];
    if (selectedRecovery.startsWith("backup:")) {
      const backupId = selectedRecovery.slice("backup:".length);
      const backup = await window.PunchLabStorage.loadBackup?.(backupId);
      candidates = [{ label: "Backup", bundle: backup?.bundle }].filter((candidate) => candidate.bundle);
    } else {
      const autosaveBundle = await window.PunchLabStorage.loadAutosave();
      const backup = await window.PunchLabStorage.loadLatestBackup?.();
      candidates = [
        { label: "Autosave", bundle: autosaveBundle },
        { label: "Backup", bundle: backup?.bundle },
      ].filter((candidate) => candidate.bundle);
    }

    if (!candidates.length) {
      els.sessionState.textContent = "No recovery";
      state.hasAutosave = false;
      updateRecoveryButton();
      return;
    }

    let recoveredProject = null;
    let recoveredLabel = "";
    let recoveryError = null;
    for (const candidate of candidates) {
      try {
        recoveredProject = await window.PunchLabProject.hydrateProjectBundle(candidate.bundle);
        recoveredLabel = candidate.label;
        break;
      } catch (error) {
        recoveryError = error;
      }
    }

    if (!recoveredProject) {
      throw recoveryError || new Error("Recovery bundle failed.");
    }

    stopAll();
    applyLoadedProject(recoveredProject);
    els.sessionState.textContent = `${recoveredLabel} recovered`;
    await checkAutosave();
  } catch (error) {
    els.sessionState.textContent = "Recovery failed";
    console.error(error);
  }
}

async function checkAutosave() {
  if (!window.PunchLabStorage) {
    return;
  }

  try {
    state.hasAutosave = window.PunchLabStorage.hasRecovery
      ? await window.PunchLabStorage.hasRecovery()
      : await window.PunchLabStorage.hasAutosave();
    state.backupHistory = window.PunchLabStorage.listBackups ? await window.PunchLabStorage.listBackups() : [];
    renderRecoverySelect();
    updateRecoveryButton();
  } catch (error) {
    console.error(error);
  }
}

function scheduleAutosave() {
  if (!window.PunchLabProject || !window.PunchLabStorage) {
    return;
  }

  window.clearTimeout(state.autosaveTimer);
  state.autosaveTimer = window.setTimeout(saveCurrentAutosave, 1400);
}

async function saveCurrentAutosave() {
  if (state.isAutosaving || !window.PunchLabProject || !window.PunchLabStorage) {
    return;
  }

  try {
    state.isAutosaving = true;
    updateRecoveryButton();
    const bundle = await window.PunchLabProject.buildProjectBundle({
      state,
      tracks,
      presets,
      settings: getProjectSettings(),
      environment: getProjectEnvironment(),
    });
    await window.PunchLabStorage.saveAutosave(bundle);
    const now = Date.now();
    if (window.PunchLabStorage.saveBackup && now - state.lastBackupAt > 60000) {
      await window.PunchLabStorage.saveBackup(bundle);
      state.lastBackupAt = now;
      state.backupHistory = window.PunchLabStorage.listBackups ? await window.PunchLabStorage.listBackups() : state.backupHistory;
      renderRecoverySelect();
    }
    state.hasAutosave = true;
  } catch (error) {
    console.error(error);
  } finally {
    state.isAutosaving = false;
    updateRecoveryButton();
  }
}

function updateRecoveryButton() {
  if (!els.recoverProjectButton) {
    return;
  }

  els.recoverProjectButton.disabled = state.isAutosaving || !state.hasAutosave;
  if (els.recoverySelect) {
    els.recoverySelect.disabled = state.isAutosaving || !state.hasAutosave;
  }
}

function renderRecoverySelect() {
  if (!els.recoverySelect) {
    return;
  }

  const currentValue = els.recoverySelect.value || "autosave";
  const backupOptions = state.backupHistory.map((backup, index) => ({
    label: formatBackupHistoryLabel(backup, index),
    value: `backup:${backup.id}`,
  }));
  const values = ["autosave", ...backupOptions.map((option) => option.value)];
  const options = [
    `<option value="autosave">Autosave</option>`,
    ...backupOptions.map((option) => `<option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>`),
  ];
  els.recoverySelect.innerHTML = options.join("");
  els.recoverySelect.value = values.includes(currentValue) ? currentValue : "autosave";
}

function formatBackupHistoryLabel(backup, index) {
  const when = backup.savedAt ? new Date(backup.savedAt) : null;
  const time = when && !Number.isNaN(when.getTime())
    ? when.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : `Backup ${index + 1}`;
  const name = backup.title || backup.beatName || `Backup ${index + 1}`;
  return `${time} ${name}`;
}

function applyLoadedProject(project) {
  revokeCurrentProjectAssets();
  state.loadedProjectEnvironment = project.environment || null;

  if (project.beat) {
    state.beatArrayBuffer = project.beat.arrayBuffer;
    state.beatFileName = project.beat.fileName;
    state.beatUrl = URL.createObjectURL(project.beat.blob);
    els.beatAudio.src = state.beatUrl;
    applyPlaybackOutput(els.beatAudio);
    els.beatName.textContent = project.beat.fileName;
  } else {
    state.beatArrayBuffer = null;
    state.beatFileName = "";
    state.beatUrl = "";
    els.beatAudio.removeAttribute("src");
    els.beatAudio.load();
    els.beatName.textContent = "MP3, WAV, M4A";
  }

  tracks.splice(
    0,
    tracks.length,
    ...project.tracks.map((track) => ({
      ...track,
      takes: track.takes.map((take) => {
        const hydratedTake = {
          ...take,
          trackName: take.trackName || track.name,
          url: URL.createObjectURL(take.blob),
        };
        normalizeTakeTrim(hydratedTake);
        return hydratedTake;
      }),
    })),
  );

  if (project.presets?.length) {
    presets.splice(0, presets.length, ...project.presets.map(normalizePreset));
    renderPresets();
  }

  applyProjectSettings(project.settings);
  state.markers = normalizeMarkers(project.markers);
  clearTimelineHistory();
  state.latestTake = getAllTakes().at(-1) || null;
  state.recordWaveform = state.latestTake?.waveform ? [...state.latestTake.waveform] : [];
  state.selectedVocalTakeId = state.latestTake?.id || null;
  els.downloadLatestButton.disabled = !state.latestTake;
  renderTracks();
  renderArmTracks();
  renderTakes();
  renderVocalPanel();
  renderTimeline();
  renderLyrics();
  updateQueueButton();
  updateExportButtons();
  scheduleAutosave();
}

function revokeCurrentProjectAssets() {
  if (state.beatUrl) {
    URL.revokeObjectURL(state.beatUrl);
  }

  tracks.forEach((track) => {
    track.takes.forEach((take) => {
      if (take.url) {
        URL.revokeObjectURL(take.url);
      }
    });
  });
}

function getProjectSettings() {
  return {
    bpm: Number(els.bpmInput.value) || 140,
    countIn: els.countInSelect.value,
    key: els.keySelect.value,
    scaleMode: els.scaleModeSelect.value,
    targetMidi: getTargetMidiValue(),
    customScaleIntervals: [...state.customScaleIntervals],
    inputGain: state.inputGain,
    audioInputDeviceId: state.audioInputDeviceId,
    audioOutputDeviceId: state.audioOutputDeviceId,
    nativeBufferSize: state.nativeBufferSize,
    armedTrackId: state.armedTrackId,
    trackFolderCollapsed: normalizeTrackFolderCollapsed(state.trackFolderCollapsed),
    selectedPresetId: state.selectedPresetId,
    tune: getTuneSettings(),
    exportMetadata: getExportMetadata(),
    exportBitDepth: getExportBitDepth(),
    exportNormalize: els.exportNormalizeInput.checked,
    exportLoudnessNormalize: els.exportLoudnessNormalizeInput.checked,
    lyrics: els.lyricsInput.value,
    sessionNotes: els.sessionNotesInput.value,
    timelineSnap: getTimelineSnapMode(),
    punchEnabled: state.punchEnabled,
    loopEnabled: state.loopEnabled,
    metronomeEnabled: state.metronomeEnabled,
    recordLatencyMs: state.recordLatencyMs,
    punchIn: state.punchIn,
    punchOut: state.punchOut,
  };
}

function applyProjectSettings(settings = {}) {
  els.bpmInput.value = settings.bpm || 140;
  els.countInSelect.value = settings.countIn || "0";
  els.keySelect.value = settings.key || "C minor";
  els.scaleModeSelect.value = settings.scaleMode || "minor";
  els.targetMidiSelect.value = settings.targetMidi == null ? "" : String(settings.targetMidi);
  state.customScaleIntervals = normalizeScaleIntervals(settings.customScaleIntervals);
  els.exportArtistInput.value = settings.exportMetadata?.artist || "";
  els.exportTitleInput.value = settings.exportMetadata?.title || "";
  els.exportBitDepthSelect.value = String(normalizeExportBitDepth(settings.exportBitDepth));
  els.exportNormalizeInput.checked = settings.exportNormalize !== false;
  els.exportLoudnessNormalizeInput.checked = Boolean(settings.exportLoudnessNormalize);
  els.lyricsInput.value = settings.lyrics || "";
  els.sessionNotesInput.value = settings.sessionNotes || "";
  els.timelineSnapSelect.value = normalizeTimelineSnapMode(settings.timelineSnap || "off");
  els.inputGainSlider.value = settings.inputGain || 2;
  state.audioInputDeviceId = settings.audioInputDeviceId || "";
  state.audioOutputDeviceId = settings.audioOutputDeviceId || "";
  state.nativeBufferSize = normalizeNativeBufferSize(
    settings.nativeBufferSize ?? state.loadedProjectEnvironment?.nativeAudio?.preferredBufferSize,
  );
  els.nativeBufferSizeSelect.value = String(state.nativeBufferSize);
  applyNativeBufferSize();
  els.audioInputSelect.value = state.audioInputDeviceId;
  els.audioOutputSelect.value = state.audioOutputDeviceId;
  state.armedTrackId = tracks.some((track) => track.id === settings.armedTrackId)
    ? settings.armedTrackId
    : tracks[0]?.id || "main";
  state.trackFolderCollapsed = normalizeTrackFolderCollapsed(settings.trackFolderCollapsed);
  state.punchEnabled = Boolean(settings.punchEnabled);
  state.loopEnabled = Boolean(settings.loopEnabled);
  state.metronomeEnabled = Boolean(settings.metronomeEnabled);
  state.recordLatencyMs = Math.max(0, Number(settings.recordLatencyMs || 0));
  els.recordLatencyInput.value = state.recordLatencyMs;
  state.punchIn = Number(settings.punchIn || 0);
  state.punchOut = Number(settings.punchOut || 4);

  if (settings.selectedPresetId && presets.some((preset) => preset.id === settings.selectedPresetId)) {
    applyPreset(settings.selectedPresetId);
  }

  if (settings.tune) {
    els.retuneSpeedSlider.value = settings.tune.retuneSpeed ?? els.retuneSpeedSlider.value;
    els.humanizeSlider.value = settings.tune.humanize ?? els.humanizeSlider.value;
    els.vibratoSlider.value = settings.tune.vibrato ?? els.vibratoSlider.value;
    els.formantSlider.value = settings.tune.formant ?? els.formantSlider.value;
    els.gateSlider.value = settings.tune.gate ?? els.gateSlider.value;
    els.deEssSlider.value = settings.tune.deEss ?? els.deEssSlider.value;
    els.compSlider.value = settings.tune.comp ?? els.compSlider.value;
    els.compThresholdSlider.value = settings.tune.compThreshold ?? els.compThresholdSlider.value;
    els.compRatioSlider.value = settings.tune.compRatio ?? els.compRatioSlider.value;
    els.compAttackSlider.value = settings.tune.compAttack ?? els.compAttackSlider.value;
    els.compReleaseSlider.value = settings.tune.compRelease ?? els.compReleaseSlider.value;
    if (
      settings.tune.compThreshold == null ||
      settings.tune.compRatio == null ||
      settings.tune.compAttack == null ||
      settings.tune.compRelease == null
    ) {
      syncCompDetailDefaults();
    }
    els.saturationSlider.value = settings.tune.saturation ?? els.saturationSlider.value;
    els.spaceSlider.value = settings.tune.space ?? els.spaceSlider.value;
    els.delaySlider.value = settings.tune.delay ?? els.delaySlider.value;
    els.reverbSlider.value = settings.tune.reverb ?? els.reverbSlider.value;
    els.widthSlider.value = settings.tune.width ?? els.widthSlider.value;
    els.lowEqSlider.value = settings.tune.lowEq ?? els.lowEqSlider.value;
    els.midEqSlider.value = settings.tune.midEq ?? els.midEqSlider.value;
    els.airEqSlider.value = settings.tune.airEq ?? els.airEqSlider.value;
    els.limiterCeilingSlider.value = settings.tune.limiterCeiling ?? els.limiterCeilingSlider.value;
    updateTuneControls();
  }

  updateInputGain();
  updatePunchControls();
}

function updateInputGain() {
  state.inputGain = Number(els.inputGainSlider.value);
  els.inputGainText.textContent = formatGainDb(state.inputGain);

  if (state.gainNode && state.audioContext) {
    state.gainNode.gain.setTargetAtTime(state.inputGain, state.audioContext.currentTime, 0.01);
  }
}

function togglePunchMode() {
  state.punchEnabled = !state.punchEnabled;
  updatePunchControls();
  scheduleAutosave();
}

function toggleLoopMode() {
  state.loopEnabled = !state.loopEnabled;
  updatePunchControls();
  scheduleAutosave();
}

function toggleMetronome() {
  state.metronomeEnabled = !state.metronomeEnabled;
  updatePunchControls();
  if (state.metronomeEnabled && (state.isRecording || state.isSessionPlaying)) {
    startMetronome();
  } else if (!state.metronomeEnabled) {
    stopMetronome();
  }
  scheduleAutosave();
}

function updatePunchFromInputs() {
  state.punchIn = Math.max(0, Number(els.punchInInput.value) || 0);
  state.punchOut = Math.max(0, Number(els.punchOutInput.value) || 0);
  updatePunchControls(false);
  scheduleAutosave();
}

function updateRecordLatency() {
  state.recordLatencyMs = Math.max(0, Number(els.recordLatencyInput.value) || 0);
  scheduleAutosave();
}

async function applyNativeBufferSize() {
  window.PunchLabPlatform?.setNativeBufferSizePreference?.(state.nativeBufferSize);
  try {
    const result = await window.PunchLabPlatform?.setBufferSize?.(state.nativeBufferSize);
    await window.PunchLabPlatform?.refreshLatencyStats?.();
    if (result?.supported) {
      renderEngineStatus();
    }
    return Boolean(result?.supported);
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function changeNativeBufferSize() {
  state.nativeBufferSize = normalizeNativeBufferSize(els.nativeBufferSizeSelect.value);
  els.nativeBufferSizeSelect.value = String(state.nativeBufferSize);
  scheduleAutosave();
  const supported = await applyNativeBufferSize();
  els.sessionState.textContent = supported
    ? `Buffer ${state.nativeBufferSize}`
    : "Buffer saved";
}

function normalizeNativeBufferSize(value) {
  const size = Number(value || 128);
  return [64, 128, 256, 512, 1024].includes(size) ? size : 128;
}

function setPunchPoint(point) {
  const position = getCurrentSessionPosition();
  if (point === "in") {
    state.punchIn = Math.max(0, position);
    if (state.punchOut <= state.punchIn) {
      state.punchOut = state.punchIn + 4;
    }
  } else {
    state.punchOut = Math.max(state.punchIn + 0.1, position);
  }

  updatePunchControls();
  scheduleAutosave();
}

function updatePunchControls(syncInputs = true) {
  const isValid = state.punchOut > state.punchIn;

  if (syncInputs) {
    els.punchInInput.value = state.punchIn.toFixed(1);
    els.punchOutInput.value = state.punchOut.toFixed(1);
  }

  els.punchToggle.classList.toggle("active", state.punchEnabled);
  els.loopToggle.classList.toggle("active", state.loopEnabled);
  els.metronomeToggle.classList.toggle("active", state.metronomeEnabled);
  els.punchToggle.setAttribute("aria-pressed", String(state.punchEnabled));
  els.loopToggle.setAttribute("aria-pressed", String(state.loopEnabled));
  els.metronomeToggle.setAttribute("aria-pressed", String(state.metronomeEnabled));
  els.punchStatus.textContent = state.punchEnabled ? (isValid ? "Ready" : "Check range") : "Off";
  els.punchWindowText.textContent = `${formatDuration(state.punchIn)} - ${formatDuration(state.punchOut)}`;
}

function getCountInSeconds() {
  const bars = Number(els.countInSelect.value) || 0;
  const bpm = Number(els.bpmInput.value) || 140;
  return bars * 4 * (60 / bpm);
}

function clearPunchTimers() {
  state.punchTimers.forEach((timer) => window.clearTimeout(timer));
  state.punchTimers = [];
}

function cancelPunchWait() {
  clearPunchTimers();
  state.isPunchWaiting = false;
  els.countdown.hidden = true;
  els.recordButton.classList.remove("armed");
}

async function toggleSessionPlayback() {
  if (state.isSessionPlaying) {
    stopSessionPlayback();
    els.sessionState.textContent = "Mix paused";
    return;
  }

  await playSession();
}

async function playSession() {
  const audibleTakes = getAllTakes().filter((take) => getTrackOutputVolume(findTrack(take.trackId)) > 0);

  if (!els.beatAudio.src && !audibleTakes.length) {
    els.sessionState.textContent = "Load beat";
    return;
  }

  stopTakeQueue(false);
  stopCurrentTake(false);
  stopSessionPlayback(false);
  await ensureAudioContext();

  const loopRangeValid = state.loopEnabled && state.punchOut > state.punchIn;
  let origin = loopRangeValid ? state.punchIn : els.beatAudio.src ? els.beatAudio.currentTime : 0;
  if (els.beatAudio.src && Number.isFinite(els.beatAudio.duration) && origin >= els.beatAudio.duration - 0.05) {
    origin = 0;
  }
  if (!els.beatAudio.src && audibleTakes.length) {
    origin = Math.min(...audibleTakes.map((take) => take.startTime || 0));
  }

  state.isSessionPlaying = true;
  state.sessionOrigin = origin;
  state.sessionStartedAt = performance.now();
  state.sessionPlayers = [];
  state.sessionPlayingTakeIds = new Set();
  updateSessionPlayButton();

  if (els.beatAudio.src) {
    els.beatAudio.currentTime = origin;
    els.beatAudio.volume = 1;
    await applyPlaybackOutput(els.beatAudio);
    try {
      await els.beatAudio.play();
    } catch (error) {
      stopSessionPlayback();
      els.sessionState.textContent = "Playback blocked";
      console.error(error);
      return;
    }
  }

  audibleTakes.forEach((take) => {
    const takeStart = take.startTime || 0;
    const takeDuration = getTakeVisibleDuration(take);
    const offset = Math.max(0, origin - takeStart);
    const delay = takeStart - origin;
    if (offset >= takeDuration) {
      return;
    }

    if (delay <= 0) {
      startSessionTake(take, offset);
      return;
    }

    const timer = window.setTimeout(() => {
      startSessionTake(take, 0);
    }, delay * 1000);
    state.sessionTimers.push(timer);
  });

  const endPosition = loopRangeValid ? state.punchOut : getSessionEndPosition();
  if (endPosition > origin) {
    state.sessionEndTimer = window.setTimeout(() => {
      if (state.isSessionPlaying) {
        if (loopRangeValid) {
          stopSessionPlayback(false);
          if (els.beatAudio.src) {
            els.beatAudio.currentTime = state.punchIn;
          }
          playSession();
          return;
        }

        stopSessionPlayback();
        els.sessionState.textContent = "Mix ended";
      }
    }, (endPosition - origin) * 1000 + 180);
  }

  els.sessionState.textContent = "Mix playing";
  startMetronome();
  renderTracks();
  renderTakes();
}

async function startSessionTake(take, offset) {
  if (!state.isSessionPlaying) {
    return;
  }

  const track = findTrack(take.trackId);
  const takeDuration = getTakeVisibleDuration(take);
  if (!track || getTrackOutputVolume(track) <= 0 || offset >= takeDuration) {
    return;
  }

  const ctx = await ensureAudioContext();
  const audio = new Audio(take.url);
  await applyPlaybackOutput(audio);
  const sourceOffset = getTakeSourceOffset(take);
  const remainingDuration = Math.max(0, takeDuration - offset);
  audio.currentTime = Math.max(0, Math.min(sourceOffset + offset, Math.max(0, sourceOffset + takeDuration - 0.05)));

  const source = ctx.createMediaElementSource(audio);
  const gain = ctx.createGain();
  const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
  const player = { takeId: take.id, trackId: track.id, take, audio, source, gain, panner, stopTimer: 0 };

  applyTakeGainAutomation(gain.gain, getTrackOutputVolume(track) * getTakeClipGain(take), take, offset, ctx.currentTime);
  source.connect(gain);
  if (panner) {
    panner.pan.value = track.pan;
    gain.connect(panner).connect(ctx.destination);
  } else {
    gain.connect(ctx.destination);
  }

  const cleanup = () => {
    removeSessionPlayer(player);
  };

  audio.addEventListener("ended", cleanup, { once: true });
  audio.addEventListener("error", cleanup, { once: true });

  state.sessionPlayers.push(player);
  state.sessionPlayingTakeIds.add(take.id);
  renderTracks();
  renderTakes();

  try {
    await audio.play();
    player.stopTimer = window.setTimeout(() => {
      audio.pause();
      removeSessionPlayer(player);
    }, remainingDuration * 1000 + 40);
  } catch (error) {
    removeSessionPlayer(player);
    els.sessionState.textContent = "Playback blocked";
    console.error(error);
  }
}

function removeSessionPlayer(player) {
  const index = state.sessionPlayers.indexOf(player);
  if (index >= 0) {
    state.sessionPlayers.splice(index, 1);
  }
  window.clearTimeout(player.stopTimer);

  state.sessionPlayingTakeIds.delete(player.takeId);
  try {
    player.source.disconnect();
    player.gain.disconnect();
    player.panner?.disconnect();
  } catch {
    // The node may already be disconnected by the browser.
  }

  renderTracks();
  renderTakes();
}

function stopSessionPlayback(shouldRender = true, resetBeat = false) {
  state.sessionTimers.forEach((timer) => window.clearTimeout(timer));
  state.sessionTimers = [];
  window.clearTimeout(state.sessionEndTimer);
  state.sessionEndTimer = 0;

  state.sessionPlayers.forEach((player) => {
    player.audio.pause();
    player.audio.currentTime = 0;
    try {
      player.source.disconnect();
      player.gain.disconnect();
      player.panner?.disconnect();
    } catch {
      // The node may already be disconnected by the browser.
    }
  });

  state.sessionPlayers = [];
  state.sessionPlayingTakeIds.clear();
  state.isSessionPlaying = false;
  if (!state.isRecording) {
    stopMetronome();
  }

  els.beatAudio.pause();
  if (resetBeat) {
    els.beatAudio.currentTime = 0;
  }

  updateSessionPlayButton();
  if (shouldRender) {
    renderTracks();
    renderTakes();
  }
}

function updateActiveSessionMix() {
  state.sessionPlayers.forEach((player) => {
    const track = findTrack(player.trackId);
    if (!track) {
      return;
    }

    const take = player.take || findTake(player.takeId);
    player.gain.gain.setTargetAtTime(getTrackOutputVolume(track) * getTakeClipGain(take), state.audioContext.currentTime, 0.01);
    if (player.panner) {
      player.panner.pan.setTargetAtTime(track.pan, state.audioContext.currentTime, 0.01);
    }
  });
}

function updateSessionPlayButton() {
  els.playButton.classList.toggle("session-active", state.isSessionPlaying);
  els.playButton.title = state.isSessionPlaying ? "Pause mix" : "Play mix";
}

function maintainLoopPlayback() {
  if (!state.loopEnabled || state.isRecording || state.isPunchWaiting || state.isSessionPlaying) {
    return;
  }

  if (state.punchOut <= state.punchIn || !els.beatAudio.src) {
    return;
  }

  if (els.beatAudio.currentTime >= state.punchOut) {
    els.beatAudio.currentTime = state.punchIn;
  }
}

async function playTake(takeId) {
  const take = findTake(takeId);
  if (!take) {
    return;
  }

  if (state.currentTakeId === takeId && state.currentTakeAudio && !state.currentTakeAudio.paused) {
    stopSessionPlayback(false);
    stopTakeQueue(false);
    stopCurrentTake();
    els.sessionState.textContent = "Take paused";
    return;
  }

  stopSessionPlayback(false);
  stopTakeQueue(false);
  await playTakeAudio(take, `Playing ${take.trackName}`);
}

function playLatestTake() {
  const latestTake = state.latestTake || getAllTakes().at(-1);
  if (!latestTake) {
    els.sessionState.textContent = "No take";
    return;
  }

  state.latestTake = latestTake;
  playTake(latestTake.id);
}

function sendLatestTakeToVocal() {
  const latestTake = state.latestTake || getAllTakes().at(-1);
  if (!latestTake) {
    els.sessionState.textContent = "No take";
    return;
  }

  sendTakeToVocal(latestTake.id);
}

function sendTakeToVocal(takeId) {
  const take = findTake(takeId);
  if (!take) {
    els.sessionState.textContent = "Take not found";
    return;
  }

  state.latestTake = take;
  state.selectedVocalTakeId = take.id;
  setActiveView("vocal");
  renderVocalPanel();
  els.sessionState.textContent = "Take sent to Vocal";
}

async function playTakeAudio(take, label) {
  stopCurrentTake(false);
  els.beatAudio.pause();
  const audio = new Audio(take.url);
  await applyPlaybackOutput(audio);
  const takeDuration = getTakeVisibleDuration(take);
  audio.currentTime = getTakeSourceOffset(take);
  audio.volume = Math.min(1, getTakeClipGain(take));
  state.currentTakeAudio = audio;
  state.currentTakeId = take.id;
  renderTracks();
  renderTakes();

  return new Promise((resolve) => {
    let settled = false;
    let stopTimer = 0;

    const finish = (status) => {
      if (settled) {
        return;
      }

      settled = true;
      window.clearTimeout(stopTimer);
      if (state.currentTakeAudio === audio) {
        state.currentTakeAudio = null;
        state.currentTakeId = null;
      }
      if (state.currentTakeResolve === finish) {
        state.currentTakeResolve = null;
      }

      if (status === "ended" && !state.isQueuePlaying) {
        els.sessionState.textContent = "Take ended";
      }

      renderTracks();
      renderTakes();
      resolve(status);
    };

    audio.addEventListener("ended", () => finish("ended"));
    audio.addEventListener("error", () => finish("error"));
    state.currentTakeResolve = finish;

    audio
      .play()
      .then(() => {
        stopTimer = window.setTimeout(() => {
          audio.pause();
          finish("ended");
        }, takeDuration * 1000 + 40);
        els.sessionState.textContent = label;
      })
      .catch((error) => {
        els.sessionState.textContent = "Playback blocked";
        console.error(error);
        finish("blocked");
      });
  });
}

async function toggleTakeQueue(mode = "all") {
  if (state.isQueuePlaying) {
    stopTakeQueue();
    els.sessionState.textContent = "Review stopped";
    return;
  }

  const queueTakes = mode === "comp" ? getCompTakes() : getAllTakes();
  if (!queueTakes.length) {
    els.sessionState.textContent = mode === "comp" ? "No comp takes" : "No takes";
    return;
  }

  stopSessionPlayback(false);
  state.isQueuePlaying = true;
  state.queueMode = mode;
  state.queueTakeIds = queueTakes.map((take) => take.id);
  state.queueIndex = 0;
  updateQueueButton();

  for (let index = 0; index < state.queueTakeIds.length; index += 1) {
    if (!state.isQueuePlaying) {
      break;
    }

    state.queueIndex = index;
    const take = findTake(state.queueTakeIds[index]);
    if (!take) {
      continue;
    }

    renderTracks();
    renderTakes();
    const labelPrefix = mode === "comp" ? "Comp" : "Review";
    const status = await playTakeAudio(take, `${labelPrefix} ${index + 1}/${state.queueTakeIds.length} ${take.trackName}`);
    if (status === "blocked" || status === "error") {
      break;
    }

    if (state.isQueuePlaying) {
      await wait(120);
    }
  }

  if (state.isQueuePlaying) {
    state.isQueuePlaying = false;
    state.queueMode = "all";
    state.queueTakeIds = [];
    state.queueIndex = -1;
    els.sessionState.textContent = "Review done";
    updateQueueButton();
    renderTracks();
    renderTakes();
  }
}

function stopTakeQueue(shouldRender = true) {
  state.isQueuePlaying = false;
  state.queueMode = "all";
  state.queueTakeIds = [];
  state.queueIndex = -1;
  stopCurrentTake(false);
  updateQueueButton();

  if (shouldRender) {
    renderTracks();
    renderTakes();
  }
}

function stopCurrentTake(shouldRender = true) {
  const finish = state.currentTakeResolve;
  if (state.currentTakeAudio) {
    state.currentTakeAudio.pause();
    state.currentTakeAudio.currentTime = 0;
  }

  state.currentTakeAudio = null;
  state.currentTakeId = null;
  state.currentTakeResolve = null;

  if (finish) {
    finish("stopped");
  }

  if (shouldRender) {
    renderTracks();
    renderTakes();
  }
}

function stopAll() {
  state.isLoopRecording = false;
  state.currentLoopCycle = false;
  cancelCountIn();
  if (state.isRecording) {
    stopRecording();
  }

  cancelPunchWait();
  stopTakeQueue(false);
  stopSessionPlayback(false, true);
  stopCurrentTake();
  stopExportPreview(false);
  els.beatAudio.pause();
  els.beatAudio.currentTime = 0;
  els.sessionState.textContent = "Stopped";
}

async function toggleRecord() {
  if (state.isCountInActive) {
    cancelCountIn();
    els.sessionState.textContent = "Count canceled";
    return;
  }

  if (state.isRecording) {
    state.isLoopRecording = false;
    stopRecording();
    return;
  }

  if (state.isPunchWaiting) {
    state.isLoopRecording = false;
    cancelPunchWait();
    els.sessionState.textContent = "Punch canceled";
    return;
  }

  if (!state.stream) {
    await enableMic();
  }

  if (!state.stream) {
    return;
  }

  if (state.punchEnabled) {
    state.isLoopRecording = state.loopEnabled && state.punchOut > state.punchIn;
    state.loopRecordTakeCount = 0;
    startPunchRecording({ loopCycle: state.isLoopRecording });
    return;
  }

  const bars = Number(els.countInSelect.value);
  if (bars > 0) {
    const completed = await countIn(bars);
    if (!completed) {
      return;
    }
  }

  startRecording();
}

async function startPunchRecording(options = {}) {
  if (state.punchOut <= state.punchIn) {
    els.sessionState.textContent = "Set punch out";
    state.isLoopRecording = false;
    return;
  }

  stopTakeQueue(false);
  stopSessionPlayback(false);
  stopCurrentTake(false);
  clearPunchTimers();
  await ensureAudioContext();

  const preRoll = options.skipPreRoll ? 0 : getCountInSeconds();
  const punchIn = state.punchIn;
  const punchOut = state.punchOut;
  const playStart = Math.max(0, punchIn - preRoll);
  const waitMs = Math.max(0, (punchIn - playStart) * 1000);
  const durationMs = Math.max(100, (punchOut - punchIn) * 1000);

  state.isPunchWaiting = true;
  els.recordButton.classList.add("armed");
  els.sessionState.textContent = options.loopCycle ? "Loop record armed" : "Punch armed";

  if (els.beatAudio.src) {
    els.beatAudio.currentTime = playStart;
    els.beatAudio.play().catch((error) => {
      console.error(error);
    });
  }

  if (waitMs > 0) {
    startPunchCountdown(waitMs);
  }

  const startTimer = window.setTimeout(() => {
    state.isPunchWaiting = false;
    els.recordButton.classList.remove("armed");
    els.countdown.hidden = true;
    startRecording({
      startPosition: punchIn,
      keepBeat: true,
      autoStopAfter: durationMs,
      punch: true,
      loopCycle: Boolean(options.loopCycle),
    });
  }, waitMs);

  state.punchTimers.push(startTimer);
}

function startPunchCountdown(waitMs) {
  const bpm = Number(els.bpmInput.value) || 140;
  const beatMs = 60000 / bpm;
  const startedAt = performance.now();

  els.countdown.hidden = false;

  const pulse = () => {
    const remaining = Math.max(0, waitMs - (performance.now() - startedAt));
    els.countdown.textContent = String(Math.max(1, Math.ceil(remaining / beatMs)));
    tick(remaining > waitMs - beatMs ? 880 : 660);
    if (remaining <= 0) {
      return;
    }

    state.punchTimers.push(window.setTimeout(pulse, beatMs));
  };

  pulse();
}

function startRecording(options = {}) {
  stopTakeQueue(false);
  if (!options.keepBeat) {
    stopSessionPlayback(false);
  }
  stopCurrentTake();
  state.chunks = [];
  const mediaOptions = state.mimeType ? { mimeType: state.mimeType } : undefined;
  const recordStream = state.processedStream || state.stream;
  state.mediaRecorder = new MediaRecorder(recordStream, mediaOptions);
  state.mediaRecorder.addEventListener("dataavailable", (event) => {
    if (event.data.size > 0) {
      state.chunks.push(event.data);
    }
  });
  state.mediaRecorder.addEventListener("stop", saveTake);

  state.recordStart = performance.now();
  state.recordStartPosition = Number.isFinite(options.startPosition) ? options.startPosition : getCurrentSessionPosition();
  state.recordWaveform = [];
  state.isPunchRecording = Boolean(options.punch);
  state.currentLoopCycle = Boolean(options.loopCycle);
  state.mediaRecorder.start(250);
  state.isRecording = true;
  els.recordButton.classList.add("active");
  renderQuickTakeReview();
  els.sessionState.textContent = options.loopCycle
    ? `Loop take ${state.loopRecordTakeCount + 1}`
    : options.punch ? "Punch recording" : "Recording";
  startMetronome();

  if (els.beatAudio.src && els.beatAudio.paused) {
    els.beatAudio.play();
  }

  if (options.autoStopAfter) {
    const stopTimer = window.setTimeout(() => {
      if (state.isRecording) {
        stopRecording();
      }
    }, options.autoStopAfter);
    state.punchTimers.push(stopTimer);
  }
}

function stopRecording() {
  if (!state.mediaRecorder || state.mediaRecorder.state === "inactive") {
    return;
  }

  const wasPunchRecording = state.isPunchRecording;
  const wasLoopCycle = state.currentLoopCycle;
  clearPunchTimers();
  state.mediaRecorder.stop();
  state.isRecording = false;
  state.isPunchRecording = false;
  state.currentLoopCycle = false;
  els.recordButton.classList.remove("active");
  els.sessionState.textContent = wasLoopCycle ? "Loop take saved" : wasPunchRecording ? "Punch saved" : "Take saved";
  if (!state.isSessionPlaying) {
    stopMetronome();
  }

  if (wasPunchRecording && state.loopEnabled && els.beatAudio.src && state.punchOut > state.punchIn) {
    els.beatAudio.currentTime = state.punchIn;
    els.beatAudio.play().catch((error) => {
      console.error(error);
    });
    if (!wasLoopCycle) {
      els.sessionState.textContent = "Looping punch";
    }
  }
}

function saveTake() {
  const track = tracks.find((item) => item.id === state.armedTrackId);
  const extension = state.mimeType.includes("mp4") ? "m4a" : "webm";
  const blob = new Blob(state.chunks, { type: state.mimeType || "audio/webm" });
  const url = URL.createObjectURL(blob);
  const latencySeconds = state.recordLatencyMs / 1000;
  const duration = (performance.now() - state.recordStart) / 1000;
  const take = {
    id: crypto.randomUUID(),
    trackId: track.id,
    trackName: track.name,
    url,
    blob,
    extension,
    createdAt: new Date(),
    startTime: Math.max(0, state.recordStartPosition - latencySeconds),
    duration,
    sourceOffset: 0,
    sourceDuration: duration,
    regionGroup: getDefaultRegionGroupForTrack(track.id),
    bestTake: false,
    recordLatencyMs: state.recordLatencyMs,
    waveform: downsampleWaveform(state.recordWaveform, 240),
  };

  track.takes.push(take);
  state.latestTake = take;
  state.recordWaveform = [...take.waveform];
  state.selectedVocalTakeId = take.id;
  els.downloadLatestButton.disabled = false;
  renderTracks();
  renderArmTracks();
  renderTakes();
  updateQueueButton();
  updateExportButtons();
  scheduleAutosave();
  scheduleNextLoopRecordTake();
}

function scheduleNextLoopRecordTake() {
  if (
    !state.isLoopRecording ||
    state.isRecording ||
    state.isPunchWaiting ||
    !state.punchEnabled ||
    !state.loopEnabled ||
    state.punchOut <= state.punchIn
  ) {
    return;
  }

  state.loopRecordTakeCount += 1;
  els.sessionState.textContent = `Loop take ${state.loopRecordTakeCount} saved`;
  const timer = window.setTimeout(() => {
    if (!state.isLoopRecording || state.isRecording || state.isPunchWaiting) {
      return;
    }

    startPunchRecording({ loopCycle: true, skipPreRoll: true });
  }, 180);
  state.punchTimers.push(timer);
}

async function countIn(bars) {
  const bpm = Number(els.bpmInput.value) || 140;
  const beats = bars * 4;
  const beatMs = 60000 / bpm;
  const token = state.countInToken + 1;
  state.countInToken = token;
  state.isCountInActive = true;

  els.countdown.hidden = false;
  els.sessionState.textContent = "Count in";

  for (let beat = beats; beat > 0; beat -= 1) {
    if (!state.isCountInActive || state.countInToken !== token) {
      els.countdown.hidden = true;
      return false;
    }

    els.countdown.textContent = String(beat);
    tick(beat === beats ? 880 : 660);
    await wait(beatMs);
  }

  state.isCountInActive = false;
  els.countdown.hidden = true;
  return state.countInToken === token;
}

function cancelCountIn() {
  if (!state.isCountInActive) {
    return;
  }

  state.isCountInActive = false;
  state.countInToken += 1;
  els.countdown.hidden = true;
}

async function startMetronome() {
  if (!state.metronomeEnabled || state.metronomeTimer) {
    return;
  }

  await ensureAudioContext();
  state.metronomeBeat = 0;

  const pulse = () => {
    if (!state.metronomeEnabled || (!state.isRecording && !state.isSessionPlaying)) {
      stopMetronome();
      return;
    }

    const beatMs = 60000 / (Number(els.bpmInput.value) || 140);
    tick(state.metronomeBeat % 4 === 0 ? 1040 : 720, 0.075);
    state.metronomeBeat += 1;
    state.metronomeTimer = window.setTimeout(pulse, beatMs);
  };

  pulse();
}

function stopMetronome() {
  window.clearTimeout(state.metronomeTimer);
  state.metronomeTimer = 0;
}

function tick(frequency, duration = 0.08) {
  if (!state.audioContext) {
    return;
  }

  const osc = state.audioContext.createOscillator();
  const gain = state.audioContext.createGain();
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, state.audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.14, state.audioContext.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, state.audioContext.currentTime + duration);
  osc.connect(gain).connect(state.audioContext.destination);
  osc.start();
  osc.stop(state.audioContext.currentTime + duration + 0.01);
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function startMeter() {
  const data = new Uint8Array(state.analyser.fftSize);
  const canvas = els.waveCanvas;
  const ctx = canvas.getContext("2d");

  const draw = () => {
    state.analyser.getByteTimeDomainData(data);

    let sum = 0;
    for (const value of data) {
      const normalized = (value - 128) / 128;
      sum += normalized * normalized;
    }

    const rms = Math.sqrt(sum / data.length);
    const db = rms > 0 ? 20 * Math.log10(rms) : -Infinity;
    const meterValue = Math.min(100, Math.max(0, (db + 60) * 1.9));
    els.inputMeter.style.width = `${meterValue}%`;
    els.inputLevelText.textContent = Number.isFinite(db) ? `${db.toFixed(1)} dBFS` : "-inf dBFS";

    updateRecordWaveform(data);
    drawLiveWave(ctx, canvas, data);
    state.waveFrame = requestAnimationFrame(draw);
  };

  cancelAnimationFrame(state.waveFrame);
  draw();
}

function drawLiveWave(ctx, canvas, data) {
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  drawGrid(ctx, width, height);
  drawRecordedWaveform(ctx, width, height, state.recordWaveform, state.isRecording ? "#ff4f64" : "rgba(65, 230, 208, 0.5)");

  ctx.lineWidth = 3;
  ctx.strokeStyle = state.isRecording ? "#ff4f64" : "#c8ff4d";
  ctx.beginPath();

  const slice = width / data.length;
  for (let i = 0; i < data.length; i += 1) {
    const y = (data[i] / 255) * height;
    const x = i * slice;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.stroke();
  updateWaveformStatus();
}

function drawIdleWave() {
  if (state.analyser) {
    return;
  }

  const canvas = els.waveCanvas;
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  drawGrid(ctx, width, height);
  drawRecordedWaveform(ctx, width, height, state.recordWaveform, "rgba(65, 230, 208, 0.5)");

  ctx.lineWidth = 3;
  ctx.strokeStyle = "#41e6d0";
  ctx.beginPath();
  for (let x = 0; x <= width; x += 8) {
    const y =
      height / 2 +
      Math.sin(x * 0.018) * 36 +
      Math.sin(x * 0.067) * 12 +
      Math.sin(x * 0.13) * 5;
    if (x === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.stroke();
  updateWaveformStatus();
}

function updateRecordWaveform(data) {
  if (!state.isRecording) {
    return;
  }

  let peak = 0;
  for (const value of data) {
    peak = Math.max(peak, Math.abs((value - 128) / 128));
  }

  state.recordWaveform.push(Math.min(1, peak));
  if (state.recordWaveform.length > 720) {
    state.recordWaveform.shift();
  }
}

function drawRecordedWaveform(ctx, width, height, waveform, color) {
  if (!waveform?.length) {
    return;
  }

  const peaks = downsampleWaveform(waveform, Math.min(width, 360));
  const center = height * 0.5;
  const maxHeight = height * 0.34;
  const step = width / Math.max(1, peaks.length - 1);
  ctx.save();
  ctx.lineWidth = Math.max(2, width / 420);
  ctx.strokeStyle = color;
  ctx.beginPath();
  peaks.forEach((peak, index) => {
    const x = index * step;
    const y = center - peak * maxHeight;
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  for (let index = peaks.length - 1; index >= 0; index -= 1) {
    const x = index * step;
    const y = center + peaks[index] * maxHeight;
    ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.globalAlpha = state.isRecording ? 0.22 : 0.14;
  ctx.fillStyle = color;
  ctx.fill();
  ctx.globalAlpha = state.isRecording ? 0.8 : 0.35;
  ctx.stroke();
  ctx.restore();
}

function downsampleWaveform(waveform, targetLength) {
  const source = (waveform || []).filter((value) => Number.isFinite(Number(value)));
  if (!source.length) {
    return [];
  }

  const safeTarget = Math.max(1, Math.min(targetLength, source.length));
  if (source.length <= safeTarget) {
    return source.map((value) => Math.max(0, Math.min(1, Number(value))));
  }

  return Array.from({ length: safeTarget }, (_, index) => {
    const start = Math.floor((index / safeTarget) * source.length);
    const end = Math.max(start + 1, Math.floor(((index + 1) / safeTarget) * source.length));
    let peak = 0;
    for (let sample = start; sample < end; sample += 1) {
      peak = Math.max(peak, Math.abs(Number(source[sample]) || 0));
    }
    return Math.max(0, Math.min(1, peak));
  });
}

function updateWaveformStatus() {
  if (!els.waveformStatus) {
    return;
  }

  if (state.isRecording) {
    els.waveformStatus.textContent = `Recording waveform ${state.recordWaveform.length}`;
    return;
  }

  const latestWaveform = state.latestTake?.waveform || [];
  els.waveformStatus.textContent = latestWaveform.length ? `Latest take waveform ${latestWaveform.length}` : "Live input";
}

function drawGrid(ctx, width, height) {
  ctx.fillStyle = "#0b0e0c";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "rgba(238, 244, 237, 0.06)";
  ctx.lineWidth = 1;

  for (let x = 0; x < width; x += 80) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let y = 0; y < height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(200, 255, 77, 0.18)";
  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.stroke();
}

function renderTracks() {
  const folderedTrackIds = new Set(TRACK_FOLDERS.flatMap((folder) => folder.trackIds));
  const folderSections = TRACK_FOLDERS.map(renderTrackFolder).join("");
  const orphanRows = tracks
    .filter((track) => !folderedTrackIds.has(track.id))
    .map(renderTrackRow)
    .join("");
  els.trackList.innerHTML = folderSections + orphanRows;

  els.trackList.querySelectorAll("[data-folder-toggle]").forEach((button) => {
    button.addEventListener("click", () => toggleTrackFolder(button.dataset.folderToggle));
  });

  els.trackList.querySelectorAll("[data-folder-mute]").forEach((button) => {
    button.addEventListener("click", () => toggleTrackFolderMute(button.dataset.folderMute));
  });

  els.trackList.querySelectorAll("[data-folder-solo]").forEach((button) => {
    button.addEventListener("click", () => toggleTrackFolderSolo(button.dataset.folderSolo));
  });

  els.trackList.querySelectorAll("[data-arm]").forEach((button) => {
    button.addEventListener("click", () => {
      state.armedTrackId = button.dataset.arm;
      const track = tracks.find((item) => item.id === state.armedTrackId);
      els.armedTrackName.textContent = track.name;
      renderTracks();
      renderArmTracks();
    });
  });

  els.trackList.querySelectorAll("[data-play-take]").forEach((button) => {
    button.addEventListener("click", () => {
      playTake(button.dataset.playTake);
    });
  });

  els.trackList.querySelectorAll("[data-delete-take]").forEach((button) => {
    button.addEventListener("click", () => {
      deleteTake(button.dataset.deleteTake);
    });
  });

  els.trackList.querySelectorAll("[data-track-mute]").forEach((button) => {
    button.addEventListener("click", () => {
      toggleTrackMute(button.dataset.trackMute);
    });
  });

  els.trackList.querySelectorAll("[data-track-solo]").forEach((button) => {
    button.addEventListener("click", () => {
      toggleTrackSolo(button.dataset.trackSolo);
    });
  });

  els.trackList.querySelectorAll("[data-track-volume]").forEach((input) => {
    input.addEventListener("input", () => {
      setTrackVolume(input.dataset.trackVolume, input.value);
    });
  });

  els.trackList.querySelectorAll("[data-track-pan]").forEach((input) => {
    input.addEventListener("input", () => {
      setTrackPan(input.dataset.trackPan, input.value);
    });
  });

  els.trackList.querySelectorAll("[data-track-name]").forEach((input) => {
    input.addEventListener("blur", () => {
      setTrackName(input.dataset.trackName, input.value);
    });
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        input.blur();
      }
    });
  });
}

function renderTrackFolder(folder) {
  const folderTracks = getTrackFolderTracks(folder.id);
  const isCollapsed = Boolean(state.trackFolderCollapsed[folder.id]);
  const takeCount = folderTracks.reduce((sum, track) => sum + track.takes.length, 0);
  const allMuted = folderTracks.length > 0 && folderTracks.every((track) => track.muted);
  const anySolo = folderTracks.some((track) => track.solo);
  const rows = isCollapsed ? "" : folderTracks.map(renderTrackRow).join("");

  return `
    <section class="track-folder ${isCollapsed ? "collapsed" : ""}" style="--track-color: ${folder.color}">
      <header class="track-folder-row">
        <button class="track-folder-toggle" type="button" data-folder-toggle="${folder.id}" aria-expanded="${String(!isCollapsed)}">
          ${isCollapsed ? "Show" : "Hide"}
        </button>
        <div class="track-folder-title">
          <span class="track-color"></span>
          <div>
            <strong>${escapeHtml(folder.name)}</strong>
            <small>${folderTracks.length} tracks / ${takeCount} takes</small>
          </div>
        </div>
        <div class="track-folder-actions">
          <button class="track-toggle ${allMuted ? "active" : ""}" type="button" data-folder-mute="${folder.id}" title="Mute ${folder.name}">M</button>
          <button class="track-toggle ${anySolo ? "active" : ""}" type="button" data-folder-solo="${folder.id}" title="Solo ${folder.name}">S</button>
        </div>
      </header>
      ${rows}
    </section>
  `;
}

function renderTrackRow(track) {
  const isArmed = track.id === state.armedTrackId;
  const isAudible = isTrackAudible(track);
  const pills = track.takes
    .map((take, index) => {
      const isPlaying = take.id === state.currentTakeId || state.sessionPlayingTakeIds.has(take.id);
      return `
        <div class="take-chip">
          <button class="take-pill ${isPlaying ? "playing" : ""}" type="button" data-play-take="${take.id}">
            ${isPlaying ? "Pause" : "Play"} T${index + 1} ${formatDuration(take.duration)} @${formatDuration(take.startTime || 0)}
          </button>
          <button class="take-delete" type="button" data-delete-take="${take.id}" title="Delete take">Del</button>
        </div>
      `;
    })
    .join("");

  return `
    <div class="track-row ${isArmed ? "armed" : ""} ${isAudible ? "" : "muted"}" style="--track-color: ${track.color}">
      <div class="track-name">
        <span class="track-color"></span>
        <span class="track-name-fields">
          <input class="track-name-input" type="text" value="${escapeHtml(track.name)}" data-track-name="${track.id}" aria-label="${escapeHtml(track.name)} track name" />
          <small>${formatPercent(track.volume)} ${formatPan(track.pan)}</small>
        </span>
      </div>
      <div class="take-strip">${pills || `<span class="eyebrow">No takes</span>`}</div>
      <div class="track-actions">
        <button class="track-toggle ${track.muted ? "active" : ""}" type="button" data-track-mute="${track.id}" title="Mute ${track.name}">M</button>
        <button class="track-toggle ${track.solo ? "active" : ""}" type="button" data-track-solo="${track.id}" title="Solo ${track.name}">S</button>
        <label class="mini-slider">
          <span>Vol</span>
          <input type="range" min="0" max="1" step="0.01" value="${track.volume}" data-track-volume="${track.id}" />
        </label>
        <label class="mini-slider">
          <span>Pan</span>
          <input type="range" min="-1" max="1" step="0.05" value="${track.pan}" data-track-pan="${track.id}" />
        </label>
        <button class="icon-button" type="button" data-arm="${track.id}" title="Arm ${track.name}">
          Arm
        </button>
      </div>
    </div>
  `;
}

function renderArmTracks() {
  els.armTrackList.innerHTML = tracks
    .map((track) => {
      const isArmed = track.id === state.armedTrackId;
      return `
        <button class="arm-button ${isArmed ? "active" : ""}" type="button" data-arm-quick="${track.id}" style="--track-color: ${track.color}">
          <span></span>
          ${track.name}
          <small>${track.takes.length}</small>
        </button>
      `;
    })
    .join("");

  els.armTrackList.querySelectorAll("[data-arm-quick]").forEach((button) => {
    button.addEventListener("click", () => {
      state.armedTrackId = button.dataset.armQuick;
      const track = findTrack(state.armedTrackId);
      els.armedTrackName.textContent = track.name;
      renderArmTracks();
      renderTracks();
    });
  });
}

function renderProjectTemplates() {
  if (!window.PunchLabTemplates || !els.templateSelect) {
    return;
  }

  const templates = window.PunchLabTemplates.listTemplates();
  els.templateSelect.innerHTML = templates
    .map((template) => `<option value="${template.id}">${escapeHtml(template.name)}</option>`)
    .join("");
  updateTemplateMeta();
}

function updateTemplateMeta() {
  if (!window.PunchLabTemplates || !els.templateMeta) {
    return;
  }

  const template = window.PunchLabTemplates.getTemplate(els.templateSelect.value);
  els.templateMeta.textContent = `${template.bpm} BPM / ${template.key}`;
}

function applySelectedTemplate() {
  if (!window.PunchLabTemplates) {
    els.sessionState.textContent = "Template module missing";
    return;
  }
  if (state.isRecording || state.isPunchRecording || state.isPunchWaiting) {
    els.sessionState.textContent = "Stop recording first";
    return;
  }

  const template = window.PunchLabTemplates.getTemplate(els.templateSelect.value);
  applyProjectTemplate(template);
}

function applyProjectTemplate(template) {
  stopSessionPlayback(false);
  stopTakeQueue(false);
  stopCurrentTake(false);

  els.bpmInput.value = template.bpm || 140;
  els.countInSelect.value = template.countIn || "0";
  els.keySelect.value = template.key || "C minor";
  els.scaleModeSelect.value = template.scaleMode || "minor";
  els.targetMidiSelect.value = template.targetMidi == null ? "" : String(template.targetMidi);
  state.armedTrackId = tracks.some((track) => track.id === template.armedTrackId)
    ? template.armedTrackId
    : tracks[0]?.id || "main";
  state.recordLatencyMs = Math.max(0, Number(template.recordLatencyMs || 0));
  els.recordLatencyInput.value = state.recordLatencyMs;
  state.markers = normalizeMarkers(template.markers);
  clearTimelineHistory();

  if (template.selectedPresetId && presets.some((preset) => preset.id === template.selectedPresetId)) {
    applyPreset(template.selectedPresetId);
  }

  tracks.forEach((track) => {
    const mix = template.tracks?.[track.id];
    if (!mix) {
      return;
    }

    track.volume = Math.max(0, Math.min(1, Number(mix.volume ?? track.volume)));
    track.pan = Math.max(-1, Math.min(1, Number(mix.pan ?? track.pan)));
    track.muted = Boolean(mix.muted);
    track.solo = Boolean(mix.solo);
  });

  const armedTrack = findTrack(state.armedTrackId);
  if (armedTrack) {
    els.armedTrackName.textContent = armedTrack.name;
  }

  updatePunchControls();
  renderTracks();
  renderArmTracks();
  renderTimeline();
  renderLyrics();
  renderVocalPanel();
  updateExportButtons();
  updateQueueButton();
  updateTemplateMeta();
  els.sessionState.textContent = `${template.name} template`;
  scheduleAutosave();
}

function renderPresets() {
  els.presetGrid.innerHTML = presets
    .map(
      (preset) => `
        <div class="preset-item ${preset.custom ? "custom" : ""}">
          <button class="preset-button" type="button" data-preset="${preset.id}">
            ${escapeHtml(preset.name)}
          </button>
          ${preset.custom ? `<button class="preset-delete-button" type="button" data-delete-preset="${preset.id}" title="Delete custom preset">Del</button>` : ""}
        </div>
      `,
    )
    .join("");

  els.presetGrid.querySelectorAll("[data-preset]").forEach((button) => {
    button.addEventListener("click", () => applyPreset(button.dataset.preset));
  });
  els.presetGrid.querySelectorAll("[data-delete-preset]").forEach((button) => {
    button.addEventListener("click", () => deleteCustomPreset(button.dataset.deletePreset));
  });
}

function saveCustomPreset() {
  const name = els.customPresetNameInput.value.trim() || `Custom ${presets.filter((preset) => preset.custom).length + 1}`;
  const preset = createCustomPresetSnapshot(`custom-${crypto.randomUUID()}`, name);
  presets.push(preset);
  els.customPresetNameInput.value = "";
  renderPresets();
  applyPreset(preset.id);
  els.sessionState.textContent = "Preset saved";
  scheduleAutosave();
}

function updateCustomPreset() {
  const preset = presets.find((item) => item.id === state.selectedPresetId && item.custom);
  if (!preset) {
    els.sessionState.textContent = "Select custom preset";
    return;
  }

  const name = els.customPresetNameInput.value.trim() || preset.name;
  Object.assign(preset, createCustomPresetSnapshot(preset.id, name));
  els.customPresetNameInput.value = "";
  renderPresets();
  applyPreset(preset.id);
  els.sessionState.textContent = "Preset updated";
  scheduleAutosave();
}

function createCustomPresetSnapshot(id, name) {
  const tuneSettings = getTuneSettings();
  return {
    id,
    name,
    retune: tuneSettings.retuneSpeed,
    humanize: tuneSettings.humanize,
    vibrato: tuneSettings.vibrato,
    formant: tuneSettings.formant,
    gate: tuneSettings.gate,
    deEss: tuneSettings.deEss,
    comp: tuneSettings.comp,
    compThreshold: tuneSettings.compThreshold,
    compRatio: tuneSettings.compRatio,
    compAttack: tuneSettings.compAttack,
    compRelease: tuneSettings.compRelease,
    saturation: tuneSettings.saturation,
    space: tuneSettings.space,
    delay: tuneSettings.delay,
    reverb: tuneSettings.reverb,
    width: tuneSettings.width,
    lowEq: tuneSettings.lowEq,
    midEq: tuneSettings.midEq,
    airEq: tuneSettings.airEq,
    limiterCeiling: tuneSettings.limiterCeiling,
    custom: true,
  };
}

function deleteCustomPreset(presetId) {
  const index = presets.findIndex((preset) => preset.id === presetId && preset.custom);
  if (index < 0 || presets.length <= 1) {
    els.sessionState.textContent = "Preset protected";
    return;
  }

  const wasSelected = state.selectedPresetId === presetId;
  presets.splice(index, 1);
  renderPresets();
  if (wasSelected) {
    applyPreset(presets[0].id);
  } else {
    renderVocalPanel();
  }
  els.sessionState.textContent = "Preset deleted";
  scheduleAutosave();
}

function normalizePreset(preset) {
  const comp = Number(preset.comp ?? 60);
  return {
    id: preset.id || `custom-${crypto.randomUUID()}`,
    name: preset.name || "Custom",
    retune: Number(preset.retune ?? 50),
    humanize: Number(preset.humanize ?? 25),
    vibrato: Number(preset.vibrato ?? 55),
    formant: Number(preset.formant ?? 0),
    gate: Number(preset.gate ?? 0),
    deEss: Number(preset.deEss ?? 0),
    comp,
    compThreshold: Number(preset.compThreshold ?? getDefaultCompThreshold(comp)),
    compRatio: Number(preset.compRatio ?? getDefaultCompRatio(comp)),
    compAttack: Number(preset.compAttack ?? 4),
    compRelease: Number(preset.compRelease ?? getDefaultCompRelease(comp)),
    saturation: Number(preset.saturation ?? 35),
    space: Number(preset.space ?? 12),
    delay: Number(preset.delay ?? preset.space ?? 12),
    reverb: Number(preset.reverb ?? Math.round(Number(preset.space ?? 12) * 0.65)),
    width: Number(preset.width ?? 24),
    lowEq: Number(preset.lowEq ?? 0),
    midEq: Number(preset.midEq ?? 0),
    airEq: Number(preset.airEq ?? 0),
    limiterCeiling: Number(preset.limiterCeiling ?? -3),
    custom: Boolean(preset.custom),
  };
}

function getDefaultCompThreshold(comp) {
  const amount = Math.min(1, Math.max(0, Number(comp) || 0) / 100);
  return Math.round(-18 - amount * 18);
}

function getDefaultCompRatio(comp) {
  const amount = Math.min(1, Math.max(0, Number(comp) || 0) / 100);
  return Math.round((2.5 + amount * 8) * 2) / 2;
}

function getDefaultCompRelease(comp) {
  const amount = Math.min(1, Math.max(0, Number(comp) || 0) / 100);
  return Math.round((80 + (1 - amount) * 180) / 10) * 10;
}

function syncCompDetailDefaults() {
  const comp = Number(els.compSlider?.value) || 0;
  els.compThresholdSlider.value = getDefaultCompThreshold(comp);
  els.compRatioSlider.value = getDefaultCompRatio(comp);
  els.compAttackSlider.value = 4;
  els.compReleaseSlider.value = getDefaultCompRelease(comp);
}

function applyPreset(id) {
  state.selectedPresetId = id;
  const preset = normalizePreset(presets.find((item) => item.id === id) || presets[0]);
  state.selectedPresetId = preset.id;
  els.presetName.textContent = preset.name;
  els.compValue.textContent = preset.comp;
  els.spaceValue.textContent = preset.space;
  els.widthValue.textContent = preset.width;
  els.retuneSpeedSlider.value = preset.retune;
  els.humanizeSlider.value = preset.humanize;
  els.vibratoSlider.value = preset.vibrato;
  els.formantSlider.value = preset.formant;
  els.gateSlider.value = preset.gate || 0;
  els.deEssSlider.value = preset.deEss || 0;
  els.compSlider.value = preset.comp;
  els.compThresholdSlider.value = preset.compThreshold;
  els.compRatioSlider.value = preset.compRatio;
  els.compAttackSlider.value = preset.compAttack;
  els.compReleaseSlider.value = preset.compRelease;
  els.saturationSlider.value = preset.saturation ?? 35;
  els.spaceSlider.value = preset.space;
  els.delaySlider.value = preset.delay;
  els.reverbSlider.value = preset.reverb;
  els.widthSlider.value = preset.width;
  els.lowEqSlider.value = preset.lowEq ?? 0;
  els.midEqSlider.value = preset.midEq ?? 0;
  els.airEqSlider.value = preset.airEq ?? 0;
  els.limiterCeilingSlider.value = preset.limiterCeiling ?? -3;
  updateTuneControls();

  els.presetGrid.querySelectorAll("[data-preset]").forEach((button) => {
    button.classList.toggle("active", button.dataset.preset === id);
  });

  renderVocalPanel();
}

function renderVocalPanel() {
  if (!els.vocalTakeSelect) {
    return;
  }

  const allTakes = getAllTakes();
  const selectedExists = allTakes.some((take) => take.id === state.selectedVocalTakeId);
  if (!selectedExists) {
    state.selectedVocalTakeId = allTakes.at(-1)?.id || null;
  }

  const selectedTake = getSelectedVocalTake();
  const comparisonPair = getComparisonPair(selectedTake);
  const batchSourceTargets = getBatchSourceTargets(selectedTake);
  const batchTargets = getBatchTargets(selectedTake);
  const skippedBatchTargets = Math.max(0, batchSourceTargets.length - batchTargets.length);
  const vocalBusy = isVocalBusy();
  const selectedPreset = getSelectedPreset();
  els.vocalTakeSelect.innerHTML = allTakes.length
    ? allTakes
      .map(
        (take, index) => `
          <option value="${take.id}" ${take.id === state.selectedVocalTakeId ? "selected" : ""}>
            ${escapeHtml(getTakeTitle(take, index))}
          </option>
        `,
      )
      .join("")
    : `<option value="">No takes</option>`;

  els.vocalTakeSelect.disabled = vocalBusy || allTakes.length === 0;
  els.previewVocalButton.disabled = vocalBusy || !selectedTake;
  els.analyzeVocalButton.disabled = vocalBusy || !selectedTake;
  els.renderVocalButton.disabled = vocalBusy || !selectedTake;
  els.compareSourceButton.disabled = vocalBusy || !comparisonPair;
  els.compareProcessedButton.disabled = vocalBusy || !comparisonPair;
  els.batchScopeSelect.disabled = vocalBusy || allTakes.length === 0;
  els.batchSkipRenderedInput.disabled = vocalBusy || allTakes.length === 0;
  els.batchRenderButton.disabled = vocalBusy || batchTargets.length === 0;
  els.updateCustomPresetButton.disabled = vocalBusy || !selectedPreset.custom;
  els.compareSourceButton.classList.toggle("active", Boolean(comparisonPair?.source.id === state.currentTakeId));
  els.compareProcessedButton.classList.toggle("active", Boolean(comparisonPair?.processed.id === state.currentTakeId));
  setTuneControlsDisabled(vocalBusy);
  els.analyzeVocalButton.classList.toggle("rendering", state.isAnalyzingVocal);
  els.renderVocalButton.classList.toggle("rendering", state.isRenderingVocal);
  els.batchRenderButton.classList.toggle("rendering", state.isBatchRendering);
  els.analyzeVocalButton.querySelector(".button-label").textContent = state.isAnalyzingVocal ? "Analyzing" : "Analyze";
  els.renderVocalButton.querySelector(".button-label").textContent = state.isRenderingVocal ? "Rendering" : "Render";
  els.batchRenderButton.querySelector(".button-label").textContent = state.isBatchRendering ? "Rendering" : "Render batch";
  renderCustomScaleEditor();
  renderPitchPanel(selectedTake);
  renderBatchPanel(batchTargets, skippedBatchTargets);

  if (!selectedTake) {
    els.vocalStatus.textContent = "No take";
    els.selectedTakeMeta.innerHTML = `<span class="eyebrow">Record a take first</span>`;
    renderComparePanel(null);
    renderVersionPanel(null);
    return;
  }

  els.vocalStatus.textContent = state.isRenderingVocal ? "Rendering" : `${selectedPreset.name} ready`;
  els.selectedTakeMeta.innerHTML = `
    <strong>${selectedTake.trackName}</strong>
    <span>${selectedTake.processed ? "Processed" : "Original"} / ${formatDuration(selectedTake.duration)} @ ${formatDuration(selectedTake.startTime || 0)}</span>
    <small>${selectedTake.processed ? `${selectedTake.presetName} v${selectedTake.version || 1} / ${getTuneSignature(selectedTake.tuneSettings)}` : "Raw take"}</small>
  `;
  renderComparePanel(comparisonPair);
  renderVersionPanel(selectedTake);
}

function updateTuneControls() {
  const settings = getTuneSettings();
  els.retuneSpeedText.textContent = String(settings.retuneSpeed);
  els.retuneValue.textContent = String(settings.retuneSpeed);
  els.humanizeText.textContent = String(settings.humanize);
  els.vibratoText.textContent = String(settings.vibrato);
  els.formantText.textContent = formatSigned(settings.formant);
  els.gateText.textContent = String(settings.gate);
  els.deEssText.textContent = String(settings.deEss);
  els.compText.textContent = String(settings.comp);
  els.compThresholdText.textContent = `${formatDb(settings.compThreshold)} dB`;
  els.compRatioText.textContent = `${formatRatio(settings.compRatio)}:1`;
  els.compAttackText.textContent = `${settings.compAttack} ms`;
  els.compReleaseText.textContent = `${settings.compRelease} ms`;
  els.compDetailText.textContent = `${formatDb(settings.compThreshold)} dB / ${formatRatio(settings.compRatio)}:1`;
  els.saturationText.textContent = String(settings.saturation);
  els.spaceText.textContent = String(settings.space);
  els.delayText.textContent = String(settings.delay);
  els.reverbText.textContent = String(settings.reverb);
  els.widthText.textContent = String(settings.width);
  els.compValue.textContent = String(settings.comp);
  els.spaceValue.textContent = String(settings.space);
  els.widthValue.textContent = String(settings.width);
  els.lowEqText.textContent = `${formatDb(settings.lowEq)} dB`;
  els.midEqText.textContent = `${formatDb(settings.midEq)} dB`;
  els.airEqText.textContent = `${formatDb(settings.airEq)} dB`;
  els.limiterCeilingText.textContent = `${formatDb(settings.limiterCeiling)} dB`;
}

function setTuneControlsDisabled(isDisabled) {
  els.retuneSpeedSlider.disabled = isDisabled;
  els.humanizeSlider.disabled = isDisabled;
  els.vibratoSlider.disabled = isDisabled;
  els.formantSlider.disabled = isDisabled;
  els.gateSlider.disabled = isDisabled;
  els.deEssSlider.disabled = isDisabled;
  els.compSlider.disabled = isDisabled;
  els.compThresholdSlider.disabled = isDisabled;
  els.compRatioSlider.disabled = isDisabled;
  els.compAttackSlider.disabled = isDisabled;
  els.compReleaseSlider.disabled = isDisabled;
  els.saturationSlider.disabled = isDisabled;
  els.spaceSlider.disabled = isDisabled;
  els.delaySlider.disabled = isDisabled;
  els.reverbSlider.disabled = isDisabled;
  els.widthSlider.disabled = isDisabled;
  els.lowEqSlider.disabled = isDisabled;
  els.midEqSlider.disabled = isDisabled;
  els.airEqSlider.disabled = isDisabled;
  els.limiterCeilingSlider.disabled = isDisabled;
}

function isVocalBusy() {
  return state.isAnalyzingVocal || state.isRenderingVocal || state.isBatchRendering;
}

async function analyzeSelectedVocalTake() {
  if (state.isAnalyzingVocal || state.isRenderingVocal) {
    return;
  }

  const selectedTake = getSelectedVocalTake();
  if (!selectedTake) {
    els.sessionState.textContent = "No take";
    return;
  }

  state.isAnalyzingVocal = true;
  els.sessionState.textContent = "Analyzing pitch";
  renderVocalPanel();

  try {
    const { pitchAnalysis } = await window.PunchLabEngine.analyzeTakePitch(selectedTake);
    selectedTake.pitchAnalysis = pitchAnalysis;
    selectedTake.pitchPlan = getPitchPlan(selectedTake.pitchAnalysis, selectedTake);
    const plan = selectedTake.pitchPlan;
    els.sessionState.textContent = plan.detectedLabel === "--" ? "Pitch not found" : `${plan.detectedLabel} detected`;
    scheduleAutosave();
  } catch (error) {
    els.sessionState.textContent = "Analyze failed";
    console.error(error);
  } finally {
    state.isAnalyzingVocal = false;
    renderVocalPanel();
  }
}

function previewSelectedVocalTake() {
  const selectedTake = getSelectedVocalTake();
  if (!selectedTake) {
    els.sessionState.textContent = "No take";
    return;
  }

  playTake(selectedTake.id);
}

function renderComparePanel(pair) {
  if (!pair) {
    els.compareStatus.textContent = "No pair";
    els.compareMeta.textContent = "Render a take to enable comparison.";
    return;
  }

  els.compareStatus.textContent = "Ready";
  els.compareMeta.textContent = `${getTakeShortName(pair.source)} -> ${getTakeShortName(pair.processed)}`;
}

function renderVersionPanel(take) {
  if (!els.versionStatus || !els.versionList) {
    return;
  }

  if (!take) {
    els.versionStatus.textContent = "No renders";
    els.versionList.innerHTML = `<span class="empty-takes">Render a vocal take to create versions.</span>`;
    return;
  }

  const sourceTake = take.processed && take.sourceTakeId ? findTake(take.sourceTakeId) : take;
  const versions = getProcessedVersionsForSource(sourceTake?.id);
  els.versionStatus.textContent = versions.length ? `${versions.length} version(s)` : "No renders";
  els.versionList.innerHTML = versions.length
    ? versions
      .map((versionTake) => {
        const isSelected = versionTake.id === state.selectedVocalTakeId;
        const isPlaying = versionTake.id === state.currentTakeId || state.sessionPlayingTakeIds.has(versionTake.id);
        return `
          <button class="version-row ${isSelected ? "selected" : ""} ${isPlaying ? "active" : ""}" type="button" data-select-version="${versionTake.id}">
            <strong>${escapeHtml(versionTake.renderLabel || `${versionTake.presetName || "Processed"} v${versionTake.version || 1}`)}</strong>
            <span>${escapeHtml(formatDuration(versionTake.duration))}</span>
            <small>${escapeHtml(getTuneSignature(versionTake.tuneSettings))}</small>
          </button>
        `;
      })
      .join("")
    : `<span class="empty-takes">${escapeHtml(getTakeShortName(sourceTake))} has no tuned versions yet.</span>`;

  els.versionList.querySelectorAll("[data-select-version]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedVocalTakeId = button.dataset.selectVersion;
      playTake(button.dataset.selectVersion);
      renderVocalPanel();
    });
  });
}

function renderBatchPanel(targets, skippedCount = 0) {
  const scope = els.batchScopeSelect.value;
  els.batchStatus.textContent = targets.length ? `${targets.length} raw` : skippedCount ? "Skipped" : "No raw";
  renderBatchTargetList(targets);
  if (targets.length) {
    els.batchMeta.textContent = getBatchScopeReadyText(scope, targets.length, skippedCount);
    return;
  }

  els.batchMeta.textContent = getBatchScopeEmptyText(scope, skippedCount);
}

function renderBatchTargetList(targets) {
  if (!els.batchTargetList) {
    return;
  }

  if (!targets.length) {
    els.batchTargetList.innerHTML = `<span class="empty-takes">No batch targets</span>`;
    return;
  }

  const visibleTargets = targets.slice(0, 5);
  const hiddenCount = Math.max(0, targets.length - visibleTargets.length);
  els.batchTargetList.innerHTML = [
    ...visibleTargets.map((take) => `
      <div class="batch-target-row">
        <strong>${escapeHtml(getTakeShortName(take))}</strong>
        <span>${escapeHtml(take.trackName)} / ${escapeHtml(formatDuration(take.duration))}</span>
      </div>`),
    hiddenCount ? `<small>+${hiddenCount} more target${hiddenCount === 1 ? "" : "s"}</small>` : "",
  ].join("");
}

async function playComparisonTake(kind) {
  const pair = getComparisonPair(getSelectedVocalTake());
  if (!pair) {
    els.sessionState.textContent = "No compare pair";
    return;
  }

  const take = pair[kind];
  const label = kind === "source" ? `A Raw ${take.trackName}` : `B Tuned ${take.trackName}`;
  stopSessionPlayback(false);
  stopTakeQueue(false);
  await playTakeAudio(take, label);
}

async function renderSelectedVocalTake() {
  if (isVocalBusy()) {
    return;
  }

  const sourceTake = getSelectedVocalTake();
  if (!sourceTake) {
    els.sessionState.textContent = "No take";
    return;
  }

  const preset = getSelectedPreset();
  state.isRenderingVocal = true;
  stopSessionPlayback(false);
  stopTakeQueue(false);
  stopCurrentTake(false);
  els.sessionState.textContent = "Rendering vocal";
  renderVocalPanel();

  try {
    const take = await renderProcessedTake(sourceTake, preset, getTuneSettings());
    state.latestTake = take;
    state.selectedVocalTakeId = take.id;
    els.downloadLatestButton.disabled = false;
    els.sessionState.textContent = `${preset.name} rendered`;
  } catch (error) {
    els.sessionState.textContent = "Render failed";
    console.error(error);
  } finally {
    state.isRenderingVocal = false;
    renderTracks();
    renderArmTracks();
    renderTakes();
    updateQueueButton();
    updateExportButtons();
    renderVocalPanel();
  }
}

async function renderBatchVocalTakes() {
  if (isVocalBusy()) {
    return;
  }

  const targets = getBatchTargets(getSelectedVocalTake());
  if (!targets.length) {
    const skippedCount = getBatchSourceTargets(getSelectedVocalTake()).length;
    els.sessionState.textContent = shouldSkipRenderedBatchTargets() && skippedCount ? "Already rendered" : "No raw takes";
    return;
  }

  const preset = getSelectedPreset();
  const tuneSettings = getTuneSettings();
  let latestRendered = null;
  state.isBatchRendering = true;
  stopSessionPlayback(false);
  stopTakeQueue(false);
  stopCurrentTake(false);
  renderVocalPanel();

  try {
    for (let index = 0; index < targets.length; index += 1) {
      els.sessionState.textContent = `Batch ${index + 1}/${targets.length}`;
      latestRendered = await renderProcessedTake(targets[index], preset, tuneSettings);
    }

    if (latestRendered) {
      state.latestTake = latestRendered;
      state.selectedVocalTakeId = latestRendered.id;
      els.downloadLatestButton.disabled = false;
    }
    els.sessionState.textContent = `Batch rendered ${targets.length}`;
  } catch (error) {
    els.sessionState.textContent = "Batch failed";
    console.error(error);
  } finally {
    state.isBatchRendering = false;
    renderTracks();
    renderArmTracks();
    renderTakes();
    updateQueueButton();
    updateExportButtons();
    renderVocalPanel();
  }
}

async function renderProcessedTake(sourceTake, preset, tuneSettings) {
  preset ||= getSelectedPreset();
  tuneSettings ||= getTuneSettings();
  const version = getNextProcessedVersion(sourceTake.id, preset.id);
  let sourceBuffer = null;
  if (!sourceTake.pitchAnalysis) {
    const analyzed = await window.PunchLabEngine.analyzeTakePitch(sourceTake);
    sourceBuffer = analyzed.sourceBuffer;
    const { pitchAnalysis } = analyzed;
    sourceTake.pitchAnalysis = pitchAnalysis;
  }
  const pitchPlan = getPitchPlan(sourceTake.pitchAnalysis, sourceTake);
  sourceTake.pitchPlan = pitchPlan;
  const rendered = await window.PunchLabEngine.renderProcessedVocal({
    sourceTake,
    sourceBuffer,
    preset,
    tuneSettings,
    pitchPlan,
  });
  const blob = rendered.blob;
  const url = URL.createObjectURL(blob);
  const track = findTrack(sourceTake.trackId);
  const take = {
    id: crypto.randomUUID(),
    trackId: sourceTake.trackId,
    trackName: sourceTake.trackName,
    url,
    blob,
    extension: "wav",
    createdAt: new Date(),
    startTime: sourceTake.startTime || 0,
    duration: rendered.duration,
    sourceOffset: 0,
    sourceDuration: rendered.duration,
    waveform: rendered.waveform,
    clipGain: sourceTake.clipGain ?? 1,
    regionColor: sourceTake.regionColor || null,
    regionGroup: getTakeRegionGroup(sourceTake),
    fadeIn: sourceTake.fadeIn || 0,
    fadeOut: sourceTake.fadeOut || 0,
    bestTake: false,
    recordLatencyMs: sourceTake.recordLatencyMs || 0,
    processed: true,
    sourceTakeId: sourceTake.id,
    presetId: preset.id,
    presetName: preset.name,
    version,
    renderLabel: `${preset.name} v${version}`,
    chainSnapshot: {
      preset: { ...rendered.renderPreset },
      tuneSettings: { ...tuneSettings },
      automationState: window.PunchLabChainParams?.createAutomationState?.(tuneSettings, {
        presetId: preset.id,
        presetName: preset.name,
        sourceTakeId: sourceTake.id,
      }) || null,
      key: els.keySelect.value,
      scaleMode: els.scaleModeSelect.value,
      customScaleIntervals: [...state.customScaleIntervals],
    },
    pitchAnalysis: rendered.pitchAnalysis,
    pitchPlan: getPitchPlan(rendered.pitchAnalysis),
    sourcePitchPlan: pitchPlan,
    tuneSettings: { ...tuneSettings },
  };

  track.takes.push(take);
  scheduleAutosave();
  return take;
}

async function renderVocalBuffer(sourceBuffer, preset, pitchPlan = null, tuneSettings = getTuneSettings()) {
  return window.PunchLabDSP.renderVocalBuffer(sourceBuffer, preset, pitchPlan, tuneSettings);
}

function getEffectivePreset(preset, tuneSettings = getTuneSettings()) {
  return window.PunchLabEngine.getEffectivePreset(preset, tuneSettings);
}

function analyzePitchBuffer(audioBuffer) {
  return window.PunchLabDSP.analyzePitchBuffer(audioBuffer);
}

function renderCustomScaleEditor() {
  if (!els.customScaleEditor || !els.customScaleGrid) {
    return;
  }

  const isCustom = els.scaleModeSelect.value === "custom";
  els.customScaleEditor.classList.toggle("hidden", !isCustom);
  if (!isCustom) {
    return;
  }

  state.customScaleIntervals = normalizeScaleIntervals(state.customScaleIntervals);
  const root = getKeyRootClass(els.keySelect.value);
  const activeIntervals = new Set(state.customScaleIntervals);
  els.customScaleMeta.textContent = `${activeIntervals.size} notes`;
  els.customScaleGrid.innerHTML = Array.from({ length: 12 }, (_, interval) => {
    const isActive = activeIntervals.has(interval);
    const noteName = window.PunchLabDSP.NOTE_NAMES[window.PunchLabDSP.positiveModulo(root + interval, 12)];
    return `
      <button
        class="scale-note-button ${isActive ? "active" : ""}"
        type="button"
        data-scale-interval="${interval}"
        ${isActive && activeIntervals.size === 1 ? "disabled" : ""}
      >
        ${noteName}
      </button>
    `;
  }).join("");
}

function handleCustomScaleClick(event) {
  const button = event.target.closest("[data-scale-interval]");
  if (!button) {
    return;
  }

  const interval = Number(button.dataset.scaleInterval);
  if (!Number.isFinite(interval)) {
    return;
  }

  const intervals = normalizeScaleIntervals(state.customScaleIntervals);
  const hasInterval = intervals.includes(interval);
  if (hasInterval && intervals.length === 1) {
    return;
  }

  state.customScaleIntervals = normalizeScaleIntervals(
    hasInterval ? intervals.filter((item) => item !== interval) : [...intervals, interval],
  );
  els.sessionState.textContent = "Scale updated";
  renderVocalPanel();
  scheduleAutosave();
}

function normalizeScaleIntervals(intervals) {
  const source = Array.isArray(intervals) ? intervals : DEFAULT_CUSTOM_SCALE_INTERVALS;
  const normalized = [...new Set(
    source
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value))
      .map((value) => window.PunchLabDSP.positiveModulo(Math.round(value), 12)),
  )].sort((left, right) => left - right);

  return normalized.length ? normalized : [...DEFAULT_CUSTOM_SCALE_INTERVALS];
}

function getKeyRootClass(keyValue) {
  const rootName = String(keyValue || "C minor").split(" ")[0];
  const root = window.PunchLabDSP.NOTE_NAMES.indexOf(rootName);
  return root >= 0 ? root : 0;
}

function renderTargetMidiOptions() {
  const noteOptions = [];
  for (let midi = 36; midi <= 84; midi += 1) {
    noteOptions.push(`<option value="${midi}">${formatPitchNote(midi)}</option>`);
  }

  els.targetMidiSelect.innerHTML = `<option value="">Off / scale nearest</option>${noteOptions.join("")}`;
}

function getTargetMidiValue() {
  const rawValue = els.targetMidiSelect?.value;
  if (rawValue === "") {
    return null;
  }

  const value = Number(rawValue);
  return Number.isFinite(value) ? value : null;
}

function getPitchModeLabel() {
  const targetMidi = getTargetMidiValue();
  if (targetMidi !== null) {
    return `MIDI ${formatPitchNote(targetMidi)}`;
  }

  if (els.scaleModeSelect.value === "chromatic") {
    return "Chromatic";
  }

  if (els.scaleModeSelect.value === "custom") {
    return "Custom";
  }

  return els.keySelect.value;
}

function renderPitchPanel(take) {
  if (!els.pitchDetectedText) {
    return;
  }

  const analysis = take?.pitchAnalysis || null;
  const plan = getPitchPlan(analysis, take);
  els.pitchKeyText.textContent = getPitchModeLabel();
  els.pitchDetectedText.textContent = plan.detectedLabel;
  els.pitchTargetText.textContent = plan.manualCount ? `${plan.manualCount} edits` : plan.targetLabel;
  els.pitchCorrectionText.textContent = plan.manualCount
    ? `${formatSemitones(getAverageCorrection(plan.frames.filter((frame) => frame.manual)))} avg`
    : plan.correctionLabel;
  els.pitchConfidenceText.textContent = plan.keyFitLabel;
  renderPitchLane(take, plan);
}

function getPitchPlan(analysis, take = null) {
  return applyManualPitchTargets(getBasePitchPlan(analysis), take);
}

function getBasePitchPlan(analysis) {
  return window.PunchLabDSP.getPitchPlan(
    analysis,
    els.keySelect.value,
    els.scaleModeSelect.value,
    state.customScaleIntervals,
    getTargetMidiValue(),
  );
}

function applyManualPitchTargets(plan, take) {
  const manualTargets = take?.manualPitchTargets || {};
  if (!plan.frames?.length || !Object.keys(manualTargets).length) {
    return { ...plan, manualCount: 0 };
  }

  let manualCount = 0;
  const frames = plan.frames.map((frame) => {
    const manualTarget = Number(manualTargets[getPitchFrameKey(frame)]);
    if (!Number.isFinite(manualTarget)) {
      return frame;
    }

    manualCount += 1;
    return {
      ...frame,
      targetMidi: manualTarget,
      correctionSemitones: manualTarget - frame.midi,
      manual: true,
    };
  });

  return { ...plan, frames, manualCount };
}

function renderPitchLane(take, plan) {
  if (!els.pitchLane) {
    return;
  }

  const manualCount = getManualPitchCount(take);
  const hasAnalysis = Boolean(take?.pitchAnalysis && plan.frames.length);
  els.pitchLaneMeta.textContent = !take ? "No take" : hasAnalysis ? `${manualCount} edits` : "Analyze first";
  els.resetPitchLaneButton.disabled = isVocalBusy() || manualCount === 0;

  if (!take) {
    els.pitchLane.innerHTML = `<span class="empty-takes">Record a take first.</span>`;
    return;
  }

  if (!hasAnalysis) {
    els.pitchLane.innerHTML = `<span class="empty-takes">Analyze this take before editing pitch targets.</span>`;
    return;
  }

  const frames = getPitchLaneFrames(plan.frames);
  els.pitchLane.innerHTML = frames.map(renderPitchLaneFrame).join("");
}

function renderPitchLaneFrame(frame) {
  const key = getPitchFrameKey(frame);
  const sourceLabel = formatPitchNote(frame.midi);
  const targetLabel = formatPitchNote(frame.targetMidi);
  const timeLabel = Number.isFinite(frame.time) ? formatDuration(frame.time) : `#${key}`;
  const confidence = Math.round((frame.confidence || 0) * 100);

  return `
    <div class="pitch-frame ${frame.manual ? "manual" : ""}" title="${timeLabel} / ${confidence}% confidence">
      <button type="button" data-pitch-frame="${key}" data-pitch-step="1" aria-label="Target up">+</button>
      <button class="pitch-frame-note" type="button" data-pitch-reset="${key}" aria-label="Reset this target">
        <span>${sourceLabel}</span>
        <strong>${targetLabel}</strong>
      </button>
      <button type="button" data-pitch-frame="${key}" data-pitch-step="-1" aria-label="Target down">-</button>
    </div>
  `;
}

function getPitchLaneFrames(frames) {
  const limit = 18;
  if (frames.length <= limit) {
    return frames;
  }

  const visible = [];
  const usedKeys = new Set();
  const step = (frames.length - 1) / (limit - 1);
  for (let index = 0; index < limit; index += 1) {
    const frame = frames[Math.round(index * step)];
    const key = getPitchFrameKey(frame);
    if (!usedKeys.has(key)) {
      visible.push(frame);
      usedKeys.add(key);
    }
  }

  return visible;
}

function handlePitchLaneClick(event) {
  const stepButton = event.target.closest("[data-pitch-step]");
  if (stepButton) {
    adjustManualPitchTarget(stepButton.dataset.pitchFrame, Number(stepButton.dataset.pitchStep));
    return;
  }

  const resetButton = event.target.closest("[data-pitch-reset]");
  if (resetButton) {
    resetManualPitchTarget(resetButton.dataset.pitchReset);
  }
}

function adjustManualPitchTarget(frameKey, step) {
  const take = getSelectedVocalTake();
  if (!take?.pitchAnalysis || !Number.isFinite(step)) {
    return;
  }

  const baseFrame = getBasePitchPlan(take.pitchAnalysis).frames.find((frame) => getPitchFrameKey(frame) === frameKey);
  if (!baseFrame) {
    return;
  }

  const currentTarget = Number(take.manualPitchTargets?.[frameKey] ?? baseFrame.targetMidi);
  const nextTarget = clampMidi(Math.round(currentTarget + step));
  take.manualPitchTargets = { ...(take.manualPitchTargets || {}), [frameKey]: nextTarget };
  take.pitchPlan = getPitchPlan(take.pitchAnalysis, take);
  els.sessionState.textContent = `Manual target ${formatPitchNote(nextTarget)}`;
  renderVocalPanel();
  scheduleAutosave();
}

function resetManualPitchTarget(frameKey) {
  const take = getSelectedVocalTake();
  if (!take?.manualPitchTargets || !(frameKey in take.manualPitchTargets)) {
    return;
  }

  take.manualPitchTargets = { ...take.manualPitchTargets };
  delete take.manualPitchTargets[frameKey];
  take.pitchPlan = getPitchPlan(take.pitchAnalysis, take);
  els.sessionState.textContent = "Pitch target reset";
  renderVocalPanel();
  scheduleAutosave();
}

function clearManualPitchLane() {
  const take = getSelectedVocalTake();
  if (!take || !getManualPitchCount(take)) {
    return;
  }

  take.manualPitchTargets = {};
  take.pitchPlan = getPitchPlan(take.pitchAnalysis, take);
  els.sessionState.textContent = "Pitch edits cleared";
  renderVocalPanel();
  scheduleAutosave();
}

function getManualPitchCount(take) {
  return Object.values(take?.manualPitchTargets || {}).filter((value) => Number.isFinite(Number(value))).length;
}

function getPitchFrameKey(frame) {
  return String(Math.round(frame.start || 0));
}

function formatPitchNote(midi) {
  return Number.isFinite(Number(midi)) ? window.PunchLabDSP.formatMidiNote(Number(midi)) : "--";
}

function getAverageCorrection(frames) {
  const corrected = frames.filter((frame) => Number.isFinite(frame.correctionSemitones));
  if (!corrected.length) {
    return 0;
  }

  return corrected.reduce((sum, frame) => sum + frame.correctionSemitones, 0) / corrected.length;
}

function clampMidi(midi) {
  return Math.min(127, Math.max(0, midi));
}

function renderTakes() {
  const allTakes = getAllTakes();
  els.takesList.innerHTML = allTakes.length
    ? allTakes
    .map(
      (take, index) => {
        const isPlaying = take.id === state.currentTakeId || state.sessionPlayingTakeIds.has(take.id);
        return `
        <div class="take-item">
          <div class="take-main">
            <strong>${escapeHtml(getTakeTitle(take, index))}</strong>
            <small>${getTakeSubtitle(take)}</small>
            <input class="take-name-input" type="text" value="${escapeHtml(getTakeTitle(take, index))}" data-take-name="${take.id}" aria-label="Take name" maxlength="48" />
            ${renderTakeWaveform(take)}
          </div>
          <div class="take-controls">
            <button class="mini-button ${isPlaying ? "active" : ""}" type="button" data-play-take="${take.id}">
              ${isPlaying ? "Pause" : "Play"}
            </button>
            <button class="mini-button ${take.compSelected ? "active" : ""}" type="button" data-comp-take="${take.id}">
              Comp
            </button>
            <button class="mini-button ${take.bestTake ? "active" : ""}" type="button" data-best-take="${take.id}">
              Best
            </button>
            <a href="${take.url}" download="${makeTakeFilename(take)}">Save</a>
            <button class="mini-button danger" type="button" data-delete-take="${take.id}">Del</button>
          </div>
        </div>
      `;
      },
    )
    .join("")
    : `<span class="empty-takes">No takes yet</span>`;

  els.takesList.querySelectorAll("[data-play-take]").forEach((button) => {
    button.addEventListener("click", () => {
      playTake(button.dataset.playTake);
    });
  });

  els.takesList.querySelectorAll("[data-delete-take]").forEach((button) => {
    button.addEventListener("click", () => {
      deleteTake(button.dataset.deleteTake);
    });
  });
  els.takesList.querySelectorAll("[data-comp-take]").forEach((button) => {
    button.addEventListener("click", () => {
      toggleCompTake(button.dataset.compTake);
    });
  });
  els.takesList.querySelectorAll("[data-best-take]").forEach((button) => {
    button.addEventListener("click", () => {
      toggleBestTake(button.dataset.bestTake);
    });
  });
  els.takesList.querySelectorAll("[data-take-name]").forEach((input) => {
    input.addEventListener("change", () => {
      setTakeName(input.dataset.takeName, input.value, "Take renamed");
    });
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        input.blur();
      }
    });
  });

  updateQueueButton();
  updateExportButtons();
  renderQuickTakeReview(allTakes);
  renderCompView();
  renderVocalPanel();
  renderTimeline();
  renderExportPanel();
}

function renderQuickTakeReview(allTakes = getAllTakes()) {
  if (!els.quickTakeTitle || !els.quickTakeMeta || !els.playLatestTakeButton || !els.quickTakeList) {
    return;
  }

  const latestTake = state.latestTake || allTakes.at(-1);
  const recentTakes = allTakes.slice(-4).reverse();
  const latestIsPlaying = latestTake && (state.currentTakeId === latestTake.id || state.sessionPlayingTakeIds.has(latestTake.id));

  els.quickTakeTitle.textContent = latestTake ? getTakeShortName(latestTake) : "No take yet";
  els.quickTakeMeta.textContent = latestTake
    ? `${latestTake.trackName} / ${getTakeSubtitle(latestTake)}`
    : "Record a take to review it here.";
  els.playLatestTakeButton.disabled = !latestTake || state.isRecording;
  els.playLatestTakeButton.textContent = latestIsPlaying ? "Pause latest" : "Play latest";
  els.playLatestTakeButton.classList.toggle("active", Boolean(latestIsPlaying));
  if (els.sendLatestToVocalButton) {
    els.sendLatestToVocalButton.disabled = !latestTake || state.isRecording;
  }
  els.quickTakeList.innerHTML = recentTakes.length
    ? recentTakes
      .map((take) => {
        const isPlaying = take.id === state.currentTakeId || state.sessionPlayingTakeIds.has(take.id);
        const disabled = state.isRecording ? "disabled" : "";
        return `
          <article class="quick-take-card">
            <button class="quick-take-button ${isPlaying ? "active" : ""}" type="button" data-quick-play-take="${take.id}" ${disabled}>
              <strong>${escapeHtml(getTakeShortName(take))}</strong>
              <span>${escapeHtml(formatDuration(take.duration))}</span>
            </button>
            <button class="mini-button quick-take-vocal" type="button" data-quick-vocal-take="${take.id}" ${disabled}>Vocal</button>
          </article>
        `;
      })
      .join("")
    : `<span class="empty-takes">Recent takes will appear here</span>`;

  els.quickTakeList.querySelectorAll("[data-quick-play-take]").forEach((button) => {
    button.addEventListener("click", () => {
      const take = findTake(button.dataset.quickPlayTake);
      if (take) {
        state.latestTake = take;
      }
      playTake(button.dataset.quickPlayTake);
    });
  });
  els.quickTakeList.querySelectorAll("[data-quick-vocal-take]").forEach((button) => {
    button.addEventListener("click", () => sendTakeToVocal(button.dataset.quickVocalTake));
  });
}

function renderCompView() {
  if (!els.compLaneList || !els.compPoolList) {
    return;
  }

  const compTakes = getCompTakes();
  const poolTakes = getAllTakes().filter((take) => !take.compSelected);
  const bestPoolCount = poolTakes.filter((take) => take.bestTake).length;
  els.compLaneMeta.textContent = `${compTakes.length} take${compTakes.length === 1 ? "" : "s"}`;
  els.compPoolMeta.textContent = `${poolTakes.length} available`;
  els.compPlayButton.disabled = !state.isQueuePlaying && compTakes.length === 0;
  els.compClearButton.disabled = compTakes.length === 0;
  els.compBestButton.disabled = bestPoolCount === 0;
  els.compPlayButton.classList.toggle("queue-active", state.isQueuePlaying && state.queueMode === "comp");
  els.compPlayButton.querySelector(".button-label").textContent =
    state.isQueuePlaying && state.queueMode === "comp" ? "Stop comp" : "Play comp";

  els.compLaneList.innerHTML = compTakes.length
    ? compTakes
      .map((take, index) => renderCompLaneRow(take, index, compTakes.length))
      .join("")
    : `<span class="empty-takes">Select takes from the pool or Takes tab.</span>`;

  els.compPoolList.innerHTML = poolTakes.length
    ? poolTakes.map((take, index) => renderCompPoolRow(take, index)).join("")
    : `<span class="empty-takes">No unselected takes.</span>`;

  els.compLaneList.querySelectorAll("[data-comp-move]").forEach((button) => {
    button.addEventListener("click", () => moveCompTake(button.dataset.compMove, Number(button.dataset.delta)));
  });
  els.compLaneList.querySelectorAll("[data-comp-remove]").forEach((button) => {
    button.addEventListener("click", () => removeCompTake(button.dataset.compRemove));
  });
  els.compPoolList.querySelectorAll("[data-comp-add]").forEach((button) => {
    button.addEventListener("click", () => addCompTake(button.dataset.compAdd));
  });
}

function renderCompLaneRow(take, index, total) {
  const isPlaying = take.id === state.currentTakeId || state.sessionPlayingTakeIds.has(take.id);
  return `
    <div class="comp-row ${isPlaying ? "active" : ""}">
      <div class="comp-order">${index + 1}</div>
      <div class="comp-row-main">
        <strong>${escapeHtml(getTakeTitle(take, index))}</strong>
        ${take.bestTake ? `<span class="take-badge">Best</span>` : ""}
        <small>${escapeHtml(getTakeSubtitle(take))}</small>
        ${renderTakeWaveform(take)}
      </div>
      <div class="comp-row-actions">
        <button class="mini-button" type="button" data-comp-move="${take.id}" data-delta="-1" ${index === 0 ? "disabled" : ""}>Up</button>
        <button class="mini-button" type="button" data-comp-move="${take.id}" data-delta="1" ${index === total - 1 ? "disabled" : ""}>Down</button>
        <button class="mini-button danger" type="button" data-comp-remove="${take.id}">Remove</button>
      </div>
    </div>
  `;
}

function renderCompPoolRow(take, index) {
  return `
    <div class="comp-pool-row">
      <div>
        <strong>${escapeHtml(getTakeTitle(take, index))}</strong>
        ${take.bestTake ? `<span class="take-badge">Best</span>` : ""}
        <small>${escapeHtml(getTakeSubtitle(take))}</small>
      </div>
      <button class="mini-button" type="button" data-comp-add="${take.id}">Add</button>
    </div>
  `;
}

function renderTakeWaveform(take) {
  if (!take.waveform?.length) {
    return "";
  }

  const peaks = downsampleWaveform(take.waveform, 48);
  const width = 180;
  const height = 30;
  const center = height / 2;
  const step = width / Math.max(1, peaks.length - 1);
  const top = peaks
    .map((peak, index) => `${(index * step).toFixed(1)},${(center - peak * 12).toFixed(1)}`)
    .join(" ");
  const bottom = peaks
    .map((peak, index) => `${((peaks.length - 1 - index) * step).toFixed(1)},${(center + peaks[peaks.length - 1 - index] * 12).toFixed(1)}`)
    .join(" ");
  return `
    <svg class="take-waveform" viewBox="0 0 ${width} ${height}" aria-hidden="true" focusable="false">
      <polygon points="${top} ${bottom}"></polygon>
    </svg>
  `;
}

function renderExportPanel() {
  if (!els.exportList) {
    return;
  }

  const metadata = getExportMetadata();
  const rows = [
    { label: "Full mix", count: getAudibleTakes().length + (state.beatArrayBuffer ? 1 : 0), unit: "source" },
    { label: "Track stems", count: getStemExportGroups().length, unit: "source" },
    { label: "Beat stem", count: state.beatArrayBuffer ? 1 : 0, unit: "source" },
    { label: "Vocal stem", count: getAudibleTakes().length, unit: "source" },
    { label: "Dry vocals", count: getAllTakes().filter((take) => !take.processed).length, unit: "source" },
    { label: "Tuned vocals", count: getAllTakes().filter((take) => take.processed).length, unit: "source" },
    { label: "Metadata", count: [metadata.artist, metadata.title, metadata.bpm, metadata.key].filter(Boolean).length, unit: "field" },
    { label: "WAV depth", count: `${getExportBitDepth()}-bit`, unit: "" },
    { label: "Loudness target", count: els.exportLoudnessNormalizeInput.checked ? `-14 LUFS ${formatGainDb(state.lastExportLoudnessGain)}` : "Off", unit: "" },
    { label: "Normalize", count: els.exportNormalizeInput.checked ? `On ${formatGainDb(state.lastExportNormalizeGain)}` : "Off", unit: "" },
    { label: "Compressed export", count: getCompressedExportStatus(), unit: "" },
  ];
  const jobs = state.exportQueue.slice(-8).reverse();
  const hasFinishedExports = state.exportQueue.some((job) => job.status === "done" || job.status === "failed");

  const sourceRows = rows
    .map(
      (row) => `
        <div class="export-row">
          <strong>${row.label}</strong>
          <small>${formatExportRowCount(row)}</small>
        </div>
      `,
    )
    .join("");
  const queueRows = jobs.length
    ? jobs
      .map(
        (job) => `
          <div class="export-row export-job-row ${job.status}">
            <div>
              <strong>${escapeHtml(job.label)}</strong>
              <small>${escapeHtml(job.previewName || job.detail || getExportJobStatusLabel(job.status))}</small>
            </div>
            <div class="export-job-actions">
              <span>${getExportJobStatusLabel(job.status)}</span>
              ${job.previewUrl ? `<button class="mini-button" type="button" data-preview-export="${job.id}">Preview</button>` : ""}
              ${job.status === "done" && job.previewBlob ? `<button class="mini-button" type="button" data-download-export="${job.id}">Download</button>` : ""}
              ${job.status === "failed" ? `<button class="mini-button" type="button" data-retry-export="${job.id}">Retry</button>` : ""}
              ${job.status === "done" || job.status === "failed" ? `<button class="mini-button danger" type="button" data-remove-export="${job.id}">Remove</button>` : ""}
            </div>
          </div>
        `,
      )
      .join("")
    : `<span class="empty-takes">No export jobs yet</span>`;

  els.exportList.innerHTML = `
    <div class="export-section-heading">Sources</div>
    ${sourceRows}
    <div class="export-section-heading">Loudness</div>
    ${renderLoudnessReport()}
    <div class="export-section-heading export-queue-heading">
      <span>Queue</span>
      ${hasFinishedExports ? `<button class="mini-button" type="button" data-clear-finished-exports>Clear finished</button>` : ""}
    </div>
    ${queueRows}
  `;

  els.exportList.querySelectorAll("[data-preview-export]").forEach((button) => {
    button.addEventListener("click", () => playExportPreview(button.dataset.previewExport));
  });
  els.exportList.querySelectorAll("[data-download-export]").forEach((button) => {
    button.addEventListener("click", () => downloadExportJob(button.dataset.downloadExport));
  });
  els.exportList.querySelectorAll("[data-retry-export]").forEach((button) => {
    button.addEventListener("click", () => retryExportJob(button.dataset.retryExport));
  });
  els.exportList.querySelectorAll("[data-remove-export]").forEach((button) => {
    button.addEventListener("click", () => removeExportJob(button.dataset.removeExport));
  });
  els.exportList.querySelector("[data-clear-finished-exports]")?.addEventListener("click", clearFinishedExportJobs);
}

function renderLoudnessReport() {
  if (state.isAnalyzingLoudness) {
    return `<span class="empty-takes">Analyzing full mix...</span>`;
  }

  const report = state.loudnessReport;
  if (!report) {
    return `<span class="empty-takes">No loudness analysis yet</span>`;
  }

  const stale = report.sourceSignature !== getMixSourceSignature();
  const clippingClass = report.clippingSamples > 0 ? " warning" : "";
  const clipRisk = getClippingRisk(report, stale);
  return `
    <div class="loudness-grid">
      <div class="export-row${stale ? " warning" : ""}">
        <strong>Integrated</strong>
        <small>${formatLufs(report.integratedLufs)}${stale ? " / stale" : ""}</small>
      </div>
      <div class="export-row">
        <strong>True peak</strong>
        <small>${formatDb(report.truePeakDbfs ?? report.peakDbfs)} dBTP / sample ${formatDb(report.peakDbfs)}</small>
      </div>
      <div class="export-row">
        <strong>Target gain</strong>
        <small>${formatDb(report.recommendedGainDb)} dB to -14 LUFS</small>
      </div>
      <div class="export-row${clippingClass}">
        <strong>Clipping</strong>
        <small>${report.clippingSamples} samples</small>
      </div>
      <div class="export-row${clipRisk.warning ? " warning" : ""}">
        <strong>Clip risk</strong>
        <small>${escapeHtml(clipRisk.label)}</small>
      </div>
    </div>
  `;
}

function getClippingRisk(report, stale = false) {
  if (stale) {
    return { warning: true, label: "Re-analyze mix" };
  }

  const truePeakDb = Number(report?.truePeakDbfs ?? report?.peakDbfs ?? -Infinity);
  const clippingSamples = Number(report?.clippingSamples || 0);
  if (clippingSamples > 0) {
    return { warning: true, label: `${clippingSamples} clipped samples` };
  }

  if (truePeakDb >= -0.1) {
    return { warning: true, label: `${formatDb(truePeakDb)} dBTP near ceiling` };
  }

  if (truePeakDb >= -1) {
    return { warning: false, label: `${formatDb(truePeakDb)} dBTP close` };
  }

  return { warning: false, label: "Safe headroom" };
}

function formatExportRowCount(row) {
  if (typeof row.count === "string") {
    return row.count;
  }

  return `${row.count} ${row.unit}${row.count === 1 ? "" : "s"}`;
}

function getCompressedExportStatus() {
  const driver = window.PunchLabEngine?.getDriver?.();
  return driver?.capabilities?.compressedAudioExport ? "Native MP3/M4A ready" : "Native required";
}

function updateExportMetadata() {
  renderExportPanel();
  scheduleAutosave();
}

function updateProjectLyrics() {
  scheduleAutosave();
}

function updateProjectNotes() {
  scheduleAutosave();
}

function updateTempoSettings() {
  renderTimeline();
  renderExportPanel();
  scheduleAutosave();
}

function updateTimelineSnapMode() {
  renderTimeline();
  scheduleAutosave();
}

function renderLyrics() {
  if (!els.lyricSectionList) {
    return;
  }

  const markers = normalizeMarkers(state.markers);
  state.markers = markers;
  els.lyricSectionList.innerHTML = markers.length
    ? markers
      .map(
        (marker) => `
          <label class="lyric-section-card">
            <span class="label-row">
              <strong>${escapeHtml(marker.type)}</strong>
              <small>${formatDuration(marker.time)}</small>
            </span>
            <textarea spellcheck="false" data-marker-lyrics="${marker.id}" placeholder="${escapeHtml(marker.type)} lyrics...">${escapeHtml(marker.lyrics)}</textarea>
          </label>
        `,
      )
      .join("")
    : `<span class="empty-takes">Add timeline markers to write section lyrics.</span>`;

  els.lyricSectionList.querySelectorAll("[data-marker-lyrics]").forEach((textarea) => {
    textarea.addEventListener("input", () => updateMarkerLyrics(textarea.dataset.markerLyrics, textarea.value));
  });
}

function updateMarkerLyrics(markerId, value) {
  const marker = state.markers.find((item) => item.id === markerId);
  if (!marker) {
    return;
  }

  marker.lyrics = value;
  renderTimelineMarkerSummary();
  scheduleAutosave();
}

function getExportMetadata() {
  return {
    artist: els.exportArtistInput?.value.trim() || "",
    title: els.exportTitleInput?.value.trim() || "",
    bpm: String(Number(els.bpmInput.value) || 140),
    key: getPitchModeLabel(),
    software: "PunchLab",
  };
}

function getExportBitDepth() {
  return normalizeExportBitDepth(els.exportBitDepthSelect?.value);
}

function normalizeExportBitDepth(bitDepth) {
  return Number(bitDepth) === 24 ? 24 : 16;
}

function getExportWavOptions() {
  return {
    bitDepth: getExportBitDepth(),
  };
}

function getMixSourceSignature() {
  return JSON.stringify({
    beatBytes: state.beatArrayBuffer?.byteLength || 0,
    beatName: state.beatFileName || "",
    takes: getAudibleTakes().map((take) => {
      const track = findTrack(take.trackId);
      return [
        take.id,
        take.startTime || 0,
        getTakeVisibleDuration(take),
        getTakeSourceOffset(take),
        getTakeClipGain(take),
        getTakeFadeIn(take),
        getTakeFadeOut(take),
        track?.volume ?? 0,
        track?.pan ?? 0,
        track?.muted ? 1 : 0,
        track?.solo ? 1 : 0,
      ];
    }),
  });
}

function renderTimeline() {
  if (!els.timelineRegions) {
    return;
  }

  const timelineEnd = getTimelineEndPosition();
  const beatDuration = els.beatAudio.src && Number.isFinite(els.beatAudio.duration) ? els.beatAudio.duration : 0;
  const takes = getAllTakes();
  const markers = normalizeMarkers(state.markers);
  state.markers = markers;
  els.timelineLength.textContent = formatDuration(timelineEnd);

  els.timelineRuler.innerHTML = makeTimelineTicks(timelineEnd)
    .map(
      (tick) => `
        <span class="timeline-tick" style="left: ${timelinePercent(tick, timelineEnd)}%">
          <span>${formatDuration(tick)}</span>
        </span>
      `,
    )
    .join("");

  els.timelineGrid.innerHTML = makeTimelineGridLines(timelineEnd)
    .map(
      (line) => `
        <span class="timeline-grid-line ${line.isBar ? "bar" : "beat"}" style="left: ${timelinePercent(line.time, timelineEnd)}%">
          ${line.label ? `<span>${line.label}</span>` : ""}
        </span>
      `,
    )
    .join("");
  updateTimelineGridMeta();

  els.timelineMarkers.innerHTML = markers
    .map(
      (marker) => `
        <span class="timeline-marker" style="left: ${timelinePercent(marker.time, timelineEnd)}%">
          <span title="${escapeHtml(marker.comment || marker.type)}">${escapeHtml(marker.type)}</span>
        </span>
      `,
    )
    .join("");

  const beatRegion = beatDuration
    ? `
      <div class="timeline-region beat-region" style="left: 0%; width: ${timelinePercent(beatDuration, timelineEnd)}%; --track-color: var(--lime);">
        <strong>${escapeHtml(state.beatFileName || "Beat")}</strong>
      </div>
    `
    : "";
  const takeRegions = takes
    .map((take, index) => {
      const start = take.startTime || 0;
      const width = Math.max(1.2, timelinePercent(take.duration || 0.2, timelineEnd));
      const left = timelinePercent(start, timelineEnd);
      const regionColor = getTakeRegionColor(take);
      return `
        <div class="timeline-region take-region" style="left: ${left}%; width: ${width}%; --row-index: ${index}; --track-color: ${regionColor};">
          <strong>${escapeHtml(getTakeShortName(take))}</strong>
          <small>${escapeHtml(getRegionGroupLabel(getTakeRegionGroup(take)))}</small>
        </div>
      `;
    })
    .join("");
  els.timelineRegions.innerHTML = beatRegion + takeRegions;

  renderTimelineMarkerSummary(markers);

  els.regionList.innerHTML = takes.length
    ? takes
      .map(
        (take, index) => `
          <div class="region-row">
            <header>
              <strong>${escapeHtml(getTakeTitle(take, index))}</strong>
              <div class="region-header-actions">
                <small>${escapeHtml(take.trackName)}</small>
                <button class="mini-button" type="button" data-duplicate-region="${take.id}">Copy</button>
                <button class="mini-button danger" type="button" data-delete-region="${take.id}">Del</button>
              </div>
            </header>
            <input class="region-name-input" type="text" value="${escapeHtml(getTakeTitle(take, index))}" data-region-name="${take.id}" />
            <label class="region-color-control">
              Color
              <span>
                <i style="--region-color: ${getTakeRegionColor(take)};"></i>
                <input type="color" value="${getTakeRegionColor(take)}" data-region-color="${take.id}" />
              </span>
            </label>
            <label class="region-group-control">
              Group
              <select data-region-group="${take.id}">
                ${renderRegionGroupOptions(getTakeRegionGroup(take))}
              </select>
            </label>
            <div class="region-actions">
              <button class="mini-button" type="button" data-nudge-region="${take.id}" data-delta="-0.1">-0.1</button>
              <input type="number" min="0" step="0.1" value="${formatTimelineInputTime(take.startTime || 0)}" data-region-start="${take.id}" />
              <button class="mini-button" type="button" data-nudge-region="${take.id}" data-delta="0.1">+0.1</button>
            </div>
            <div class="region-controls region-trim-controls">
              <label>
                Source
                <input type="number" min="0" step="0.05" value="${getTakeSourceOffset(take).toFixed(2)}" data-region-source-offset="${take.id}" />
              </label>
              <label>
                Length
                <input type="number" min="0.05" step="0.05" value="${getTakeVisibleDuration(take).toFixed(2)}" data-region-duration="${take.id}" />
              </label>
            </div>
            <div class="region-controls">
              <label>
                Gain
                <input type="number" min="0" max="3" step="0.05" value="${getTakeClipGain(take).toFixed(2)}" data-region-gain="${take.id}" />
              </label>
              <label>
                In
                <input type="number" min="0" step="0.05" value="${getTakeFadeIn(take).toFixed(2)}" data-region-fade-in="${take.id}" />
              </label>
              <label>
                Out
                <input type="number" min="0" step="0.05" value="${getTakeFadeOut(take).toFixed(2)}" data-region-fade-out="${take.id}" />
              </label>
            </div>
          </div>
        `,
      )
      .join("")
    : `<span class="empty-takes">No regions</span>`;

  els.regionList.querySelectorAll("[data-region-start]").forEach((input) => {
    input.addEventListener("change", () => setRegionStart(input.dataset.regionStart, input.value));
  });
  els.regionList.querySelectorAll("[data-region-name]").forEach((input) => {
    input.addEventListener("change", () => setRegionName(input.dataset.regionName, input.value));
  });
  els.regionList.querySelectorAll("[data-region-gain]").forEach((input) => {
    input.addEventListener("change", () => setRegionClipGain(input.dataset.regionGain, input.value));
  });
  els.regionList.querySelectorAll("[data-region-color]").forEach((input) => {
    input.addEventListener("change", () => setRegionColor(input.dataset.regionColor, input.value));
  });
  els.regionList.querySelectorAll("[data-region-group]").forEach((select) => {
    select.addEventListener("change", () => setRegionGroup(select.dataset.regionGroup, select.value));
  });
  els.regionList.querySelectorAll("[data-region-source-offset]").forEach((input) => {
    input.addEventListener("change", () => setRegionSourceOffset(input.dataset.regionSourceOffset, input.value));
  });
  els.regionList.querySelectorAll("[data-region-duration]").forEach((input) => {
    input.addEventListener("change", () => setRegionDuration(input.dataset.regionDuration, input.value));
  });
  els.regionList.querySelectorAll("[data-region-fade-in]").forEach((input) => {
    input.addEventListener("change", () => setRegionFade(input.dataset.regionFadeIn, "in", input.value));
  });
  els.regionList.querySelectorAll("[data-region-fade-out]").forEach((input) => {
    input.addEventListener("change", () => setRegionFade(input.dataset.regionFadeOut, "out", input.value));
  });
  els.regionList.querySelectorAll("[data-nudge-region]").forEach((button) => {
    button.addEventListener("click", () => nudgeRegionStart(button.dataset.nudgeRegion, Number(button.dataset.delta)));
  });
  els.regionList.querySelectorAll("[data-duplicate-region]").forEach((button) => {
    button.addEventListener("click", () => duplicateTimelineRegion(button.dataset.duplicateRegion));
  });
  els.regionList.querySelectorAll("[data-delete-region]").forEach((button) => {
    button.addEventListener("click", () => deleteTake(button.dataset.deleteRegion));
  });
}

function renderTimelineMarkerSummary(markers = normalizeMarkers(state.markers)) {
  if (!els.markerList) {
    return;
  }

  els.markerList.innerHTML = markers.length
    ? markers
      .map((marker) => {
        const lyricLineCount = getLyricLineCount(marker.lyrics);
        const lyricMeta = lyricLineCount ? ` / ${lyricLineCount} lines` : "";
        const commentMeta = marker.comment ? " / note" : "";
        return `
          <div class="marker-row">
            <header>
              <strong>${escapeHtml(marker.type)}</strong>
              <button class="mini-button danger" type="button" data-delete-marker="${marker.id}">Del</button>
            </header>
            <small>${formatDuration(marker.time)}${lyricMeta}${commentMeta}</small>
            <textarea class="marker-comment-input" spellcheck="false" data-marker-comment="${marker.id}" placeholder="Marker comment...">${escapeHtml(marker.comment)}</textarea>
          </div>
        `;
      })
      .join("")
    : `<span class="empty-takes">No markers</span>`;

  els.markerList.querySelectorAll("[data-delete-marker]").forEach((button) => {
    button.addEventListener("click", () => deleteTimelineMarker(button.dataset.deleteMarker));
  });
  els.markerList.querySelectorAll("[data-marker-comment]").forEach((textarea) => {
    textarea.addEventListener("focus", () => {
      textarea.dataset.historyRecorded = "0";
    });
    textarea.addEventListener("input", () => updateMarkerComment(textarea.dataset.markerComment, textarea.value, textarea));
    textarea.addEventListener("blur", () => {
      textarea.dataset.historyRecorded = "0";
    });
  });
}

function getLyricLineCount(value) {
  return String(value || "")
    .split(/\r?\n/)
    .filter((line) => line.trim()).length;
}

function recordTimelineHistory() {
  state.timelineUndoStack.push(createTimelineSnapshot());
  if (state.timelineUndoStack.length > 50) {
    state.timelineUndoStack.shift();
  }
  state.timelineRedoStack = [];
  updateTimelineHistoryButtons();
}

function clearTimelineHistory() {
  state.timelineUndoStack = [];
  state.timelineRedoStack = [];
  updateTimelineHistoryButtons();
}

function undoTimelineEdit() {
  if (!state.timelineUndoStack.length) {
    return;
  }

  const previous = state.timelineUndoStack.pop();
  state.timelineRedoStack.push(createTimelineSnapshot());
  restoreTimelineSnapshot(previous);
  els.sessionState.textContent = "Timeline undo";
  refreshTimelineEdit();
}

function redoTimelineEdit() {
  if (!state.timelineRedoStack.length) {
    return;
  }

  const next = state.timelineRedoStack.pop();
  state.timelineUndoStack.push(createTimelineSnapshot());
  restoreTimelineSnapshot(next);
  els.sessionState.textContent = "Timeline redo";
  refreshTimelineEdit();
}

function createTimelineSnapshot() {
  return {
    markers: state.markers.map((marker) => ({ ...marker })),
    takes: getAllTakes().map((take) => ({
      id: take.id,
      name: take.name || null,
      startTime: take.startTime || 0,
      duration: getTakeVisibleDuration(take),
      sourceOffset: getTakeSourceOffset(take),
      sourceDuration: getTakeSourceDuration(take),
      clipGain: take.clipGain ?? 1,
      regionColor: take.regionColor || null,
      regionGroup: getTakeRegionGroup(take),
      fadeIn: take.fadeIn || 0,
      fadeOut: take.fadeOut || 0,
    })),
  };
}

function restoreTimelineSnapshot(snapshot) {
  state.markers = normalizeMarkers(snapshot?.markers || []);
  const regionState = new Map((snapshot?.takes || []).map((take) => [take.id, take]));
  getAllTakes().forEach((take) => {
    const saved = regionState.get(take.id);
    if (!saved) {
      return;
    }

    take.name = saved.name || null;
    take.startTime = Math.max(0, Number(saved.startTime) || 0);
    take.duration = Math.max(0, Number(saved.duration) || 0);
    take.sourceOffset = Math.max(0, Number(saved.sourceOffset) || 0);
    take.sourceDuration = Math.max(0, Number(saved.sourceDuration) || 0);
    normalizeTakeTrim(take);
    take.clipGain = Math.max(0, Number(saved.clipGain ?? 1));
    take.regionColor = normalizeRegionColor(saved.regionColor) || null;
    take.regionGroup = normalizeRegionGroup(saved.regionGroup, take.trackId);
    take.fadeIn = Math.max(0, Number(saved.fadeIn) || 0);
    take.fadeOut = Math.max(0, Number(saved.fadeOut) || 0);
  });
}

function refreshTimelineEdit() {
  updateActiveSessionMix();
  renderTracks();
  renderTakes();
  renderTimeline();
  renderLyrics();
  updateExportButtons();
  updateTimelineHistoryButtons();
  scheduleAutosave();
}

function updateTimelineHistoryButtons() {
  if (!els.timelineUndoButton || !els.timelineRedoButton) {
    return;
  }

  els.timelineUndoButton.disabled = state.timelineUndoStack.length === 0;
  els.timelineRedoButton.disabled = state.timelineRedoStack.length === 0;
}

function addTimelineMarker() {
  recordTimelineHistory();
  const marker = {
    id: crypto.randomUUID(),
    type: els.markerTypeSelect.value,
    time: snapTimelineTime(els.markerTimeInput.value),
    comment: "",
  };
  state.markers.push(marker);
  state.markers = normalizeMarkers(state.markers);
  els.markerTimeInput.value = formatTimelineInputTime(marker.time);
  els.sessionState.textContent = "Marker added";
  refreshTimelineEdit();
}

function updateMarkerComment(markerId, value, textarea = null) {
  const marker = state.markers.find((item) => item.id === markerId);
  if (!marker || marker.comment === value) {
    return;
  }

  if (textarea && textarea.dataset.historyRecorded !== "1") {
    recordTimelineHistory();
    textarea.dataset.historyRecorded = "1";
  }

  marker.comment = value;
  els.sessionState.textContent = "Marker comment updated";
  updateTimelineHistoryButtons();
  scheduleAutosave();
}

function deleteTimelineMarker(markerId) {
  if (!state.markers.some((marker) => marker.id === markerId)) {
    return;
  }

  recordTimelineHistory();
  state.markers = state.markers.filter((marker) => marker.id !== markerId);
  els.sessionState.textContent = "Marker deleted";
  refreshTimelineEdit();
}

function setRegionStart(takeId, value) {
  const take = findTake(takeId);
  if (!take) {
    return;
  }

  const nextStart = snapTimelineTime(value);
  if (isSameTimelineNumber(take.startTime || 0, nextStart)) {
    renderTimeline();
    return;
  }

  recordTimelineHistory();
  take.startTime = nextStart;
  els.sessionState.textContent = "Region moved";
  refreshTimelineEdit();
}

function setRegionName(takeId, value) {
  setTakeName(takeId, value, "Region renamed");
}

function setTakeName(takeId, value, statusText = "Take renamed") {
  const take = findTake(takeId);
  if (!take) {
    return;
  }

  const nextName = value.trim() || null;
  if ((take.name || null) === nextName) {
    return;
  }

  recordTimelineHistory();
  take.name = nextName;
  els.sessionState.textContent = statusText;
  refreshTimelineEdit();
}

function setRegionClipGain(takeId, value) {
  const take = findTake(takeId);
  if (!take) {
    return;
  }

  const nextGain = Math.max(0, Number(value) || 0);
  if (isSameTimelineNumber(getTakeClipGain(take), nextGain)) {
    return;
  }

  recordTimelineHistory();
  take.clipGain = nextGain;
  els.sessionState.textContent = "Clip gain updated";
  refreshTimelineEdit();
}

function setRegionColor(takeId, value) {
  const take = findTake(takeId);
  if (!take) {
    return;
  }

  const nextColor = normalizeRegionColor(value);
  if (!nextColor || getTakeRegionColor(take) === nextColor) {
    return;
  }

  recordTimelineHistory();
  take.regionColor = nextColor;
  els.sessionState.textContent = "Region color updated";
  refreshTimelineEdit();
}

function setRegionGroup(takeId, value) {
  const take = findTake(takeId);
  if (!take) {
    return;
  }

  const nextGroup = normalizeRegionGroup(value, take.trackId);
  if (getTakeRegionGroup(take) === nextGroup) {
    return;
  }

  recordTimelineHistory();
  take.regionGroup = nextGroup;
  els.sessionState.textContent = "Region grouped";
  refreshTimelineEdit();
}

function setRegionSourceOffset(takeId, value) {
  const take = findTake(takeId);
  if (!take) {
    return;
  }

  const sourceDuration = getTakeSourceDuration(take);
  const maxOffset = Math.max(0, sourceDuration - 0.05);
  const nextOffset = Math.max(0, Math.min(Number(value) || 0, maxOffset));
  if (isSameTimelineNumber(getTakeSourceOffset(take), nextOffset)) {
    renderTimeline();
    return;
  }

  recordTimelineHistory();
  take.sourceOffset = nextOffset;
  normalizeTakeTrim(take);
  els.sessionState.textContent = "Region trimmed";
  refreshTimelineEdit();
}

function setRegionDuration(takeId, value) {
  const take = findTake(takeId);
  if (!take) {
    return;
  }

  const maxDuration = Math.max(0, getTakeSourceDuration(take) - getTakeSourceOffset(take));
  const nextDuration = maxDuration <= 0 ? 0 : Math.max(0.05, Math.min(Number(value) || 0.05, maxDuration));
  if (isSameTimelineNumber(getTakeVisibleDuration(take), nextDuration)) {
    renderTimeline();
    return;
  }

  recordTimelineHistory();
  take.duration = nextDuration;
  normalizeTakeTrim(take);
  els.sessionState.textContent = "Region length updated";
  refreshTimelineEdit();
}

function setRegionFade(takeId, edge, value) {
  const take = findTake(takeId);
  if (!take) {
    return;
  }

  const safeValue = Math.max(0, Number(value) || 0);
  const currentValue = edge === "in" ? getTakeFadeIn(take) : getTakeFadeOut(take);
  if (isSameTimelineNumber(currentValue, safeValue)) {
    return;
  }

  recordTimelineHistory();
  if (edge === "in") {
    take.fadeIn = safeValue;
  } else {
    take.fadeOut = safeValue;
  }
  els.sessionState.textContent = "Fade updated";
  refreshTimelineEdit();
}

function nudgeRegionStart(takeId, delta) {
  const take = findTake(takeId);
  if (!take) {
    return;
  }

  setRegionStart(takeId, nudgeTimelineTime(take.startTime || 0, delta));
}

function duplicateTimelineRegion(takeId) {
  const sourceTake = findTake(takeId);
  const track = findTrack(sourceTake?.trackId);
  if (!sourceTake || !track || !sourceTake.blob) {
    return;
  }

  stopCurrentTake(false);
  const sourceIndex = track.takes.findIndex((take) => take.id === sourceTake.id);
  const title = getTakeTitle(sourceTake, Math.max(0, sourceIndex));
  const duplicate = {
    ...sourceTake,
    id: crypto.randomUUID(),
    url: URL.createObjectURL(sourceTake.blob),
    createdAt: new Date(),
    startTime: (sourceTake.startTime || 0) + Math.max(0.2, sourceTake.duration || 0.5),
    name: `${title} copy`,
    compSelected: false,
    compOrder: null,
    bestTake: false,
    waveform: sourceTake.waveform ? [...sourceTake.waveform] : sourceTake.waveform,
    pitchAnalysis: clonePlainObject(sourceTake.pitchAnalysis),
    pitchPlan: clonePlainObject(sourceTake.pitchPlan),
    manualPitchTargets: clonePlainObject(sourceTake.manualPitchTargets),
    tuneSettings: clonePlainObject(sourceTake.tuneSettings),
  };
  normalizeTakeTrim(duplicate);

  track.takes.push(duplicate);
  normalizeCompOrder();
  state.latestTake = duplicate;
  state.selectedVocalTakeId = duplicate.id;
  els.downloadLatestButton.disabled = false;
  els.sessionState.textContent = "Region copied";
  refreshTimelineEdit();
}

function isSameTimelineNumber(left, right) {
  return Math.abs(Number(left || 0) - Number(right || 0)) < 0.0001;
}

function clonePlainObject(value) {
  if (value == null) {
    return value;
  }

  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
}

function getTimelineEndPosition() {
  const markerEnd = state.markers.reduce((end, marker) => Math.max(end, marker.time + 4), 0);
  return Math.max(16, getSessionEndPosition(), markerEnd);
}

function makeTimelineTicks(end) {
  const surfaceWidth = els.timelineRuler?.clientWidth || 800;
  const minTickWidth = surfaceWidth < 520 ? 92 : 64;
  const targetTickCount = Math.max(2, Math.floor(surfaceWidth / minTickWidth));
  const rawStep = end / targetTickCount;
  const step = getTimelineTickStep(rawStep);
  const ticks = [];
  for (let time = 0; time <= end; time += step) {
    ticks.push(time);
  }
  return ticks;
}

function getTimelineTickStep(rawStep) {
  return [1, 2, 5, 10, 15, 30, 60, 120].find((step) => step >= rawStep) || 240;
}

function makeTimelineGridLines(end) {
  const beatDuration = getBeatDuration();
  const maxLines = 192;
  const beatCount = Math.min(maxLines, Math.ceil(end / beatDuration) + 1);
  const lines = [];

  for (let beat = 0; beat < beatCount; beat += 1) {
    const time = beat * beatDuration;
    if (time > end + 0.001) {
      break;
    }

    const isBar = beat % 4 === 0;
    lines.push({
      time,
      isBar,
      label: isBar ? String(Math.floor(beat / 4) + 1) : "",
    });
  }

  return lines;
}

function updateTimelineGridMeta() {
  if (!els.timelineGridMeta) {
    return;
  }

  const bpm = Number(els.bpmInput.value) || 140;
  const snapLabel = {
    off: "snap off",
    beat: "beat snap",
    bar: "bar snap",
  }[getTimelineSnapMode()];
  els.timelineGridMeta.textContent = `${bpm} BPM / ${snapLabel}`;
}

function timelinePercent(value, end) {
  return Math.max(0, Math.min(100, (value / Math.max(1, end)) * 100));
}

function getBeatDuration() {
  return 60 / (Number(els.bpmInput.value) || 140);
}

function getTimelineSnapMode() {
  return normalizeTimelineSnapMode(els.timelineSnapSelect?.value || "off");
}

function normalizeTimelineSnapMode(value) {
  return ["off", "beat", "bar"].includes(value) ? value : "off";
}

function getTimelineSnapStep() {
  const mode = getTimelineSnapMode();
  if (mode === "off") {
    return 0;
  }

  return getBeatDuration() * (mode === "bar" ? 4 : 1);
}

function snapTimelineTime(value) {
  const safeValue = Math.max(0, Number(value) || 0);
  const step = getTimelineSnapStep();
  if (!step) {
    return safeValue;
  }

  return Math.max(0, Math.round(safeValue / step) * step);
}

function nudgeTimelineTime(value, delta) {
  const safeValue = Math.max(0, Number(value) || 0);
  const step = getTimelineSnapStep();
  if (!step) {
    return Math.max(0, safeValue + delta);
  }

  if (delta > 0) {
    return Math.ceil((safeValue + 0.0001) / step) * step;
  }

  return Math.max(0, Math.floor((safeValue - 0.0001) / step) * step);
}

function formatTimelineInputTime(value) {
  return snapToInputPrecision(value).toString();
}

function snapToInputPrecision(value) {
  return Number(Math.max(0, Number(value) || 0).toFixed(3));
}

function normalizeMarkers(markers = []) {
  return markers
    .map((marker) => ({
      id: marker.id || crypto.randomUUID(),
      type: marker.type || "Marker",
      time: Math.max(0, Number(marker.time) || 0),
      lyrics: String(marker.lyrics || ""),
      comment: String(marker.comment || ""),
    }))
    .sort((a, b) => a.time - b.time);
}

function downloadLatestTake() {
  if (!state.latestTake) {
    return;
  }

  const link = document.createElement("a");
  link.href = state.latestTake.url;
  link.download = makeTakeFilename(state.latestTake);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function exportFullMix() {
  const audibleTakes = getAudibleTakes();
  if (!state.beatArrayBuffer && !audibleTakes.length) {
    els.sessionState.textContent = "No audible mix";
    return;
  }

  enqueueExportJob({
    type: "mix",
    label: "Full mix",
    filename: makeMixFilename(),
  });
}

async function renderFullMixBlob() {
  return encodeWav(applyExportFinalize(await renderFullMixBuffer()), getExportMetadata(), getExportWavOptions());
}

async function renderFullMixBuffer() {
  if (!window.PunchLabEngine?.renderMixBuffer) {
    throw new Error("Mix engine missing.");
  }

  const audibleTakes = getAudibleTakes();
  const sampleRate = state.audioContext?.sampleRate || 48000;
  const decodeContext = new OfflineAudioContext(2, 1, sampleRate);
  const beatBuffer = state.beatArrayBuffer
    ? await decodeContext.decodeAudioData(state.beatArrayBuffer.slice(0))
    : null;
  const takeBuffers = await Promise.all(
    audibleTakes.map(async (take) => ({
      take,
      track: findTrack(take.trackId),
      buffer: await decodeContext.decodeAudioData(await take.blob.arrayBuffer()),
    })),
  );

  return window.PunchLabEngine.renderMixBuffer({
    sampleRate,
    beatBuffer,
    takes: takeBuffers.map(makeMixTakeSource),
  });
}

async function analyzeLoudness() {
  if (!window.PunchLabEngine?.analyzeLoudness) {
    els.sessionState.textContent = "Audio analyzer missing";
    return;
  }

  if (!state.beatArrayBuffer && !getAudibleTakes().length) {
    els.sessionState.textContent = "No audible mix";
    return;
  }

  try {
    state.isAnalyzingLoudness = true;
    els.sessionState.textContent = "Analyzing loudness";
    els.exportStatusText.textContent = "Analyzing";
    updateExportButtons();
    const audioBuffer = await renderFullMixBuffer();
    state.loudnessReport = {
      ...window.PunchLabEngine.analyzeLoudness(audioBuffer),
      analyzedAt: new Date(),
      sourceSignature: getMixSourceSignature(),
      sourceCount: getAudibleTakes().length + (state.beatArrayBuffer ? 1 : 0),
    };
    els.sessionState.textContent = `Loudness ${formatLufs(state.loudnessReport.integratedLufs)}`;
    els.exportStatusText.textContent = "Loudness ready";
  } catch (error) {
    state.loudnessReport = null;
    els.sessionState.textContent = "Loudness failed";
    els.exportStatusText.textContent = "Failed";
    console.error(error);
  } finally {
    state.isAnalyzingLoudness = false;
    updateExportButtons();
  }
}

async function exportTrackStems() {
  await exportRenderGroups(getStemExportGroups(), "Track stems");
}

async function exportBeatStem() {
  if (!state.beatArrayBuffer) {
    els.sessionState.textContent = "No beat";
    return;
  }

  await exportRenderGroups(
    [
      {
        name: "Beat stem",
        filename: `${makeExportBaseSlug()}-beat-stem.wav`,
        takes: [],
        includeBeat: true,
      },
    ],
    "Beat stem",
  );
}

async function exportVocalStem() {
  await exportRenderGroups(
    [
      {
        name: "Vocal stem",
        filename: `${makeExportBaseSlug()}-vocal-stem.wav`,
        takes: getAudibleTakes(),
        includeBeat: false,
      },
    ],
    "Vocal stem",
  );
}

async function exportDryVocals() {
  const takes = getAudibleTakes().filter((take) => !take.processed);
  await exportRenderGroups(
    [
      {
        name: "Dry vocals",
        filename: `${makeExportBaseSlug()}-dry-vocals.wav`,
        takes,
        includeBeat: false,
      },
    ],
    "Dry vocals",
  );
}

async function exportTunedVocals() {
  const takes = getAudibleTakes().filter((take) => take.processed);
  await exportRenderGroups(
    [
      {
        name: "Tuned vocals",
        filename: `${makeExportBaseSlug()}-tuned-vocals.wav`,
        takes,
        includeBeat: false,
      },
    ],
    "Tuned vocals",
  );
}

async function exportRenderGroups(groups, label) {
  const activeGroups = groups.filter((group) => group.includeBeat || group.takes.length > 0);
  if (!activeGroups.length) {
    els.sessionState.textContent = "No export source";
    return;
  }

  enqueueExportJob({
    type: "groups",
    label,
    groups: activeGroups.map((group) => ({
      ...group,
      takes: [...group.takes],
    })),
  });
}

function enqueueExportJob(job) {
  const queuedJob = {
    id: `export-${state.exportJobSeq}`,
    status: "queued",
    detail: "",
    createdAt: new Date(),
    ...job,
  };
  state.exportJobSeq += 1;
  state.exportQueue.push(queuedJob);
  trimExportQueue();
  els.sessionState.textContent = `${queuedJob.label} queued`;
  els.exportStatusText.textContent = "Queued";
  updateExportButtons();
  runExportQueue();
}

async function runExportQueue() {
  if (state.isExportQueueRunning) {
    renderExportPanel();
    return;
  }

  state.isExportQueueRunning = true;
  stopTakeQueue(false);
  stopSessionPlayback(false);
  stopCurrentTake(false);

  while (state.exportQueue.some((job) => job.status === "queued")) {
    const job = state.exportQueue.find((item) => item.status === "queued");
    job.status = "running";
    job.detail = "Rendering";
    state.isExportingMix = job.type === "mix";
    state.isExportingAssets = job.type === "groups";
    els.sessionState.textContent = `Rendering ${job.label}`;
    els.exportStatusText.textContent = job.label;
    updateExportButtons();

    try {
      await executeExportJob(job);
      job.status = "done";
      job.detail = "Downloaded";
      els.sessionState.textContent = `${job.label} exported`;
      els.exportStatusText.textContent = "Done";
    } catch (error) {
      job.status = "failed";
      job.detail = "Render failed";
      els.sessionState.textContent = "Export failed";
      els.exportStatusText.textContent = "Failed";
      console.error(error);
    } finally {
      state.isExportingMix = false;
      state.isExportingAssets = false;
      updateExportButtons();
    }
  }

  state.isExportQueueRunning = false;
  trimExportQueue();
  updateExportButtons();
}

async function executeExportJob(job) {
  if (job.type === "mix") {
    const wavBlob = await renderFullMixBlob();
    storeExportPreview(job, wavBlob, job.filename);
    downloadBlob(wavBlob, job.filename);
    return;
  }

  for (let index = 0; index < job.groups.length; index += 1) {
    const group = job.groups[index];
    job.detail = `${index + 1}/${job.groups.length} ${group.name}`;
    els.exportStatusText.textContent = job.detail;
    renderExportPanel();
    const wavBlob = await renderTakeMixBlob(group.takes, group.includeBeat);
    storeExportPreview(job, wavBlob, group.filename);
    downloadBlob(wavBlob, group.filename);
  }
}

function storeExportPreview(job, blob, filename) {
  cleanupExportJob(job);

  job.previewBlob = blob;
  job.previewUrl = URL.createObjectURL(blob);
  job.previewName = filename;
}

function downloadExportJob(jobId) {
  const job = state.exportQueue.find((item) => item.id === jobId);
  if (!job?.previewBlob) {
    els.sessionState.textContent = "No export file";
    return;
  }

  const filename = job.previewName || `${slugify(job.label || "export")}.wav`;
  downloadBlob(job.previewBlob, filename);
  els.sessionState.textContent = `Downloaded ${filename}`;
}

async function playExportPreview(jobId) {
  const job = state.exportQueue.find((item) => item.id === jobId);
  if (!job?.previewUrl) {
    els.sessionState.textContent = "No preview";
    return;
  }

  stopTakeQueue(false);
  stopSessionPlayback(false);
  stopCurrentTake(false);
  stopExportPreview(false);

  const audio = new Audio(job.previewUrl);
  await applyPlaybackOutput(audio);
  state.exportPreviewAudio = audio;
  audio.addEventListener("ended", () => {
    if (state.exportPreviewAudio === audio) {
      state.exportPreviewAudio = null;
      els.sessionState.textContent = "Preview ended";
    }
  });
  audio
    .play()
    .then(() => {
      els.sessionState.textContent = `Preview ${job.label}`;
    })
    .catch((error) => {
      state.exportPreviewAudio = null;
      els.sessionState.textContent = "Preview blocked";
      console.error(error);
    });
}

function stopExportPreview(shouldRender = true) {
  if (state.exportPreviewAudio) {
    state.exportPreviewAudio.pause();
    state.exportPreviewAudio.currentTime = 0;
  }

  state.exportPreviewAudio = null;
  if (shouldRender) {
    renderExportPanel();
  }
}

function trimExportQueue() {
  const keep = 12;
  const overflow = state.exportQueue.length - keep;
  if (overflow <= 0) {
    return;
  }

  const removable = state.exportQueue
    .map((job, index) => ({ job, index }))
    .filter(({ job }) => job.status === "done" || job.status === "failed")
    .slice(0, overflow)
    .map(({ index }) => index);

  state.exportQueue.forEach((job, index) => {
    if (removable.includes(index)) {
      cleanupExportJob(job);
    }
  });
  state.exportQueue = state.exportQueue.filter((_, index) => !removable.includes(index));
}

function retryExportJob(jobId) {
  const job = state.exportQueue.find((item) => item.id === jobId);
  if (!job || job.status !== "failed") {
    return;
  }

  cleanupExportJob(job);
  job.status = "queued";
  job.detail = "";
  els.sessionState.textContent = `${job.label} requeued`;
  els.exportStatusText.textContent = "Queued";
  updateExportButtons();
  runExportQueue();
}

function removeExportJob(jobId) {
  const job = state.exportQueue.find((item) => item.id === jobId);
  if (!job || job.status === "queued" || job.status === "running") {
    els.sessionState.textContent = "Export still active";
    return;
  }

  stopExportPreview(false);
  cleanupExportJob(job);
  state.exportQueue = state.exportQueue.filter((item) => item.id !== jobId);
  els.sessionState.textContent = "Export job removed";
  updateExportButtons();
}

function clearFinishedExportJobs() {
  stopExportPreview(false);
  const before = state.exportQueue.length;
  state.exportQueue
    .filter((job) => job.status === "done" || job.status === "failed")
    .forEach(cleanupExportJob);
  state.exportQueue = state.exportQueue.filter((job) => job.status !== "done" && job.status !== "failed");
  const removed = before - state.exportQueue.length;
  els.sessionState.textContent = removed ? `Cleared ${removed} export job(s)` : "No finished exports";
  updateExportButtons();
}

function cleanupExportJob(job) {
  if (job?.previewUrl) {
    URL.revokeObjectURL(job.previewUrl);
  }
  if (job) {
    job.previewBlob = null;
    job.previewUrl = "";
    job.previewName = "";
  }
}

function getExportJobStatusLabel(status) {
  return {
    queued: "Queued",
    running: "Running",
    done: "Done",
    failed: "Failed",
  }[status] || "Idle";
}

async function renderTakeMixBlob(takes, includeBeat = false) {
  if (!window.PunchLabEngine?.renderMixBuffer) {
    throw new Error("Mix engine missing.");
  }

  const sampleRate = state.audioContext?.sampleRate || 48000;
  const decodeContext = new OfflineAudioContext(2, 1, sampleRate);
  const beatBuffer = includeBeat && state.beatArrayBuffer
    ? await decodeContext.decodeAudioData(state.beatArrayBuffer.slice(0))
    : null;
  const takeBuffers = await Promise.all(
    takes.map(async (take) => ({
      take,
      track: findTrack(take.trackId),
      buffer: await decodeContext.decodeAudioData(await take.blob.arrayBuffer()),
    })),
  );

  const renderedBuffer = await window.PunchLabEngine.renderMixBuffer({
    sampleRate,
    beatBuffer,
    takes: takeBuffers.map(makeMixTakeSource),
  });

  return encodeWav(applyExportFinalize(renderedBuffer), getExportMetadata(), getExportWavOptions());
}

function makeMixTakeSource({ take, track, buffer }) {
  return {
    buffer,
    startTime: take.startTime || 0,
    sourceOffset: getTakeSourceOffset(take),
    duration: getTakeVisibleDuration(take) || buffer.duration,
    volume: getTrackOutputVolume(track),
    pan: track?.pan || 0,
    clipGain: getTakeClipGain(take),
    fadeIn: getTakeFadeIn(take),
    fadeOut: getTakeFadeOut(take),
  };
}

function getStemExportGroups() {
  const groups = [];
  if (state.beatArrayBuffer) {
    groups.push({
      name: "Beat",
      filename: `${makeExportBaseSlug()}-beat-stem.wav`,
      takes: [],
      includeBeat: true,
    });
  }

  tracks.forEach((track) => {
    const volume = getTrackOutputVolume(track);
    if (volume <= 0 || !track.takes.length) {
      return;
    }

    groups.push({
      name: track.name,
      filename: `${makeExportBaseSlug()}-${slugify(track.name)}-stem.wav`,
      takes: track.takes,
      includeBeat: false,
    });
  });

  return groups;
}

function applyExportNormalize(audioBuffer) {
  if (!els.exportNormalizeInput.checked) {
    state.lastExportNormalizeGain = 1;
    return audioBuffer;
  }

  const peak = getAudioBufferPeak(audioBuffer);
  if (peak <= 0.000001) {
    state.lastExportNormalizeGain = 1;
    return audioBuffer;
  }

  const targetPeak = Math.pow(10, -1 / 20);
  const gain = targetPeak / peak;
  state.lastExportNormalizeGain = gain;
  return applyBufferGain(audioBuffer, gain);
}

function applyExportFinalize(audioBuffer) {
  const result = window.PunchLabExportMastering.finalizeAudio(audioBuffer, {
    analyzer: window.PunchLabEngine?.analyzeLoudness,
    ceilingDb: -1,
    loudnessNormalize: els.exportLoudnessNormalizeInput.checked,
    peakNormalize: els.exportNormalizeInput.checked,
    targetLufs: -14,
    truePeakLimiter: window.PunchLabEngine?.applyTruePeakCeiling || window.PunchLabAudio?.applyTruePeakCeiling,
  });
  state.lastExportLoudnessGain = result.loudnessGain;
  state.lastExportNormalizeGain = result.normalizeGain;
  return result.audioBuffer;
}

function encodeWav(audioBuffer, metadata = null, options = {}) {
  return window.PunchLabEngine.encodeWav(audioBuffer, metadata, options);
}

function downloadBlob(blob, filename) {
  window.PunchLabEngine.downloadBlob(blob, filename);
}

async function saveBlobWithPlatform(blob, filename, pickerOptions = {}) {
  const nativeResult = await window.PunchLabPlatform?.saveProjectFile?.(blob, filename);
  if (nativeResult) {
    return nativeResult;
  }

  if (!window.PunchLabFiles?.saveBlob) {
    downloadBlob(blob, filename);
    return { canceled: false, method: "download" };
  }

  return window.PunchLabFiles.saveBlob(blob, filename, pickerOptions);
}

function toggleCompTake(takeId) {
  const take = findTake(takeId);
  if (!take) {
    return;
  }

  if (take.compSelected) {
    removeCompTake(takeId);
    return;
  }

  addCompTake(takeId);
}

function addCompTake(takeId) {
  const take = findTake(takeId);
  if (!take) {
    return;
  }

  take.compSelected = true;
  take.compOrder = getNextCompOrder();
  normalizeCompOrder();
  els.sessionState.textContent = "Added to comp";
  renderTakes();
  scheduleAutosave();
}

function removeCompTake(takeId) {
  const take = findTake(takeId);
  if (!take) {
    return;
  }

  take.compSelected = false;
  take.compOrder = null;
  normalizeCompOrder();
  els.sessionState.textContent = "Removed from comp";
  renderTakes();
  scheduleAutosave();
}

function toggleBestTake(takeId) {
  const take = findTake(takeId);
  if (!take) {
    return;
  }

  take.bestTake = !take.bestTake;
  els.sessionState.textContent = take.bestTake ? "Marked best take" : "Unmarked best take";
  renderTakes();
  scheduleAutosave();
}

function addBestTakesToComp() {
  const bestPoolTakes = getAllTakes()
    .filter((take) => take.bestTake && !take.compSelected)
    .sort((a, b) => (a.startTime || 0) - (b.startTime || 0) || a.createdAt.getTime() - b.createdAt.getTime());

  if (!bestPoolTakes.length) {
    els.sessionState.textContent = "No best takes to add";
    renderCompView();
    return;
  }

  bestPoolTakes.forEach((take) => {
    take.compSelected = true;
    take.compOrder = getNextCompOrder();
  });
  normalizeCompOrder();
  els.sessionState.textContent = `${bestPoolTakes.length} best take${bestPoolTakes.length === 1 ? "" : "s"} added`;
  renderTakes();
  scheduleAutosave();
}

function moveCompTake(takeId, delta) {
  const compTakes = getCompTakes();
  const index = compTakes.findIndex((take) => take.id === takeId);
  const nextIndex = index + delta;
  if (index < 0 || nextIndex < 0 || nextIndex >= compTakes.length) {
    return;
  }

  [compTakes[index], compTakes[nextIndex]] = [compTakes[nextIndex], compTakes[index]];
  compTakes.forEach((take, order) => {
    take.compOrder = order + 1;
  });
  els.sessionState.textContent = "Comp order updated";
  renderTakes();
  scheduleAutosave();
}

function clearCompLane() {
  getCompTakes().forEach((take) => {
    take.compSelected = false;
    take.compOrder = null;
  });
  els.sessionState.textContent = "Comp cleared";
  renderTakes();
  scheduleAutosave();
}

function normalizeCompOrder() {
  getCompTakes().forEach((take, index) => {
    take.compOrder = index + 1;
  });
}

function getNextCompOrder() {
  return getCompTakes().reduce((max, take) => Math.max(max, Number(take.compOrder) || 0), 0) + 1;
}

function deleteTake(takeId) {
  const track = tracks.find((item) => item.takes.some((take) => take.id === takeId));
  if (!track) {
    return;
  }

  stopSessionPlayback(false);
  stopTakeQueue(false);
  if (state.currentTakeId === takeId) {
    stopCurrentTake(false);
  }

  const take = track.takes.find((item) => item.id === takeId);
  URL.revokeObjectURL(take.url);
  track.takes = track.takes.filter((item) => item.id !== takeId);
  normalizeCompOrder();
  state.latestTake = getAllTakes().at(-1) || null;
  state.recordWaveform = state.latestTake?.waveform ? [...state.latestTake.waveform] : [];
  if (state.selectedVocalTakeId === takeId) {
    state.selectedVocalTakeId = state.latestTake?.id || null;
  }
  els.downloadLatestButton.disabled = !state.latestTake;
  els.sessionState.textContent = "Take deleted";
  renderTracks();
  renderArmTracks();
  renderTakes();
  renderTimeline();
  renderLyrics();
  updateQueueButton();
  updateExportButtons();
  scheduleAutosave();
}

function updateTimer() {
  if (state.isRecording) {
    els.clock.textContent = formatDuration((performance.now() - state.recordStart) / 1000);
  } else if (state.isSessionPlaying) {
    els.clock.textContent = formatDuration(getCurrentSessionPosition());
  } else if (els.beatAudio && !els.beatAudio.paused) {
    els.clock.textContent = formatDuration(els.beatAudio.currentTime);
  }

  state.timerFrame = requestAnimationFrame(updateTimer);
}

function formatDuration(seconds) {
  const safeSeconds = Math.max(0, seconds || 0);
  const minutes = Math.floor(safeSeconds / 60);
  const secs = Math.floor(safeSeconds % 60);
  const tenths = Math.floor((safeSeconds % 1) * 10);
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${tenths}`;
}

function formatGainDb(gain) {
  const db = gainToDb(gain);
  return `${db >= 0 ? "+" : ""}${db.toFixed(1)} dB`;
}

function gainToDb(gain) {
  return 20 * Math.log10(Math.max(0.000001, Number(gain) || 0.000001));
}

function formatDb(value) {
  if (!Number.isFinite(value)) {
    return "-inf";
  }

  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}`;
}

function formatRatio(value) {
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;
  return Number.isInteger(safeValue) ? String(safeValue) : safeValue.toFixed(1);
}

function formatLufs(value) {
  if (!Number.isFinite(value)) {
    return "-inf LUFS";
  }

  return `${value.toFixed(1)} LUFS`;
}

function formatSigned(value) {
  return `${value >= 0 ? "+" : ""}${value}`;
}

function formatSemitones(value) {
  const safeValue = Number.isFinite(value) ? value : 0;
  return `${safeValue >= 0 ? "+" : ""}${safeValue.toFixed(1)} st`;
}

function findTake(takeId) {
  return tracks.flatMap((track) => track.takes).find((take) => take.id === takeId);
}

function findTrack(trackId) {
  return tracks.find((track) => track.id === trackId);
}

function getAllTakes() {
  return tracks
    .flatMap((track) => track.takes)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

function getCompTakes() {
  return getAllTakes()
    .filter((take) => take.compSelected)
    .sort((a, b) => {
      const leftOrder = Number.isFinite(Number(a.compOrder)) ? Number(a.compOrder) : Number.POSITIVE_INFINITY;
      const rightOrder = Number.isFinite(Number(b.compOrder)) ? Number(b.compOrder) : Number.POSITIVE_INFINITY;
      return leftOrder - rightOrder || (a.startTime || 0) - (b.startTime || 0) || a.createdAt.getTime() - b.createdAt.getTime();
    });
}

function getSelectedPreset() {
  return presets.find((preset) => preset.id === state.selectedPresetId) || presets[0];
}

function getTuneSettings() {
  const settings = {
    retuneSpeed: Number(els.retuneSpeedSlider?.value) || 0,
    humanize: Number(els.humanizeSlider?.value) || 0,
    vibrato: Number(els.vibratoSlider?.value) || 0,
    formant: Number(els.formantSlider?.value) || 0,
    gate: Number(els.gateSlider?.value) || 0,
    deEss: Number(els.deEssSlider?.value) || 0,
    comp: Number(els.compSlider?.value) || 0,
    compThreshold: Number(els.compThresholdSlider?.value) || 0,
    compRatio: Number(els.compRatioSlider?.value) || 0,
    compAttack: Number(els.compAttackSlider?.value) || 0,
    compRelease: Number(els.compReleaseSlider?.value) || 0,
    saturation: Number(els.saturationSlider?.value) || 0,
    space: Number(els.spaceSlider?.value) || 0,
    delay: Number(els.delaySlider?.value) || 0,
    reverb: Number(els.reverbSlider?.value) || 0,
    width: Number(els.widthSlider?.value) || 0,
    lowEq: Number(els.lowEqSlider?.value) || 0,
    midEq: Number(els.midEqSlider?.value) || 0,
    airEq: Number(els.airEqSlider?.value) || 0,
    limiterCeiling: Number(els.limiterCeilingSlider?.value) || 0,
  };
  return window.PunchLabChainParams?.coerceSettings?.(settings) || settings;
}

function getSelectedVocalTake() {
  return state.selectedVocalTakeId ? findTake(state.selectedVocalTakeId) : null;
}

function getComparisonPair(take) {
  if (!take) {
    return null;
  }

  if (take.processed && take.sourceTakeId) {
    const source = findTake(take.sourceTakeId);
    return source ? { source, processed: take } : null;
  }

  const processed = getLatestProcessedTakeForSource(take.id);
  return processed ? { source: take, processed } : null;
}

function getLatestProcessedTakeForSource(sourceTakeId) {
  if (!sourceTakeId) {
    return null;
  }

  return getAllTakes()
    .filter((take) => take.processed && take.sourceTakeId === sourceTakeId)
    .sort(compareProcessedTimeline)
    .at(-1);
}

function getProcessedVersionsForSource(sourceTakeId) {
  if (!sourceTakeId) {
    return [];
  }

  return getAllTakes()
    .filter((take) => take.processed && take.sourceTakeId === sourceTakeId)
    .sort(compareProcessedVersions);
}

function compareProcessedVersions(a, b) {
  const presetDelta = String(a.presetName || "").localeCompare(String(b.presetName || ""));
  if (presetDelta) {
    return presetDelta;
  }

  const versionDelta = (a.version || 1) - (b.version || 1);
  return versionDelta || a.createdAt.getTime() - b.createdAt.getTime();
}

function compareProcessedTimeline(a, b) {
  const versionDelta = (a.version || 1) - (b.version || 1);
  return versionDelta || a.createdAt.getTime() - b.createdAt.getTime();
}

function getNextProcessedVersion(sourceTakeId, presetId) {
  const currentMax = getAllTakes()
    .filter((take) => take.processed && take.sourceTakeId === sourceTakeId && take.presetId === presetId)
    .reduce((max, take) => Math.max(max, Number(take.version) || 1), 0);
  return currentMax + 1;
}

function getBatchSourceTargets(selectedTake) {
  const rawTakes = getAllTakes().filter((take) => !take.processed);
  const scope = els.batchScopeSelect.value;
  if (scope === "all") {
    return rawTakes;
  }

  if (scope === "comp") {
    return getCompTakes().filter((take) => !take.processed);
  }

  if (scope === "best") {
    return rawTakes.filter((take) => take.bestTake);
  }

  const trackId = selectedTake?.trackId || state.armedTrackId;
  return rawTakes.filter((take) => take.trackId === trackId);
}

function getBatchTargets(selectedTake) {
  const sourceTargets = getBatchSourceTargets(selectedTake);
  if (!shouldSkipRenderedBatchTargets()) {
    return sourceTargets;
  }

  const preset = getSelectedPreset();
  const tuneSettings = getTuneSettings();
  return sourceTargets.filter((take) => !hasProcessedTakeForChain(take, preset, tuneSettings));
}

function shouldSkipRenderedBatchTargets() {
  return Boolean(els.batchSkipRenderedInput?.checked);
}

function hasProcessedTakeForChain(sourceTake, preset, tuneSettings) {
  if (!sourceTake || !preset) {
    return false;
  }

  const tuneSignature = getTuneSignature(tuneSettings);
  return getAllTakes().some((take) => {
    const takeTuneSettings = take.tuneSettings || take.chainSnapshot?.tuneSettings || null;
    return take.processed
      && take.sourceTakeId === sourceTake.id
      && take.presetId === preset.id
      && getTuneSignature(takeTuneSettings) === tuneSignature;
  });
}

function getBatchScopeReadyText(scope, count, skippedCount = 0) {
  const messages = {
    all: `Will render ${count} raw take(s) across all vocal tracks.`,
    best: `Will render ${count} best raw take(s).`,
    comp: `Will render ${count} raw take(s) from the comp lane.`,
    track: `Will render ${count} raw take(s) on this track.`,
  };
  const skippedText = skippedCount ? ` Skipping ${skippedCount} already rendered.` : "";
  return `${messages[scope] || messages.track}${skippedText}`;
}

function getBatchScopeEmptyText(scope, skippedCount = 0) {
  if (skippedCount) {
    return "All matching raw takes already have this preset/tune render.";
  }

  const messages = {
    all: "No raw vocal takes available.",
    best: "No best raw takes selected.",
    comp: "No raw takes in the comp lane.",
    track: "No raw takes on this track.",
  };
  return messages[scope] || messages.track;
}

function getAudibleTakes() {
  return getAllTakes().filter((take) => getTrackOutputVolume(findTrack(take.trackId)) > 0);
}

function getCurrentSessionPosition() {
  if (state.isSessionPlaying) {
    return state.sessionOrigin + (performance.now() - state.sessionStartedAt) / 1000;
  }

  if (els.beatAudio.src) {
    return els.beatAudio.currentTime;
  }

  return 0;
}

function getSessionEndPosition() {
  const beatEnd = els.beatAudio.src && Number.isFinite(els.beatAudio.duration) ? els.beatAudio.duration : 0;
  const takeEnd = getAllTakes().reduce((end, take) => Math.max(end, (take.startTime || 0) + take.duration), 0);
  return Math.max(beatEnd, takeEnd);
}

function hasSoloTrack() {
  return tracks.some((track) => track.solo);
}

function isTrackAudible(track) {
  if (!track) {
    return false;
  }

  return hasSoloTrack() ? track.solo && !track.muted : !track.muted;
}

function getTrackOutputVolume(track) {
  return isTrackAudible(track) ? track.volume : 0;
}

function normalizeTakeTrim(take) {
  const sourceDuration = getTakeSourceDuration(take);
  take.sourceDuration = sourceDuration;
  take.sourceOffset = getTakeSourceOffset(take);
  const maxDuration = Math.max(0, sourceDuration - take.sourceOffset);
  take.duration = maxDuration <= 0 ? 0 : Math.max(0.05, Math.min(Number(take.duration || maxDuration), maxDuration));
  return take;
}

function getTakeSourceDuration(take) {
  const duration = Math.max(0, Number(take?.duration) || 0);
  const sourceOffset = Math.max(0, Number(take?.sourceOffset) || 0);
  return Math.max(duration + sourceOffset, Number(take?.sourceDuration) || 0);
}

function getTakeSourceOffset(take) {
  const sourceDuration = getTakeSourceDuration(take);
  const sourceOffset = Math.max(0, Number(take?.sourceOffset) || 0);
  return Math.min(sourceOffset, Math.max(0, sourceDuration - 0.05));
}

function getTakeVisibleDuration(take) {
  const sourceDuration = getTakeSourceDuration(take);
  const sourceOffset = getTakeSourceOffset(take);
  const maxDuration = Math.max(0, sourceDuration - sourceOffset);
  if (maxDuration <= 0) {
    return 0;
  }

  return Math.max(0.05, Math.min(Number(take?.duration || maxDuration), maxDuration));
}

function setTrackName(trackId, value) {
  const track = findTrack(trackId);
  if (!track) {
    return;
  }

  const nextName = value.trim() || getDefaultTrackName(trackId);
  if (track.name === nextName) {
    renderTracks();
    return;
  }

  track.name = nextName;
  track.takes.forEach((take) => {
    take.trackName = nextName;
  });
  if (state.armedTrackId === track.id) {
    els.armedTrackName.textContent = nextName;
  }

  els.sessionState.textContent = "Track renamed";
  renderTracks();
  renderArmTracks();
  renderTakes();
  renderTimeline();
  renderVocalPanel();
  updateExportButtons();
  scheduleAutosave();
}

function getDefaultTrackName(trackId) {
  const fallbackNames = {
    main: "Main",
    double: "Double",
    "adlib-l": "Adlib L",
    "adlib-r": "Adlib R",
    hook: "Hook",
  };
  return fallbackNames[trackId] || "Track";
}

function getTakeClipGain(take) {
  return Math.max(0, Number(take?.clipGain ?? 1));
}

function getTakeRegionColor(take) {
  return normalizeRegionColor(take?.regionColor) || normalizeRegionColor(findTrack(take?.trackId)?.color) || "#c8ff4d";
}

function getTakeRegionGroup(take) {
  return normalizeRegionGroup(take?.regionGroup, take?.trackId);
}

function normalizeRegionGroup(value, trackId = "") {
  const groupId = String(value || "").trim().toLowerCase();
  return REGION_GROUPS.some((group) => group.id === groupId) ? groupId : getDefaultRegionGroupForTrack(trackId);
}

function getDefaultRegionGroupForTrack(trackId) {
  if (trackId === "hook") {
    return "hook";
  }

  if (String(trackId || "").startsWith("adlib")) {
    return "adlib";
  }

  return "verse";
}

function getRegionGroupLabel(groupId) {
  return REGION_GROUPS.find((group) => group.id === groupId)?.label || "Verse";
}

function renderRegionGroupOptions(selectedGroup) {
  return REGION_GROUPS.map(
    (group) => `<option value="${group.id}" ${group.id === selectedGroup ? "selected" : ""}>${group.label}</option>`,
  ).join("");
}

function normalizeRegionColor(value) {
  const color = String(value || "").trim();
  if (/^#[0-9a-f]{6}$/i.test(color)) {
    return color.toLowerCase();
  }

  if (/^#[0-9a-f]{3}$/i.test(color)) {
    return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`.toLowerCase();
  }

  return "";
}

function getTakeFadeIn(take) {
  return Math.max(0, Math.min(Number(take?.fadeIn ?? 0), Math.max(0, (take?.duration || 0) / 2)));
}

function getTakeFadeOut(take) {
  return Math.max(0, Math.min(Number(take?.fadeOut ?? 0), Math.max(0, (take?.duration || 0) / 2)));
}

function applyTakeGainAutomation(audioParam, volume, take, offset = 0, startAt = 0) {
  const fadeIn = getTakeFadeIn(take);
  const fadeOut = getTakeFadeOut(take);
  const duration = Math.max(0, (take?.duration || 0) - offset);
  const fadeInRemaining = Math.max(0, fadeIn - offset);
  const fadeOutStart = Math.max(startAt, startAt + duration - fadeOut);
  const endAt = startAt + duration;

  audioParam.cancelScheduledValues(startAt);
  if (fadeInRemaining > 0) {
    audioParam.setValueAtTime(0, startAt);
    audioParam.linearRampToValueAtTime(volume, startAt + fadeInRemaining);
  } else {
    audioParam.setValueAtTime(volume, startAt);
  }

  if (fadeOut > 0 && endAt > startAt) {
    audioParam.setValueAtTime(volume, fadeOutStart);
    audioParam.linearRampToValueAtTime(0, endAt);
  }
}

function setTrackVolume(trackId, value) {
  const track = findTrack(trackId);
  if (!track) {
    return;
  }

  track.volume = Number(value);
  updateActiveSessionMix();
  updateExportButtons();
  renderTracks();
  scheduleAutosave();
}

function setTrackPan(trackId, value) {
  const track = findTrack(trackId);
  if (!track) {
    return;
  }

  track.pan = Number(value);
  updateActiveSessionMix();
  updateExportButtons();
  renderTracks();
  scheduleAutosave();
}

function toggleTrackMute(trackId) {
  const track = findTrack(trackId);
  if (!track) {
    return;
  }

  track.muted = !track.muted;
  updateActiveSessionMix();
  updateExportButtons();
  renderTracks();
  scheduleAutosave();
}

function toggleTrackSolo(trackId) {
  const track = findTrack(trackId);
  if (!track) {
    return;
  }

  track.solo = !track.solo;
  updateActiveSessionMix();
  updateExportButtons();
  renderTracks();
  scheduleAutosave();
}

function toggleTrackFolder(folderId) {
  if (!TRACK_FOLDERS.some((folder) => folder.id === folderId)) {
    return;
  }

  state.trackFolderCollapsed = normalizeTrackFolderCollapsed(state.trackFolderCollapsed);
  state.trackFolderCollapsed[folderId] = !state.trackFolderCollapsed[folderId];
  renderTracks();
  scheduleAutosave();
}

function toggleTrackFolderMute(folderId) {
  const folderTracks = getTrackFolderTracks(folderId);
  if (!folderTracks.length) {
    return;
  }

  const nextMuted = !folderTracks.every((track) => track.muted);
  folderTracks.forEach((track) => {
    track.muted = nextMuted;
  });
  updateActiveSessionMix();
  updateExportButtons();
  renderTracks();
  scheduleAutosave();
}

function toggleTrackFolderSolo(folderId) {
  const folderTracks = getTrackFolderTracks(folderId);
  if (!folderTracks.length) {
    return;
  }

  const nextSolo = !folderTracks.every((track) => track.solo);
  folderTracks.forEach((track) => {
    track.solo = nextSolo;
  });
  updateActiveSessionMix();
  updateExportButtons();
  renderTracks();
  scheduleAutosave();
}

function getTrackFolderTracks(folderId) {
  const folder = TRACK_FOLDERS.find((item) => item.id === folderId);
  if (!folder) {
    return [];
  }

  return folder.trackIds
    .map((trackId) => findTrack(trackId))
    .filter(Boolean);
}

function normalizeTrackFolderCollapsed(value = {}) {
  return Object.fromEntries(TRACK_FOLDERS.map((folder) => [folder.id, Boolean(value?.[folder.id])]));
}

function updateQueueButton() {
  if (!els.playQueueButton) {
    return;
  }

  const allTakes = getAllTakes();
  const compTakes = getCompTakes();
  const allLabel = els.playQueueButton.querySelector(".button-label");
  const compLabel = els.playCompButton?.querySelector(".button-label");
  const isAllQueue = state.isQueuePlaying && state.queueMode === "all";
  const isCompQueue = state.isQueuePlaying && state.queueMode === "comp";
  els.playQueueButton.disabled = !state.isQueuePlaying && allTakes.length === 0;
  els.playQueueButton.classList.toggle("queue-active", isAllQueue);
  if (allLabel) {
    allLabel.textContent = isAllQueue ? "Stop all" : "Play all";
  }

  if (els.playCompButton) {
    els.playCompButton.disabled = !state.isQueuePlaying && compTakes.length === 0;
    els.playCompButton.classList.toggle("queue-active", isCompQueue);
    if (compLabel) {
      compLabel.textContent = isCompQueue ? "Stop comp" : "Play comp";
    }
  }

  if (els.compPlayButton) {
    const compPanelLabel = els.compPlayButton.querySelector(".button-label");
    els.compPlayButton.disabled = !state.isQueuePlaying && compTakes.length === 0;
    els.compPlayButton.classList.toggle("queue-active", isCompQueue);
    if (compPanelLabel) {
      compPanelLabel.textContent = isCompQueue ? "Stop comp" : "Play comp";
    }
  }

  if (els.compClearButton) {
    els.compClearButton.disabled = compTakes.length === 0;
  }

  if (els.compBestButton) {
    els.compBestButton.disabled = getAllTakes().every((take) => !take.bestTake || take.compSelected);
  }
}

function updateExportButtons() {
  if (!els.exportMixButton) {
    return;
  }

  const hasAudibleSources = Boolean(state.beatArrayBuffer) || getAudibleTakes().length > 0;
  const label = els.exportMixButton.querySelector(".button-label");
  els.exportMixButton.disabled = !hasAudibleSources;
  els.exportMixButton.classList.toggle("rendering", state.isExportingMix);
  if (label) {
    label.textContent = state.isExportingMix ? "Rendering" : "Full mix";
  }

  const hasStems = getStemExportGroups().length > 0;
  const hasBeatStem = Boolean(state.beatArrayBuffer);
  const hasVocals = getAudibleTakes().length > 0;
  const hasDry = getAllTakes().some((take) => !take.processed && getTrackOutputVolume(findTrack(take.trackId)) > 0);
  const hasTuned = getAllTakes().some((take) => take.processed && getTrackOutputVolume(findTrack(take.trackId)) > 0);
  els.exportStemsButton.disabled = !hasStems;
  els.exportBeatStemButton.disabled = !hasBeatStem;
  els.exportVocalStemButton.disabled = !hasVocals;
  els.exportDryVocalsButton.disabled = !hasDry;
  els.exportTunedVocalsButton.disabled = !hasTuned;
  if (els.analyzeLoudnessButton) {
    const analyzeLabel = els.analyzeLoudnessButton.querySelector(".button-label");
    els.analyzeLoudnessButton.disabled = state.isAnalyzingLoudness || !hasAudibleSources;
    els.analyzeLoudnessButton.classList.toggle("rendering", state.isAnalyzingLoudness);
    if (analyzeLabel) {
      analyzeLabel.textContent = state.isAnalyzingLoudness ? "Analyzing" : "Analyze loudness";
    }
  }
  els.exportStemsButton.classList.toggle("rendering", state.isExportingAssets);
  els.exportBeatStemButton.classList.toggle("rendering", state.isExportingAssets);
  els.exportVocalStemButton.classList.toggle("rendering", state.isExportingAssets);
  els.exportDryVocalsButton.classList.toggle("rendering", state.isExportingAssets);
  els.exportTunedVocalsButton.classList.toggle("rendering", state.isExportingAssets);
  renderExportPanel();
}

function formatPercent(value) {
  return `${Math.round(value * 100)}%`;
}

function formatPan(value) {
  if (Math.abs(value) < 0.01) {
    return "C";
  }

  return value < 0 ? `L${Math.round(Math.abs(value) * 100)}` : `R${Math.round(value * 100)}`;
}

function makeTakeFilename(take) {
  const slug = slugify(take.trackName);
  const preset = take.presetName ? `-${slugify(take.presetName)}` : "";
  const version = take.processed ? `-v${take.version || 1}` : "";
  return `punchlab-${slug}${preset}${version}-${take.id.slice(0, 8)}.${take.extension}`;
}

function makeMixFilename() {
  return `${makeExportBaseSlug()}-mix.wav`;
}

function makeExportBaseSlug() {
  const metadata = getExportMetadata();
  const source = [metadata.artist, metadata.title].filter(Boolean).join("-") || state.beatFileName || "session";
  return `punchlab-${slugify(source.replace(/\.[^.]+$/, "")) || "session"}`;
}

function slugify(value) {
  return String(value || "session")
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getTakeTitle(take, index) {
  if (take.name) {
    return take.name;
  }

  if (take.processed) {
    return `${take.trackName} ${take.presetName || "Processed"} v${take.version || 1}`;
  }

  return `${take.trackName} take ${index + 1}`;
}

function getTakeSubtitle(take) {
  const compTag = take.compSelected ? "comp / " : "";
  const bestTag = take.bestTake ? "best / " : "";
  const latencyTag = formatTakeLatencyTag(take);
  if (take.processed) {
    return `${bestTag}${compTag}processed v${take.version || 1} / ${getTuneSignature(take.tuneSettings)} / ${formatDuration(take.duration)} @ ${formatDuration(take.startTime || 0)}${latencyTag}`;
  }

  return `${bestTag}${compTag}raw / ${formatDuration(take.duration)} @ ${formatDuration(take.startTime || 0)}${latencyTag}`;
}

function getTakeShortName(take) {
  if (take.name) {
    return take.name;
  }

  return take.processed ? `${take.trackName} ${take.presetName || "Processed"} v${take.version || 1}` : `${take.trackName} raw`;
}

function formatTakeLatencyTag(take) {
  const latencyMs = Number(take?.recordLatencyMs || 0);
  return latencyMs > 0 ? ` / latency -${Math.round(latencyMs)}ms` : "";
}

function getTuneSignature(settings = {}) {
  settings ||= {};
  const retuneSpeed = Number(settings.retuneSpeed ?? 0);
  const humanize = Number(settings.humanize ?? 0);
  const vibrato = Number(settings.vibrato ?? 0);
  const formant = Number(settings.formant ?? 0);
  const gate = Number(settings.gate ?? 0);
  const deEss = Number(settings.deEss ?? 0);
  const comp = Number(settings.comp ?? 0);
  const compThreshold = Number(settings.compThreshold ?? getDefaultCompThreshold(comp));
  const compRatio = Number(settings.compRatio ?? getDefaultCompRatio(comp));
  const saturation = Number(settings.saturation ?? 0);
  const space = Number(settings.space ?? 0);
  const delay = Number(settings.delay ?? 0);
  const reverb = Number(settings.reverb ?? 0);
  const width = Number(settings.width ?? 0);
  const lowEq = Number(settings.lowEq ?? 0);
  const midEq = Number(settings.midEq ?? 0);
  const airEq = Number(settings.airEq ?? 0);
  const limiterCeiling = Number(settings.limiterCeiling ?? -3);
  return `R${retuneSpeed} H${humanize} V${vibrato} F${formatSigned(formant)} G${gate} D${deEss} C${comp} Dyn${formatDb(compThreshold)}/${formatRatio(compRatio)} Sat${saturation} S${space} DL${delay} RV${reverb} W${width} EQ${formatDb(lowEq)}/${formatDb(midEq)}/${formatDb(airEq)} Lim${formatDb(limiterCeiling)}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

init();
