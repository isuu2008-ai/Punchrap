if (!window.PunchLabStudioState?.createState) {
  throw new Error("PunchLab studio state module failed to load.");
}
if (!window.PunchLabRuntimeGuard?.bindGlobalErrorHandlers) {
  throw new Error("PunchLab runtime guard module failed to load.");
}

const state = window.PunchLabStudioState.createState({
  getDefaultCustomScaleIntervals: () => window.PunchLabPitch.getDefaultCustomScaleIntervals(),
});
const tracks = window.PunchLabStudioState.createTracks();
const TRACK_FOLDERS = window.PunchLabStudioState.createTrackFolders();
const presets = window.PunchLabStudioState.createPresets();

if (!window.PunchLabUIElements?.createElements) {
  throw new Error("PunchLab UI elements module failed to load.");
}

const els = window.PunchLabUIElements.createElements();

if (!window.PunchLabUIRenderers?.createRenderers) {
  throw new Error("PunchLab UI renderers module failed to load.");
}

const uiRenderers = window.PunchLabUIRenderers.createRenderers({
  els,
  state,
  escapeHtml,
  formatDuration,
  formatPitchNote,
  getPitchFrameKey,
  getTakeTitle,
  getTakeSubtitle,
  downsampleWaveform,
  formatBackupHistoryLabel,
  formatDisplayTimestamp,
  getDesktopReadiness: () => window.PunchLabDesktop?.getReadiness?.(),
  getTemplate: (templateId) => window.PunchLabTemplates?.getTemplate?.(templateId) || null,
  listTemplates: () => window.PunchLabTemplates?.listTemplates?.() || null,
});

const {
  renderRegionGroupOptions,
  renderCompPoolRow,
  renderAudioDeviceSelect,
  renderPitchLaneFrame,
  renderTakeWaveform,
  updateTemplateMeta,
  renderRecoverySelect,
  renderProjectTemplates,
  renderPluginScanStatus,
  formatPluginScanStatusTitle,
} = uiRenderers;

if (!window.PunchLabBeatPlayback?.createBeatPlayback) {
  throw new Error("PunchLab beat playback module failed to load.");
}

const beatPlayback = window.PunchLabBeatPlayback.createBeatPlayback({
  els,
  state,
  applyPlaybackOutput,
  ensureAudioContext,
  formatGainDb,
  scheduleAutosave,
});

const {
  normalizeBeatGain,
  prepareBeatPlayback,
  playBeatAudio,
  updateBeatGain,
} = beatPlayback;

if (!window.PunchLabShortcuts?.createGlobalShortcutHandler) {
  throw new Error("PunchLab shortcuts module failed to load.");
}

const handleGlobalShortcut = window.PunchLabShortcuts.createGlobalShortcutHandler({
  els,
  state,
  actions: {
    redoTimelineEdit,
    deleteSelectedTimelineRegion,
    setActiveView,
    stopAll,
    toggleMetronome,
    toggleRecord,
    toggleSessionPlayback,
    undoTimelineEdit,
  },
});

if (!window.PunchLabExportPanel?.createExportPanel) {
  throw new Error("PunchLab export panel module failed to load.");
}

const exportPanel = window.PunchLabExportPanel.createExportPanel({
  els,
  state,
  actions: {
    clearFinishedExportJobs,
    downloadExportJob,
    exportCompressedJob,
    playExportPreview,
    removeExportJob,
    retryExportJob,
  },
  helpers: {
    canExportCompressedAudio,
    escapeHtml,
    formatDb,
    formatGainDb,
    formatLufs,
    getAudibleCompTakes,
    getAudibleTakes,
    getExportBitDepth,
    getExportMetadata,
    getMixSourceSignature,
    getStemExportGroups,
  },
});

const { renderExportPanel } = exportPanel;

if (!window.PunchLabTimelinePanel?.createTimelinePanel) {
  throw new Error("PunchLab timeline panel module failed to load.");
}

const timelinePanel = window.PunchLabTimelinePanel.createTimelinePanel({
  els,
  state,
  actions: {
    deleteTake,
    deleteTimelineMarker,
    duplicateTimelineRegion,
    nudgeRegionStart,
    selectTimelineRegion,
    setRegionClipGain,
    setRegionColor,
    setRegionDuration,
    setRegionFade,
    setRegionGroup,
    setRegionName,
    setRegionSourceOffset,
    setRegionStart,
    updateMarkerComment,
  },
  helpers: {
    escapeHtml,
    formatDuration,
    formatTimelineInputTime,
    getAllTakes,
    getLyricLineCount,
    getRegionGroupLabel,
    getTakeClipGain,
    getTakeFadeIn,
    getTakeFadeOut,
    getTakeRegionColor,
    getTakeRegionGroup,
    getTakeShortName,
    getTakeSourceOffset,
    getTakeTitle,
    getTakeVisibleDuration,
    getTimelineCursorPosition,
    getTimelineEndPosition,
    makeTimelineGridLines,
    makeTimelineTicks,
    normalizeMarkers,
    renderTimelineCursor,
    renderTimelineRecordingPreview,
    renderRegionGroupOptions,
    timelinePercent,
    updateTimelineGridMeta,
  },
});

const {
  renderTimeline: renderArrangementTimeline,
  renderTimelineMarkerSummary,
} = timelinePanel;

if (!window.PunchLabRecordTimeline?.createRecordTimeline) {
  throw new Error("PunchLab record timeline module failed to load.");
}

const recordTimeline = window.PunchLabRecordTimeline.createRecordTimeline({
  els,
  state,
  tracks,
  helpers: {
    escapeHtml,
    formatDuration,
    getAllTakes,
    getTakeRegionColor,
    getTakeShortName,
    getTakeVisibleDuration,
    getTimelineCursorPosition,
    getTimelineEndPosition,
    makeTimelineTicks,
    timelinePercent,
  },
});

const {
  renderRecordTimeline,
  renderRecordTimelineCursor,
  updateRecordTimelineButtons,
} = recordTimeline;

const renderTimeline = () => {
  renderArrangementTimeline();
  renderRecordTimeline();
};

if (!window.PunchLabTrackPanel?.createTrackPanel) {
  throw new Error("PunchLab track panel module failed to load.");
}

const trackPanel = window.PunchLabTrackPanel.createTrackPanel({
  els,
  state,
  trackFolders: TRACK_FOLDERS,
  tracks,
  actions: {
    deleteTake,
    playTake,
    setTrackName,
    setTrackPan,
    setTrackVolume,
    toggleTrackFolder,
    toggleTrackFolderMute,
    toggleTrackFolderSolo,
    toggleTrackMute,
    toggleTrackSolo,
  },
  helpers: {
    escapeHtml,
    formatDuration,
    formatPan,
    formatPercent,
    getTrackFolderTracks,
    isTrackAudible,
  },
});

const {
  renderArmTracks,
  renderTracks,
} = trackPanel;

if (!window.PunchLabVocalPanel?.createVocalPanel) {
  throw new Error("PunchLab vocal panel module failed to load.");
}

const vocalPanel = window.PunchLabVocalPanel.createVocalPanel({
  els,
  state,
  actions: {
    deleteVocalVersion,
    playVocalVersion,
    selectVocalVersion,
    toggleBestTake,
    toggleCompTake,
  },
  helpers: {
    escapeHtml,
    findTake,
    formatDuration,
    formatSemitones,
    getAllTakes,
    getAverageCorrection,
    getBatchScopeEmptyText,
    getBatchScopeReadyText,
    getBatchSourceTargets,
    getBatchTargets,
    getComparisonPair,
    getKeyRootClass,
    getManualPitchCount,
    getPitchLaneFrames,
    getPitchModeLabel,
    getPitchPlan,
    getProcessedVersionsForSource,
    getScaleNoteName,
    getSelectedPreset,
    getSelectedVocalTake,
    getTakeShortName,
    getTakeTitle,
    getTuneSignature,
    isVocalBusy,
    makeTakeFilename,
    normalizeScaleIntervals,
    renderPitchLaneFrame,
  },
});

const { renderVocalPanel } = vocalPanel;

if (!window.PunchLabCompPanel?.createCompPanel) {
  throw new Error("PunchLab comp panel module failed to load.");
}

const compPanel = window.PunchLabCompPanel.createCompPanel({
  els,
  state,
  actions: {
    addCompTake,
    moveCompTake,
    removeCompTake,
  },
  helpers: {
    escapeHtml,
    getAllTakes,
    getCompTakes,
    getTakeSubtitle,
    getTakeTitle,
    renderCompPoolRow,
    renderTakeWaveform,
  },
});

const { renderCompView } = compPanel;

if (!window.PunchLabTakePanel?.createTakePanel) {
  throw new Error("PunchLab take panel module failed to load.");
}

const takePanel = window.PunchLabTakePanel.createTakePanel({
  els,
  state,
  actions: {
    deleteTake,
    downloadTakeWav,
    playTake,
    renderCompView,
    renderExportPanel,
    renderTimeline,
    renderVocalPanel,
    sendTakeToVocal,
    setTakeName,
    toggleBestTake,
    toggleCompTake,
    updateExportButtons,
    updateQueueButton,
  },
  helpers: {
    escapeHtml,
    findTake,
    formatDuration,
    getAllTakes,
    getTakeShortName,
    getTakeSubtitle,
    getTakeTitle,
    makeTakeFilename,
    renderTakeWaveform,
  },
});

const {
  renderQuickTakeReview,
  renderTakes,
} = takePanel;

if (!window.PunchLabUIEvents?.createEvents) {
  throw new Error("PunchLab UI events module failed to load.");
}

const uiEvents = window.PunchLabUIEvents.createEvents({
  els,
  state,
  actions: {
    setActiveView,
    enableMic,
    toggleInputMonitor,
    toggleSessionPlayback,
    stopAll,
    toggleRecord,
    scanPluginHosts,
    refreshNativeLatencyStats,
    loadBeat,
    updateTempoSettings,
    scheduleAutosave,
    updateTemplateMeta,
    applySelectedTemplate,
    updateInputGain,
    updateBeatGain,
    changeAudioInputDevice,
    changeAudioOutputDevice,
    changeNativeBufferSize,
    togglePunchMode,
    toggleLoopMode,
    toggleMetronome,
    updatePunchFromInputs,
    updateRecordLatency,
    renderVocalPanel,
    setPunchPoint,
    maintainLoopPlayback,
    toggleTakeQueue,
    clearCompLane,
    addBestTakesToComp,
    exportFullMix,
    playLatestTake,
    keepLatestTake,
    deleteLatestTake,
    recordAgainFromLatest,
    sendLatestTakeToVocal,
    addLatestTakeToComp,
    downloadLatestTake,
    updateTuneControls,
    syncCompDetailDefaults,
    previewSelectedVocalTake,
    analyzeSelectedVocalTake,
    renderSelectedVocalTake,
    playComparisonTake,
    handlePitchLaneClick,
    clearManualPitchLane,
    handleCustomScaleClick,
    renderBatchVocalTakes,
    saveProject,
    saveProjectZip,
    openProject,
    loadProject,
    recoverAutosave,
    updateRecoveryButton,
    handleRecordTimelinePointer,
    resetTimelineCursor,
    handleTimelinePointer,
    playFromTimelineCursor,
    recordFromTimelineCursor,
    setPunchPointFromTimeline,
    deleteSelectedTimelineRegion,
    addTimelineMarker,
    clearAllTakes,
    updateTimelineSnapMode,
    undoTimelineEdit,
    redoTimelineEdit,
    exportTrackStems,
    exportBeatStem,
    exportVocalStem,
    exportCompVocal,
    exportDryVocals,
    exportTunedVocals,
    analyzeLoudness,
    updateExportMetadata,
    updateProjectLyrics,
    updateProjectNotes,
    updateCustomPreset,
    saveCustomPreset,
  },
});

const { bindEvents } = uiEvents;

function init() {
  window.PunchLabRuntimeGuard.bindGlobalErrorHandlers({
    getStatusElement: () => els.sessionState,
  });
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
  renderRecordHealth();
  refreshAudioDevices();
  updateTimelineHistoryButtons();
  updateInputGain();
  updateBeatGain(false);
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

function renderRecordHealth() {
  if (!els.recordHealthSummary || !els.recordHealthList) {
    return;
  }

  const micReady = Boolean(state.stream);
  const recorderReady = typeof MediaRecorder !== "undefined" && Boolean(state.mimeType || state.stream || state.processedStream);
  const hasRecentSignal = micReady && (
    Number(state.lastInputDb) > -55
    || performance.now() - Number(state.lastSignalAt || 0) < 1500
  );
  const saveReady = Boolean(window.PunchLabStorage && window.PunchLabProject);
  const checks = [
    { label: "Mic", value: micReady ? "Ready" : "Off", ready: micReady },
    { label: "Signal", value: micReady ? hasRecentSignal ? "Live" : "Silent" : "Waiting", ready: hasRecentSignal },
    { label: "Recorder", value: recorderReady ? "Ready" : "Blocked", ready: recorderReady },
    { label: "Save", value: saveReady ? "Ready" : "Local", ready: saveReady },
  ];
  const readyCount = checks.filter((check) => check.ready).length;

  els.recordHealthSummary.textContent = readyCount >= 3 ? "Ready" : micReady ? "Check signal" : "Waiting";
  els.recordHealthList.innerHTML = checks
    .map((check) => `
      <div class="record-health-item" data-ready="${check.ready ? "true" : "false"}">
        <span>${escapeHtml(check.label)}</span>
        <strong>${escapeHtml(check.value)}</strong>
      </div>
    `)
    .join("");
}

function formatRuntimeLatency(value) {
  return window.PunchLabFormat.formatRuntimeLatency(value);
}

function getDisplayRoundTripLatency(desktopReadiness) {
  return desktopReadiness?.nativeAudioEngine?.runtimeRoundTripLatencyMs
    ?? state.loadedProjectEnvironment?.nativeAudio?.roundTripLatencyMs
    ?? null;
}

function formatDisplaySampleRate(value) {
  return window.PunchLabFormat.formatDisplaySampleRate(value);
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
  return window.PunchLabFormat.formatDisplayTimestamp(value);
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
  if (view === "record") {
    renderRecordTimeline();
  }
  if (view === "comp") {
    renderCompView();
  }
  if (view === "lyrics") {
    renderLyrics();
  }
}

function getBestMimeType() {
  return window.PunchLabDevices?.getBestMimeType?.() || "";
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
  state.lastInputDb = -Infinity;
  state.lastSignalAt = 0;
  els.micStatus.classList.remove("ready");
  renderRecordHealth();
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
    renderRecordHealth();
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
    renderRecordHealth();
    startMeter();
  } catch (error) {
    renderRecordHealth();
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
  updateBeatGain(false);
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
          accept: { "application/json": [".json", ".punchlab.json"] },
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
          accept: { "application/zip": [".zip", ".punchlab.zip"] },
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
    exportHistory: summarizeExportHistory(state.exportQueue.length ? state.exportQueue : bundle.exportHistory || state.loadedProjectExportHistory),
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
        gate: preset.gate,
        deEss: preset.deEss,
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
    timelineCursor: Number(settings.timelineCursor) || 0,
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
  return window.PunchLabPresets.getTuneSettingsForPreset(preset);
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

function summarizeExportHistory(source = state.exportQueue) {
  const jobs = Array.isArray(source) ? source : [];
  return jobs
    .filter((job) => job && (job.status === "done" || job.status === "failed"))
    .slice(-12)
    .map((job) => ({
      id: String(job.id || ""),
      type: String(job.type || ""),
      label: String(job.label || ""),
      status: String(job.status || "idle"),
      detail: String(job.detail || ""),
      fileName: String(job.previewName || job.fileName || ""),
      compressedStatus: String(job.compressedStatus || ""),
      createdAt: job.createdAt instanceof Date ? job.createdAt.toISOString() : job.createdAt || null,
    }));
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
    compressedExport: readiness.compressedExport
      ? {
        methodAvailable: Boolean(readiness.compressedExport.methodAvailable),
        ready: Boolean(readiness.compressedExport.ready),
        capabilityReady: Boolean(readiness.compressedExport.capabilityReady),
      }
      : null,
    projectFiles: readiness.projectFiles
      ? {
        methodAvailable: Boolean(readiness.projectFiles.methodAvailable),
        ready: Boolean(readiness.projectFiles.ready),
        nativeAvailable: Boolean(readiness.projectFiles.nativeAvailable),
        browserFileSystemAccess: Boolean(readiness.projectFiles.browserFileSystemAccess),
        browserFallback: Boolean(readiness.projectFiles.browserFallback),
        summary: readiness.projectFiles.summary || null,
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

function formatBackupHistoryLabel(backup, index) {
  return window.PunchLabStorage.formatBackupHistoryLabel(backup, index);
}

function applyLoadedProject(project) {
  revokeCurrentProjectAssets();
  state.loadedProjectEnvironment = project.environment || null;
  state.loadedProjectExportHistory = Array.isArray(project.exportHistory) ? project.exportHistory : [];

  if (project.beat) {
    state.beatArrayBuffer = project.beat.arrayBuffer;
    state.beatFileName = project.beat.fileName;
    state.beatUrl = URL.createObjectURL(project.beat.blob);
    els.beatAudio.src = state.beatUrl;
    updateBeatGain(false);
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
  void applyCurrentPlaybackOutput();
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
    beatGain: state.beatGain,
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
    timelineCursor: state.timelineCursor,
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
  state.timelineCursor = Math.max(0, Number(settings.timelineCursor || 0));
  els.inputGainSlider.value = settings.inputGain ?? state.inputGain;
  els.beatGainSlider.value = normalizeBeatGain(settings.beatGain ?? state.beatGain);
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
  updateBeatGain(false);
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
  return window.PunchLabDesktop.normalizeNativeBufferSize(value);
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

function setPunchPointFromTimeline(point) {
  const position = getTimelineCursorPosition();
  if (point === "in") {
    state.punchIn = Math.max(0, position);
    if (state.punchOut <= state.punchIn) {
      state.punchOut = state.punchIn + 4;
    }
    els.sessionState.textContent = "Punch in set";
  } else {
    state.punchOut = Math.max(state.punchIn + 0.1, position);
    els.sessionState.textContent = "Punch out set";
  }

  state.punchEnabled = state.punchOut > state.punchIn;
  updatePunchControls();
  renderTimelineCursor();
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
  updateTimelineTransportButtons();
}

async function toggleSessionPlayback() {
  if (state.isSessionPlaying) {
    stopSessionPlayback();
    els.sessionState.textContent = "Mix paused";
    return;
  }

  await playFromTimelineCursor();
}

async function playSession(options = {}) {
  const audibleTakes = getAllTakes().filter((take) => getTrackOutputVolume(findTrack(take.trackId)) > 0);

  if (!els.beatAudio.src && !audibleTakes.length) {
    els.sessionState.textContent = "Load beat";
    return;
  }

  stopTakeQueue(false);
  stopCurrentTake(false);
  stopSessionPlayback(false);
  await ensureAudioContext();

  const explicitOrigin = Number(options.origin);
  const hasExplicitOrigin = Number.isFinite(explicitOrigin);
  const loopRangeValid = !hasExplicitOrigin && state.loopEnabled && state.punchOut > state.punchIn;
  let origin = hasExplicitOrigin ? Math.max(0, explicitOrigin) : loopRangeValid ? state.punchIn : els.beatAudio.src ? els.beatAudio.currentTime : 0;
  if (els.beatAudio.src && Number.isFinite(els.beatAudio.duration) && origin >= els.beatAudio.duration - 0.05) {
    origin = 0;
  }
  if (!els.beatAudio.src && audibleTakes.length && !hasExplicitOrigin) {
    origin = Math.min(...audibleTakes.map((take) => take.startTime || 0));
  }

  state.isSessionPlaying = true;
  state.sessionOrigin = origin;
  setTimelineCursor(origin, { announce: false, render: false, snap: false, syncBeat: false });
  state.sessionStartedAt = performance.now();
  state.sessionPlayers = [];
  state.sessionPlayingTakeIds = new Set();
  updateSessionPlayButton();

  if (els.beatAudio.src) {
    els.beatAudio.currentTime = origin;
    try {
      await prepareBeatPlayback();
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
  renderTimelineCursor();
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
    setTimelineCursor(0, { announce: false, render: false, snap: false, syncBeat: false });
  } else if (els.beatAudio?.src) {
    setTimelineCursor(els.beatAudio.currentTime, { announce: false, render: false, snap: false, syncBeat: false });
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
  if (els.recordTimelinePlayButton) {
    els.recordTimelinePlayButton.classList.toggle("session-active", state.isSessionPlaying);
  }
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

function getLatestTakeForReview() {
  return state.latestTake || getAllTakes().at(-1) || null;
}

function playLatestTake() {
  const latestTake = getLatestTakeForReview();
  if (!latestTake) {
    els.sessionState.textContent = "No take";
    return;
  }

  state.latestTake = latestTake;
  playTake(latestTake.id);
}

function keepLatestTake() {
  const latestTake = getLatestTakeForReview();
  if (!latestTake) {
    els.sessionState.textContent = "No take";
    return;
  }

  state.latestTake = latestTake;
  els.sessionState.textContent = "Take kept";
  renderQuickTakeReview();
  scheduleAutosave();
}

function deleteLatestTake() {
  const latestTake = getLatestTakeForReview();
  if (!latestTake) {
    els.sessionState.textContent = "No take";
    return;
  }

  deleteTake(latestTake.id);
  els.sessionState.textContent = "Latest deleted";
}

async function recordAgainFromLatest() {
  const latestTake = getLatestTakeForReview();
  if (!latestTake) {
    els.sessionState.textContent = "No take";
    return;
  }

  const startPosition = Number.isFinite(latestTake.startTime) ? latestTake.startTime : getTimelineCursorPosition();
  if (tracks.some((track) => track.id === latestTake.trackId)) {
    state.armedTrackId = latestTake.trackId;
    renderArmTracks();
  }

  deleteTake(latestTake.id);
  setTimelineCursor(startPosition, { announce: false, snap: false });
  els.sessionState.textContent = "Retaking latest";
  await recordFromTimelineCursor();
}

function sendLatestTakeToVocal() {
  const latestTake = getLatestTakeForReview();
  if (!latestTake) {
    els.sessionState.textContent = "No take";
    return;
  }

  sendTakeToVocal(latestTake.id);
}

function addLatestTakeToComp() {
  const latestTake = getLatestTakeForReview();
  if (!latestTake) {
    els.sessionState.textContent = "No take";
    return;
  }

  if (latestTake.compSelected) {
    els.sessionState.textContent = "Already in comp";
    renderCompView();
    renderQuickTakeReview();
    return;
  }

  addCompTake(latestTake.id);
  els.sessionState.textContent = "Latest added to comp";
  renderQuickTakeReview();
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
  renderVocalPanel();

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
      renderVocalPanel();
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
  setTimelineCursor(0, { announce: false, render: false, snap: false, syncBeat: false });
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

  const startPosition = setTimelineCursor(getTimelineCursorPosition(), { announce: false, render: false });
  if (els.beatAudio.src && getCountInSeconds() > 0) {
    await startTimelinePreRollRecording(startPosition);
    return;
  }

  const bars = Number(els.countInSelect.value);
  if (bars > 0) {
    const completed = await countIn(bars);
    if (!completed) {
      return;
    }
  }

  if (els.beatAudio.src) {
    els.beatAudio.currentTime = startPosition;
  }
  startRecording({ startPosition });
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
  updateTimelineTransportButtons();
  els.sessionState.textContent = options.loopCycle ? "Loop record armed" : "Punch armed";

  if (els.beatAudio.src) {
    els.beatAudio.currentTime = playStart;
    playBeatAudio().catch((error) => {
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
    updateTimelineTransportButtons();
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
  setTimelineCursor(state.recordStartPosition, { announce: false, render: false, snap: false, syncBeat: false });
  state.recordWaveform = [];
  state.isPunchRecording = Boolean(options.punch);
  state.currentLoopCycle = Boolean(options.loopCycle);
  state.mediaRecorder.start(250);
  state.isRecording = true;
  els.recordButton.classList.add("active");
  renderRecordHealth();
  updateTimelineTransportButtons();
  renderQuickTakeReview();
  els.sessionState.textContent = options.loopCycle
    ? `Loop take ${state.loopRecordTakeCount + 1}`
    : options.punch ? "Punch recording" : "Recording";
  startMetronome();

  if (els.beatAudio.src && els.beatAudio.paused) {
    playBeatAudio().catch((error) => {
      console.error(error);
    });
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
  renderRecordHealth();
  updateTimelineTransportButtons();
  renderTimelineRecordingPreview();
  renderRecordTimelineCursor();
  els.sessionState.textContent = wasLoopCycle ? "Loop take saved" : wasPunchRecording ? "Punch saved" : "Take saved";
  if (!state.isSessionPlaying) {
    stopMetronome();
  }

  if (wasPunchRecording && state.loopEnabled && els.beatAudio.src && state.punchOut > state.punchIn) {
    els.beatAudio.currentTime = state.punchIn;
    playBeatAudio().catch((error) => {
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
  renderTimeline();
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
    state.lastInputDb = db;
    if (Number.isFinite(db) && db > -55) {
      state.lastSignalAt = performance.now();
    }
    if (performance.now() - Number(state.lastHealthRenderAt || 0) > 400) {
      state.lastHealthRenderAt = performance.now();
      renderRecordHealth();
    }
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
  return window.PunchLabPresets.createCustomPresetSnapshot({
    id,
    name,
    tuneSettings: getTuneSettings(),
  });
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
  return window.PunchLabPresets.normalizePreset(preset, {
    createId: () => `custom-${crypto.randomUUID()}`,
  });
}

function getDefaultCompThreshold(comp) {
  return window.PunchLabPresets.getDefaultCompThreshold(comp);
}

function getDefaultCompRatio(comp) {
  return window.PunchLabPresets.getDefaultCompRatio(comp);
}

function getDefaultCompRelease(comp) {
  return window.PunchLabPresets.getDefaultCompRelease(comp);
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

function selectVocalVersion(takeId) {
  if (!findTake(takeId)) {
    return;
  }

  state.selectedVocalTakeId = takeId;
  els.sessionState.textContent = "Version selected";
  renderVocalPanel();
}

function playVocalVersion(takeId) {
  if (!findTake(takeId)) {
    return;
  }

  state.selectedVocalTakeId = takeId;
  playTake(takeId);
  renderVocalPanel();
}

function deleteVocalVersion(takeId) {
  const versionTake = findTake(takeId);
  if (!versionTake?.processed) {
    return;
  }

  const sourceTake = versionTake.sourceTakeId ? findTake(versionTake.sourceTakeId) : null;
  deleteTake(takeId);
  if (sourceTake) {
    state.selectedVocalTakeId = sourceTake.id;
  }
  els.sessionState.textContent = "Version deleted";
  renderVocalPanel();
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
  return window.PunchLabPitch.normalizeScaleIntervals(intervals);
}

function getKeyRootClass(keyValue) {
  return window.PunchLabPitch.getKeyRootClass(keyValue, window.PunchLabDSP.NOTE_NAMES);
}

function getScaleNoteName(root, interval) {
  return window.PunchLabPitch.getScaleNoteName(root, interval, window.PunchLabDSP.NOTE_NAMES);
}

function renderTargetMidiOptions() {
  const noteOptions = [];
  for (let midi = 36; midi <= 84; midi += 1) {
    noteOptions.push(`<option value="${midi}">${formatPitchNote(midi)}</option>`);
  }

  els.targetMidiSelect.innerHTML = `<option value="">Off / scale nearest</option>${noteOptions.join("")}`;
}

function getTargetMidiValue() {
  return window.PunchLabPitch.getTargetMidiValue(els.targetMidiSelect?.value);
}

function getPitchModeLabel() {
  return window.PunchLabPitch.getPitchModeLabel({
    formatMidiNote: window.PunchLabDSP.formatMidiNote,
    key: els.keySelect.value,
    scaleMode: els.scaleModeSelect.value,
    targetMidi: getTargetMidiValue(),
  });
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
  return window.PunchLabPitch.applyManualPitchTargets(plan, take);
}

function getPitchLaneFrames(frames) {
  return window.PunchLabPitch.getPitchLaneFrames(frames);
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
  return window.PunchLabPitch.getManualPitchCount(take);
}

function getPitchFrameKey(frame) {
  return window.PunchLabPitch.getPitchFrameKey(frame);
}

function formatPitchNote(midi) {
  return window.PunchLabPitch.formatPitchNote(midi, window.PunchLabDSP.formatMidiNote);
}

function getAverageCorrection(frames) {
  return window.PunchLabPitch.getAverageCorrection(frames);
}

function clampMidi(midi) {
  return window.PunchLabPitch.clampMidi(midi);
}

function canExportCompressedAudio() {
  const readiness = window.PunchLabDesktop?.getReadiness?.()?.compressedExport;
  const driver = window.PunchLabEngine?.getDriver?.();
  return Boolean(
    typeof window.PunchLabEngine?.exportCompressedAudio === "function" &&
    (readiness?.ready || driver?.capabilities?.compressedAudioExport === true),
  );
}

function normalizeCompressedFormat(format) {
  return window.PunchLabExportPlan?.normalizeCompressedFormat?.(format) || "mp3";
}

function replaceAudioExtension(fileName, extension) {
  return window.PunchLabExportPlan?.replaceAudioExtension?.(fileName, extension) || `punchlab-export.${normalizeCompressedFormat(extension)}`;
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result || "")));
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(blob);
  });
}

function downloadDataUrl(dataUrl, filename) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
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
  return window.PunchLabExportPlan.normalizeExportBitDepth(bitDepth);
}

function getExportWavOptions() {
  return window.PunchLabExportPlan.buildExportWavOptions({
    bitDepth: getExportBitDepth(),
  });
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

function getLyricLineCount(value) {
  return String(value || "")
    .split(/\r?\n/)
    .filter((line) => line.trim()).length;
}

function recordTimelineHistory(snapshot = createTimelineSnapshot()) {
  state.timelineUndoStack.push(snapshot);
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
  return window.PunchLabTimeline.createTimelineSnapshot({
    markers: state.markers,
    takes: getAllTakes(),
  });
}

function restoreTimelineSnapshot(snapshot) {
  state.markers = normalizeMarkers(snapshot?.markers || []);
  const regionState = new Map((snapshot?.takes || []).map((take) => [take.id, take]));
  getAllTakes().forEach((take) => {
    const saved = regionState.get(take.id);
    if (!saved) {
      return;
    }

    const restored = window.PunchLabTimeline.normalizeTimelineTakeSnapshot(saved, take.trackId);
    take.name = restored.name;
    take.startTime = restored.startTime;
    take.duration = restored.duration;
    take.sourceOffset = restored.sourceOffset;
    take.sourceDuration = restored.sourceDuration;
    take.clipGain = restored.clipGain;
    take.regionColor = restored.regionColor;
    take.regionGroup = restored.regionGroup;
    take.fadeIn = restored.fadeIn;
    take.fadeOut = restored.fadeOut;
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

function getTimelineCursorPosition() {
  return Math.max(0, Number(state.timelineCursor) || 0);
}

function setTimelineCursor(value, options = {}) {
  const {
    announce = true,
    render = true,
    snap = true,
    syncBeat = true,
  } = options;
  const next = Math.max(0, snap ? snapTimelineTime(value) : Number(value) || 0);
  state.timelineCursor = next;
  if (syncBeat && els.beatAudio?.src) {
    const beatDuration = Number.isFinite(els.beatAudio.duration) ? els.beatAudio.duration : 0;
    els.beatAudio.currentTime = beatDuration > 0 ? Math.min(next, Math.max(0, beatDuration - 0.05)) : next;
  }
  if (els.markerTimeInput && document.activeElement !== els.markerTimeInput) {
    els.markerTimeInput.value = formatTimelineInputTime(next);
  }
  renderTimelineCursor();
  if (render) {
    renderTimeline();
  }
  if (announce) {
    els.sessionState.textContent = `Playhead ${formatDuration(next)}`;
  }
  return next;
}

function renderTimelineCursor(timelineEnd = getTimelineEndPosition(), position = getTimelineCursorPosition()) {
  const cursor = Math.max(0, Number(position) || 0);
  if (els.timelinePlayhead) {
    els.timelinePlayhead.style.left = `${timelinePercent(cursor, timelineEnd)}%`;
  }
  if (els.timelineCursorText) {
    els.timelineCursorText.textContent = formatDuration(cursor);
  }
  renderRecordTimelineCursor(timelineEnd, cursor);
  updateTimelineTransportButtons();
  updateSelectedRegionControls();
  renderTimelineRecordingPreview(timelineEnd);
}

function updateSelectedRegionControls() {
  if (!els.deleteSelectedRegionButton) {
    return;
  }

  const selectedTake = findTake(state.selectedTimelineTakeId);
  els.deleteSelectedRegionButton.disabled = !selectedTake || state.isRecording;
  els.deleteSelectedRegionButton.textContent = selectedTake ? "Delete selected" : "Select a region";
}

function renderTimelineRecordingPreview(timelineEnd = getTimelineEndPosition()) {
  if (!els.timelineRecordingPreview) {
    return;
  }

  if (!state.isRecording) {
    els.timelineRecordingPreview.hidden = true;
    els.timelineRecordingPreview.style.width = "0%";
    return;
  }

  const start = Math.max(0, Number(state.recordStartPosition) || 0);
  const current = start + Math.max(0, (performance.now() - state.recordStart) / 1000);
  const width = Math.max(0.6, timelinePercent(current - start, timelineEnd));
  const track = findTrack(state.armedTrackId);
  els.timelineRecordingPreview.hidden = false;
  els.timelineRecordingPreview.style.left = `${timelinePercent(start, timelineEnd)}%`;
  els.timelineRecordingPreview.style.width = `${width}%`;
  els.timelineRecordingPreview.style.setProperty("--track-color", track?.color || "#ff4f64");
  els.timelineRecordingPreview.textContent = `${track?.name || "Recording"} ${formatDuration(current - start)}`;
}

function updateTimelineTransportButtons() {
  const recordButtons = [els.timelineRecordFromCursorButton, els.recordTimelineRecordButton].filter(Boolean);
  const isActive = state.isRecording || state.isPunchWaiting;
  recordButtons.forEach((button) => {
    button.classList.toggle("active", isActive);
    const label = button.querySelector(".button-label");
    if (label) {
      label.textContent = state.isRecording ? "Stop" : state.isPunchWaiting ? "Cancel" : "Record";
    }
  });
  if (els.recordTimelinePlayButton) {
    els.recordTimelinePlayButton.classList.toggle("session-active", state.isSessionPlaying);
  }
  updateRecordTimelineButtons();
}

function getTimelinePointerPosition(surface, event) {
  if (!surface || event.button > 0) {
    return null;
  }

  const rect = surface.getBoundingClientRect();
  if (!rect.width) {
    return null;
  }

  const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
  return ratio * getTimelineEndPosition();
}

function handleTimelinePointer(event) {
  const regionElement = event.target instanceof Element
    ? event.target.closest("[data-timeline-region]")
    : null;
  if (regionElement && els.timelineSurface?.contains(regionElement)) {
    startTimelineRegionDrag(event, regionElement);
    return;
  }

  const position = getTimelinePointerPosition(els.timelineSurface, event);
  if (position === null) {
    return;
  }

  const next = setTimelineCursor(position);
  if (state.isSessionPlaying && !state.isRecording) {
    void playSession({ origin: next });
  }
}

function selectTimelineRegion(takeId, options = {}) {
  const take = findTake(takeId);
  if (!take) {
    updateSelectedRegionControls();
    return null;
  }

  const { render = true, syncCursor = true, statusText = "Region selected" } = options;
  state.selectedTimelineTakeId = take.id;
  state.latestTake = take;
  if (syncCursor) {
    setTimelineCursor(take.startTime || 0, { announce: false, render: false, snap: false, syncBeat: true });
  }
  els.sessionState.textContent = statusText;
  updateSelectedRegionControls();
  renderQuickTakeReview();
  if (render) {
    renderTimeline();
    renderRecordTimeline();
  }
  return take;
}

function startTimelineRegionDrag(event, regionElement) {
  if (event.button > 0 || state.isRecording) {
    return;
  }

  const take = selectTimelineRegion(regionElement.dataset.timelineRegion, {
    render: false,
    syncCursor: false,
  });
  if (!take) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  const trimHandle = event.target instanceof Element
    ? event.target.closest("[data-region-trim]")
    : null;
  const surfaceRect = els.timelineSurface.getBoundingClientRect();
  const visibleDuration = getTakeVisibleDuration(take);
  const sourceOffset = getTakeSourceOffset(take);
  const sourceDuration = getTakeSourceDuration(take);
  state.timelineRegionDrag = {
    pointerId: event.pointerId,
    takeId: take.id,
    type: trimHandle?.dataset.regionTrim === "start" ? "trim-start" : trimHandle?.dataset.regionTrim === "end" ? "trim-end" : "move",
    startClientX: event.clientX,
    surfaceWidth: Math.max(1, surfaceRect.width),
    timelineEnd: getTimelineEndPosition(),
    originStart: Math.max(0, Number(take.startTime) || 0),
    originDuration: visibleDuration,
    originSourceOffset: sourceOffset,
    sourceDuration,
    historySnapshot: createTimelineSnapshot(),
    historyRecorded: false,
  };

  els.timelineSurface.setPointerCapture?.(event.pointerId);
  els.timelineSurface.addEventListener("pointermove", updateTimelineRegionDrag);
  els.timelineSurface.addEventListener("pointerup", finishTimelineRegionDrag);
  els.timelineSurface.addEventListener("pointercancel", cancelTimelineRegionDrag);
  els.sessionState.textContent = state.timelineRegionDrag.type === "move" ? "Move region" : "Trim region";
  renderTimeline();
}

function updateTimelineRegionDrag(event) {
  const drag = state.timelineRegionDrag;
  if (!drag || event.pointerId !== drag.pointerId) {
    return;
  }

  const take = findTake(drag.takeId);
  if (!take) {
    cancelTimelineRegionDrag(event);
    return;
  }

  const delta = ((event.clientX - drag.startClientX) / drag.surfaceWidth) * drag.timelineEnd;
  const before = {
    duration: getTakeVisibleDuration(take),
    sourceOffset: getTakeSourceOffset(take),
    startTime: take.startTime || 0,
  };

  applyTimelineRegionDrag(take, drag, delta);

  const changed = !isSameTimelineNumber(before.startTime, take.startTime || 0)
    || !isSameTimelineNumber(before.duration, getTakeVisibleDuration(take))
    || !isSameTimelineNumber(before.sourceOffset, getTakeSourceOffset(take));
  if (!changed) {
    return;
  }

  if (!drag.historyRecorded) {
    recordTimelineHistory(drag.historySnapshot);
    drag.historyRecorded = true;
  }

  renderTimeline();
  renderRecordTimeline();
  if (state.isSessionPlaying) {
    updateActiveSessionMix();
  }
}

function applyTimelineRegionDrag(take, drag, delta) {
  if (drag.type === "move") {
    take.startTime = snapTimelineTime(drag.originStart + delta);
    return;
  }

  if (drag.type === "trim-start") {
    const rightEdge = drag.originStart + drag.originDuration;
    const minStart = Math.max(0, drag.originStart - drag.originSourceOffset);
    const maxStart = Math.max(minStart, rightEdge - 0.05);
    const nextStart = Math.max(minStart, Math.min(maxStart, snapTimelineTime(drag.originStart + delta)));
    take.startTime = nextStart;
    take.sourceOffset = Math.max(0, Math.min(drag.originSourceOffset + nextStart - drag.originStart, Math.max(0, drag.sourceDuration - 0.05)));
    take.duration = Math.max(0.05, rightEdge - nextStart);
    normalizeTakeTrim(take);
    return;
  }

  const maxEnd = drag.originStart + Math.max(0.05, drag.sourceDuration - drag.originSourceOffset);
  const minEnd = drag.originStart + 0.05;
  const nextEnd = Math.max(minEnd, Math.min(maxEnd, snapTimelineTime(drag.originStart + drag.originDuration + delta)));
  take.duration = Math.max(0.05, nextEnd - drag.originStart);
  normalizeTakeTrim(take);
}

function finishTimelineRegionDrag(event) {
  const drag = state.timelineRegionDrag;
  if (!drag || event.pointerId !== drag.pointerId) {
    return;
  }

  try {
    els.timelineSurface.releasePointerCapture?.(drag.pointerId);
  } catch {
    // Pointer capture can already be gone after a native cancel.
  }
  els.timelineSurface.removeEventListener("pointermove", updateTimelineRegionDrag);
  els.timelineSurface.removeEventListener("pointerup", finishTimelineRegionDrag);
  els.timelineSurface.removeEventListener("pointercancel", cancelTimelineRegionDrag);
  state.timelineRegionDrag = null;
  const take = findTake(drag.takeId);
  if (take) {
    setTimelineCursor(take.startTime || 0, { announce: false, render: false, snap: false, syncBeat: true });
  }
  els.sessionState.textContent = drag.historyRecorded ? "Region edited" : "Region selected";
  if (drag.historyRecorded) {
    refreshTimelineEdit();
    return;
  }

  renderTimeline();
  renderRecordTimeline();
}

function cancelTimelineRegionDrag(event) {
  const drag = state.timelineRegionDrag;
  if (!drag || event.pointerId !== drag.pointerId) {
    return;
  }

  finishTimelineRegionDrag(event);
}

function deleteSelectedTimelineRegion() {
  const take = findTake(state.selectedTimelineTakeId);
  if (!take) {
    els.sessionState.textContent = "No region selected";
    updateSelectedRegionControls();
    return;
  }

  recordTimelineHistory();
  deleteTake(take.id);
  els.sessionState.textContent = "Selected region deleted";
  updateTimelineHistoryButtons();
}

function handleRecordTimelinePointer(event) {
  const position = getTimelinePointerPosition(els.recordTimelineSurface, event);
  if (position === null) {
    return;
  }

  const next = setTimelineCursor(position);
  if (state.isSessionPlaying && !state.isRecording) {
    void playSession({ origin: next });
  }
}

function resetTimelineCursor() {
  setTimelineCursor(0);
}

async function playFromTimelineCursor() {
  const origin = setTimelineCursor(getTimelineCursorPosition(), { announce: false, render: false });
  await playSession({ origin });
}

async function recordFromTimelineCursor() {
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
    updateTimelineTransportButtons();
    return;
  }

  if (!state.stream) {
    await enableMic();
  }

  if (!state.stream) {
    return;
  }

  const startPosition = setTimelineCursor(getTimelineCursorPosition(), { announce: false, render: false });
  if (els.beatAudio.src && getCountInSeconds() > 0) {
    await startTimelinePreRollRecording(startPosition);
    return;
  }

  const bars = Number(els.countInSelect.value);
  if (bars > 0) {
    const completed = await countIn(bars);
    if (!completed) {
      return;
    }
  }

  if (els.beatAudio.src) {
    els.beatAudio.currentTime = startPosition;
  }
  startRecording({ startPosition });
}

async function startTimelinePreRollRecording(startPosition) {
  stopTakeQueue(false);
  stopSessionPlayback(false);
  stopCurrentTake(false);
  clearPunchTimers();
  await ensureAudioContext();

  const preRoll = getCountInSeconds();
  const playStart = Math.max(0, startPosition - preRoll);
  const waitMs = Math.max(0, (startPosition - playStart) * 1000);
  state.isPunchWaiting = true;
  els.recordButton.classList.add("armed");
  updateTimelineTransportButtons();
  els.sessionState.textContent = "Pre-roll armed";

  els.beatAudio.currentTime = playStart;
  playBeatAudio().catch((error) => {
    console.error(error);
  });

  if (waitMs > 0) {
    startPunchCountdown(waitMs);
  }

  const startTimer = window.setTimeout(() => {
    state.isPunchWaiting = false;
    els.recordButton.classList.remove("armed");
    els.countdown.hidden = true;
    updateTimelineTransportButtons();
    startRecording({
      startPosition,
      keepBeat: true,
    });
  }, waitMs);
  state.punchTimers.push(startTimer);
}

function addTimelineMarker() {
  recordTimelineHistory();
  const marker = {
    id: crypto.randomUUID(),
    type: els.markerTypeSelect.value,
    time: snapTimelineTime(els.markerTimeInput.value),
    comment: els.markerCommentInput?.value.trim() || "",
  };
  state.markers.push(marker);
  state.markers = normalizeMarkers(state.markers);
  els.markerTimeInput.value = formatTimelineInputTime(marker.time);
  if (els.markerCommentInput) {
    els.markerCommentInput.value = "";
  }
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
  return window.PunchLabTimeline.isSameTimelineNumber(left, right);
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
  return window.PunchLabTimeline.makeTimelineTicks({
    end,
    surfaceWidth: els.timelineRuler?.clientWidth || 800,
  });
}

function getTimelineTickStep(rawStep) {
  return window.PunchLabTimeline.getTimelineTickStep(rawStep);
}

function makeTimelineGridLines(end) {
  return window.PunchLabTimeline.makeTimelineGridLines({
    bpm: getTimelineBpm(),
    end,
  });
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
  return window.PunchLabTimeline.timelinePercent(value, end);
}

function getBeatDuration() {
  return window.PunchLabTimeline.getBeatDuration(getTimelineBpm());
}

function getTimelineSnapMode() {
  return normalizeTimelineSnapMode(els.timelineSnapSelect?.value || "off");
}

function normalizeTimelineSnapMode(value) {
  return window.PunchLabTimeline.normalizeTimelineSnapMode(value);
}

function getTimelineSnapStep() {
  return window.PunchLabTimeline.getTimelineSnapStep({
    bpm: getTimelineBpm(),
    mode: getTimelineSnapMode(),
  });
}

function snapTimelineTime(value) {
  return window.PunchLabTimeline.snapTimelineTime({
    bpm: getTimelineBpm(),
    mode: getTimelineSnapMode(),
    value,
  });
}

function nudgeTimelineTime(value, delta) {
  return window.PunchLabTimeline.nudgeTimelineTime({
    bpm: getTimelineBpm(),
    delta,
    mode: getTimelineSnapMode(),
    value,
  });
}

function formatTimelineInputTime(value) {
  return window.PunchLabTimeline.formatTimelineInputTime(value);
}

function snapToInputPrecision(value) {
  return window.PunchLabTimeline.snapToInputPrecision(value);
}

function normalizeMarkers(markers = []) {
  return window.PunchLabTimeline.normalizeMarkers(markers, () => crypto.randomUUID());
}

function getTimelineBpm() {
  return Number(els.bpmInput.value) || 140;
}

async function downloadLatestTake() {
  const latestTake = state.latestTake || getAllTakes().at(-1);
  if (!latestTake) {
    return;
  }

  await saveTakeWav(latestTake);
}

async function downloadTakeWav(takeId) {
  const take = findTake(takeId);
  if (!take) {
    els.sessionState.textContent = "Take missing";
    return;
  }

  await saveTakeWav(take);
}

async function saveTakeWav(take) {
  if (!take?.blob) {
    els.sessionState.textContent = "Take audio missing";
    return;
  }

  const filename = makeTakeWavFilename(take);
  try {
    els.downloadLatestButton.disabled = true;
    els.sessionState.textContent = "Preparing take WAV";
    const wavBlob = await buildTakeWavBlob(take);
    const result = await saveBlobWithPlatform(wavBlob, filename, {
      types: [
        {
          description: "WAV audio",
          accept: { "audio/wav": [".wav"] },
        },
      ],
    });
    els.sessionState.textContent = result.canceled
      ? "Take save canceled"
      : result.method === "native"
        ? "Take WAV saved"
        : result.method === "file-system"
          ? "Take WAV saved"
          : "Take WAV downloaded";
  } catch (error) {
    els.sessionState.textContent = "Take WAV failed";
    console.error(error);
  } finally {
    els.downloadLatestButton.disabled = !state.latestTake;
  }
}

async function buildTakeWavBlob(take) {
  if (take.blob?.type === "audio/wav" || String(take.extension || "").toLowerCase() === "wav") {
    return take.blob;
  }

  const sampleRate = state.audioContext?.sampleRate || 48000;
  const decodeContext = new OfflineAudioContext(2, 1, sampleRate);
  const audioBuffer = await decodeContext.decodeAudioData(await take.blob.arrayBuffer());
  return encodeWav(audioBuffer, getExportMetadata(), getExportWavOptions());
}

function makeTakeWavFilename(take) {
  return makeTakeFilename({ ...take, extension: "wav" });
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
    beatVolume: state.beatGain,
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
      buildSingleExportGroup({
        name: "Beat stem",
        suffix: "beat-stem",
        includeBeat: true,
      }),
    ],
    "Beat stem",
  );
}

async function exportVocalStem() {
  await exportRenderGroups(
    [
      buildSingleExportGroup({
        name: "Vocal stem",
        suffix: "vocal-stem",
        takes: getAudibleTakes(),
        includeBeat: false,
      }),
    ],
    "Vocal stem",
  );
}

async function exportCompVocal() {
  await exportRenderGroups(
    [
      buildSingleExportGroup({
        name: "Comp vocal",
        suffix: "comp-vocal",
        takes: getAudibleCompTakes(),
        includeBeat: false,
      }),
    ],
    "Comp vocal",
  );
}

async function exportDryVocals() {
  const takes = getAudibleTakes().filter((take) => !take.processed);
  await exportRenderGroups(
    [
      buildSingleExportGroup({
        name: "Dry vocals",
        suffix: "dry-vocals",
        takes,
        includeBeat: false,
      }),
    ],
    "Dry vocals",
  );
}

async function exportTunedVocals() {
  const takes = getAudibleTakes().filter((take) => take.processed);
  await exportRenderGroups(
    [
      buildSingleExportGroup({
        name: "Tuned vocals",
        suffix: "tuned-vocals",
        takes,
        includeBeat: false,
      }),
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

async function exportCompressedJob(jobId, format = "mp3") {
  const job = state.exportQueue.find((item) => item.id === jobId);
  const safeFormat = normalizeCompressedFormat(format);
  if (!job?.previewBlob) {
    els.sessionState.textContent = "No WAV source";
    return;
  }
  if (!canExportCompressedAudio()) {
    els.sessionState.textContent = "Native compressed export unavailable";
    return;
  }

  const fileName = replaceAudioExtension(job.previewName || `${slugify(job.label || "export")}.wav`, safeFormat);
  try {
    job.compressedStatus = `${safeFormat.toUpperCase()} encoding`;
    els.exportStatusText.textContent = job.compressedStatus;
    renderExportPanel();

    const wavDataUrl = await blobToDataUrl(job.previewBlob);
    const result = await window.PunchLabEngine.exportCompressedAudio({
      dataUrl: wavDataUrl,
      fileName,
      format: safeFormat,
      mimeType: job.previewBlob.type || "audio/wav",
      sourceFileName: job.previewName || "",
      wavDataUrl,
    });
    if (!result || result.unsupported || result.supported === false) {
      throw new Error("Native compressed export unsupported.");
    }

    const outputName = result.fileName || fileName;
    if (result.blob instanceof Blob) {
      downloadBlob(result.blob, outputName);
    } else {
      const dataUrl = result.dataUrl || result.data || result.wavDataUrl;
      if (!dataUrl) {
        throw new Error("Native compressed export returned no file data.");
      }
      downloadDataUrl(dataUrl, outputName);
    }

    job.compressedStatus = `${safeFormat.toUpperCase()} downloaded`;
    els.sessionState.textContent = `Downloaded ${outputName}`;
    els.exportStatusText.textContent = "Compressed done";
  } catch (error) {
    job.compressedStatus = `${safeFormat.toUpperCase()} failed`;
    els.sessionState.textContent = "Compressed export failed";
    els.exportStatusText.textContent = "Compressed failed";
    console.error(error);
  } finally {
    renderExportPanel();
  }
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
  return window.PunchLabExportPlan.getExportJobStatusLabel(status);
}

function formatExportJobDetail(job = {}) {
  return window.PunchLabExportPlan.formatExportJobDetail(job, getExportJobStatusLabel(job.status));
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
    beatVolume: state.beatGain,
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
  return window.PunchLabExportPlan.buildStemExportGroups({
    baseSlug: makeExportBaseSlug(),
    beatAvailable: Boolean(state.beatArrayBuffer),
    getTrackVolume: getTrackOutputVolume,
    tracks,
  });
}

function buildSingleExportGroup(options = {}) {
  return window.PunchLabExportPlan.buildSingleExportGroup({
    baseSlug: makeExportBaseSlug(),
    ...options,
  });
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
  renderVocalPanel();
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
  renderVocalPanel();
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
  renderVocalPanel();
  scheduleAutosave();
}

function addBestTakesToComp() {
  const bestPoolTakes = window.PunchLabTakes.sortBestTakesForComp(
    getAllTakes().filter((take) => take.bestTake && !take.compSelected),
  );

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
  if (!window.PunchLabTakes.moveCompTakeOrder(getCompTakes(), takeId, delta)) {
    return;
  }

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
  window.PunchLabTakes.normalizeCompOrder(getCompTakes());
}

function getNextCompOrder() {
  return window.PunchLabTakes.getNextCompOrder(getCompTakes());
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
  if (state.selectedTimelineTakeId === takeId) {
    state.selectedTimelineTakeId = null;
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
  renderVocalPanel();
  renderTimeline();
  renderLyrics();
  updateQueueButton();
  updateExportButtons();
  scheduleAutosave();
}

function clearAllTakes() {
  const allTakes = getAllTakes();
  if (!allTakes.length) {
    els.sessionState.textContent = "No takes to clear";
    return;
  }

  stopSessionPlayback(false);
  stopTakeQueue(false);
  stopCurrentTake(false);
  allTakes.forEach((take) => URL.revokeObjectURL(take.url));
  tracks.forEach((track) => {
    track.takes = [];
  });
  state.latestTake = null;
  state.recordWaveform = [];
  state.selectedVocalTakeId = null;
  state.selectedTimelineTakeId = null;
  els.downloadLatestButton.disabled = true;
  els.sessionState.textContent = "Takes cleared";
  renderTracks();
  renderArmTracks();
  renderTakes();
  renderVocalPanel();
  renderCompView();
  renderTimeline();
  renderRecordTimeline();
  updateQueueButton();
  updateExportButtons();
  scheduleAutosave();
}

function updateTimer() {
  if (state.isRecording) {
    const position = state.recordStartPosition + (performance.now() - state.recordStart) / 1000;
    state.timelineCursor = position;
    els.clock.textContent = formatDuration((performance.now() - state.recordStart) / 1000);
    renderTimelineCursor();
  } else if (state.isSessionPlaying) {
    const position = getCurrentSessionPosition();
    state.timelineCursor = position;
    els.clock.textContent = formatDuration(position);
    renderTimelineCursor();
  } else if (els.beatAudio && !els.beatAudio.paused) {
    state.timelineCursor = els.beatAudio.currentTime;
    els.clock.textContent = formatDuration(els.beatAudio.currentTime);
    renderTimelineCursor();
  }

  state.timerFrame = requestAnimationFrame(updateTimer);
}

function formatDuration(seconds) {
  return window.PunchLabFormat.formatDuration(seconds);
}

function formatGainDb(gain) {
  return window.PunchLabFormat.formatGainDb(gain);
}

function gainToDb(gain) {
  return window.PunchLabFormat.gainToDb(gain);
}

function formatDb(value) {
  return window.PunchLabFormat.formatDb(value);
}

function formatRatio(value) {
  return window.PunchLabFormat.formatRatio(value);
}

function formatLufs(value) {
  return window.PunchLabFormat.formatLufs(value);
}

function formatSigned(value) {
  return window.PunchLabFormat.formatSigned(value);
}

function formatSemitones(value) {
  return window.PunchLabFormat.formatSemitones(value);
}

function findTake(takeId) {
  return tracks.flatMap((track) => track.takes).find((take) => take.id === takeId);
}

function findTrack(trackId) {
  return tracks.find((track) => track.id === trackId);
}

function getAllTakes() {
  return window.PunchLabTakes.sortTakesByCreatedAt(tracks.flatMap((track) => track.takes));
}

function getCompTakes() {
  return window.PunchLabTakes.sortCompTakes(getAllTakes().filter((take) => take.compSelected));
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

  return window.PunchLabTakes.sortProcessedVersions(
    getAllTakes().filter((take) => take.processed && take.sourceTakeId === sourceTakeId),
  );
}

function compareProcessedVersions(a, b) {
  return window.PunchLabTakes.compareProcessedVersions(a, b);
}

function compareProcessedTimeline(a, b) {
  return window.PunchLabTakes.compareProcessedTimeline(a, b);
}

function getNextProcessedVersion(sourceTakeId, presetId) {
  return window.PunchLabTakes.getNextProcessedVersion(getAllTakes(), sourceTakeId, presetId);
}

function getBatchSourceTargets(selectedTake) {
  return window.PunchLabTakes.getBatchSourceTargets({
    allTakes: getAllTakes(),
    compTakes: getCompTakes(),
    scope: els.batchScopeSelect.value,
    trackId: selectedTake?.trackId || state.armedTrackId,
  });
}

function getBatchTargets(selectedTake) {
  const sourceTargets = getBatchSourceTargets(selectedTake);
  return window.PunchLabTakes.getBatchTargets({
    getTuneSignature,
    preset: getSelectedPreset(),
    skipRendered: shouldSkipRenderedBatchTargets(),
    sourceTargets,
    takes: getAllTakes(),
    tuneSettings: getTuneSettings(),
  });
}

function shouldSkipRenderedBatchTargets() {
  return Boolean(els.batchSkipRenderedInput?.checked);
}

function hasProcessedTakeForChain(sourceTake, preset, tuneSettings) {
  return window.PunchLabTakes.hasProcessedTakeForChain({
    getTuneSignature,
    preset,
    sourceTake,
    takes: getAllTakes(),
    tuneSignature: getTuneSignature(tuneSettings),
  });
}

function getBatchScopeReadyText(scope, count, skippedCount = 0) {
  return window.PunchLabTakes.getBatchScopeReadyText(scope, count, skippedCount);
}

function getBatchScopeEmptyText(scope, skippedCount = 0) {
  return window.PunchLabTakes.getBatchScopeEmptyText(scope, skippedCount);
}

function getAudibleTakes() {
  return getAllTakes().filter(isTakeAudible);
}

function getAudibleCompTakes() {
  return getCompTakes().filter(isTakeAudible);
}

function isTakeAudible(take) {
  return getTrackOutputVolume(findTrack(take.trackId)) > 0;
}

function getCurrentSessionPosition() {
  if (state.isSessionPlaying) {
    return state.sessionOrigin + (performance.now() - state.sessionStartedAt) / 1000;
  }

  if (els.beatAudio.src) {
    return els.beatAudio.currentTime;
  }

  return getTimelineCursorPosition();
}

function getSessionEndPosition() {
  const beatEnd = els.beatAudio.src && Number.isFinite(els.beatAudio.duration) ? els.beatAudio.duration : 0;
  const takeEnd = getAllTakes().reduce((end, take) => Math.max(end, (take.startTime || 0) + take.duration), 0);
  return Math.max(beatEnd, takeEnd);
}

function hasSoloTrack() {
  return window.PunchLabTracks.hasSoloTrack(tracks);
}

function isTrackAudible(track) {
  return window.PunchLabTracks.isTrackAudible(track, tracks);
}

function getTrackOutputVolume(track) {
  return window.PunchLabTracks.getTrackOutputVolume(track, tracks);
}

function normalizeTakeTrim(take) {
  Object.assign(take, window.PunchLabTimeline.normalizeTakeTrim(take));
  return take;
}

function getTakeSourceDuration(take) {
  return window.PunchLabTimeline.getTakeSourceDuration(take);
}

function getTakeSourceOffset(take) {
  return window.PunchLabTimeline.getTakeSourceOffset(take);
}

function getTakeVisibleDuration(take) {
  return window.PunchLabTimeline.getTakeVisibleDuration(take);
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
  return window.PunchLabTracks.getDefaultTrackName(trackId);
}

function getTakeClipGain(take) {
  return window.PunchLabTimeline.getTakeClipGain(take);
}

function getTakeRegionColor(take) {
  return normalizeRegionColor(take?.regionColor) || normalizeRegionColor(findTrack(take?.trackId)?.color) || "#c8ff4d";
}

function getTakeRegionGroup(take) {
  return normalizeRegionGroup(take?.regionGroup, take?.trackId);
}

function normalizeRegionGroup(value, trackId = "") {
  return window.PunchLabTimeline.normalizeRegionGroup(value, trackId);
}

function getDefaultRegionGroupForTrack(trackId) {
  return window.PunchLabTimeline.getDefaultRegionGroupForTrack(trackId);
}

function getRegionGroupLabel(groupId) {
  return window.PunchLabTimeline.getRegionGroupLabel(groupId);
}

function normalizeRegionColor(value) {
  return window.PunchLabTimeline.normalizeRegionColor(value);
}

function getTakeFadeIn(take) {
  return window.PunchLabTimeline.getTakeFadeIn(take);
}

function getTakeFadeOut(take) {
  return window.PunchLabTimeline.getTakeFadeOut(take);
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
  if (!window.PunchLabTracks.hasTrackFolder(folderId, TRACK_FOLDERS)) {
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
  return window.PunchLabTracks.getTrackFolderTracks(folderId, TRACK_FOLDERS, tracks);
}

function normalizeTrackFolderCollapsed(value = {}) {
  return window.PunchLabTracks.normalizeTrackFolderCollapsed(value, TRACK_FOLDERS);
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
  const hasCompVocal = getAudibleCompTakes().length > 0;
  const hasDry = getAudibleTakes().some((take) => !take.processed);
  const hasTuned = getAudibleTakes().some((take) => take.processed);
  els.exportStemsButton.disabled = !hasStems;
  els.exportBeatStemButton.disabled = !hasBeatStem;
  els.exportVocalStemButton.disabled = !hasVocals;
  els.exportCompVocalButton.disabled = !hasCompVocal;
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
  els.exportCompVocalButton.classList.toggle("rendering", state.isExportingAssets);
  els.exportDryVocalsButton.classList.toggle("rendering", state.isExportingAssets);
  els.exportTunedVocalsButton.classList.toggle("rendering", state.isExportingAssets);
  renderExportPanel();
}

function formatPercent(value) {
  return window.PunchLabFormat.formatPercent(value);
}

function formatPan(value) {
  return window.PunchLabFormat.formatPan(value);
}

function makeTakeFilename(take) {
  return window.PunchLabTakes.makeTakeFilename(take);
}

function makeMixFilename() {
  return window.PunchLabExportPlan.makeMixFilename({ baseSlug: makeExportBaseSlug() });
}

function makeExportBaseSlug() {
  return window.PunchLabExportPlan.makeExportBaseSlug({
    beatFileName: state.beatFileName,
    metadata: getExportMetadata(),
  });
}

function slugify(value) {
  return String(value || "session")
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getTakeTitle(take, index) {
  return window.PunchLabTakes.getTakeTitle(take, index);
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
  return window.PunchLabTakes.getTakeShortName(take);
}

function formatTakeLatencyTag(take) {
  return window.PunchLabTakes.formatTakeLatencyTag(take);
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
  return window.PunchLabFormat.escapeHtml(value);
}

init();
