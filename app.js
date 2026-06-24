const DEFAULT_CUSTOM_SCALE_INTERVALS = [0, 2, 3, 5, 7, 8, 10];

const state = {
  audioContext: null,
  stream: null,
  processedStream: null,
  analyser: null,
  gainNode: null,
  monitorGain: null,
  monitorConnected: false,
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
  selectedPresetId: "trap-hard",
  selectedVocalTakeId: null,
  isAnalyzingVocal: false,
  isBatchRendering: false,
  beatUrl: "",
  beatArrayBuffer: null,
  beatFileName: "",
  mimeType: "",
  inputGain: 2,
  monitorEnabled: false,
  isExportingMix: false,
  isExportingAssets: false,
  isExportQueueRunning: false,
  exportQueue: [],
  exportJobSeq: 1,
  exportPreviewAudio: null,
  lastExportNormalizeGain: 1,
  isRenderingVocal: false,
  autosaveTimer: 0,
  isAutosaving: false,
  hasAutosave: false,
  currentTakeAudio: null,
  currentTakeId: null,
  currentTakeResolve: null,
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
  punchIn: 0,
  punchOut: 4,
  punchTimers: [],
  isPunchWaiting: false,
  isPunchRecording: false,
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

const presets = [
  { id: "trap-hard", name: "Trap Hard", retune: 88, humanize: 10, formant: 10, gate: 18, deEss: 28, comp: 72, space: 18, width: 42 },
  { id: "drill-dark", name: "Drill Dark", retune: 72, humanize: 18, formant: -12, gate: 24, deEss: 34, comp: 82, space: 12, width: 28 },
  { id: "clean-rap", name: "Clean Rap", retune: 22, humanize: 60, formant: 0, gate: 10, deEss: 20, comp: 62, space: 8, width: 18 },
  { id: "rage-wide", name: "Rage Wide", retune: 95, humanize: 5, formant: 18, gate: 16, deEss: 38, comp: 76, space: 34, width: 86 },
  { id: "radio-hook", name: "Radio Hook", retune: 58, humanize: 30, formant: 8, gate: 12, deEss: 30, comp: 68, space: 45, width: 72 },
  { id: "lofi-demo", name: "Lo-Fi Demo", retune: 36, humanize: 55, formant: -18, gate: 4, deEss: 14, comp: 54, space: 22, width: 12 },
];

const els = {
  viewTabs: document.querySelectorAll("[data-view]"),
  viewPanels: document.querySelectorAll("[data-view-panel]"),
  projectInput: document.querySelector("#projectInput"),
  saveProjectButton: document.querySelector("#saveProjectButton"),
  saveProjectZipButton: document.querySelector("#saveProjectZipButton"),
  recoverProjectButton: document.querySelector("#recoverProjectButton"),
  beatInput: document.querySelector("#beatInput"),
  beatName: document.querySelector("#beatName"),
  beatAudio: document.querySelector("#beatAudio"),
  bpmInput: document.querySelector("#bpmInput"),
  countInSelect: document.querySelector("#countInSelect"),
  keySelect: document.querySelector("#keySelect"),
  scaleModeSelect: document.querySelector("#scaleModeSelect"),
  inputGainSlider: document.querySelector("#inputGainSlider"),
  inputGainText: document.querySelector("#inputGainText"),
  micButton: document.querySelector("#micButton"),
  monitorButton: document.querySelector("#monitorButton"),
  playButton: document.querySelector("#playButton"),
  stopButton: document.querySelector("#stopButton"),
  recordButton: document.querySelector("#recordButton"),
  sessionState: document.querySelector("#sessionState"),
  clock: document.querySelector("#clock"),
  micStatus: document.querySelector("#micStatus"),
  inputMeter: document.querySelector("#inputMeter"),
  inputLevelText: document.querySelector("#inputLevelText"),
  waveCanvas: document.querySelector("#waveCanvas"),
  waveformStatus: document.querySelector("#waveformStatus"),
  countdown: document.querySelector("#countdown"),
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
  formantSlider: document.querySelector("#formantSlider"),
  formantText: document.querySelector("#formantText"),
  gateSlider: document.querySelector("#gateSlider"),
  gateText: document.querySelector("#gateText"),
  deEssSlider: document.querySelector("#deEssSlider"),
  deEssText: document.querySelector("#deEssText"),
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
  batchRenderButton: document.querySelector("#batchRenderButton"),
  batchStatus: document.querySelector("#batchStatus"),
  batchMeta: document.querySelector("#batchMeta"),
  takesList: document.querySelector("#takesList"),
  playQueueButton: document.querySelector("#playQueueButton"),
  playCompButton: document.querySelector("#playCompButton"),
  compLaneList: document.querySelector("#compLaneList"),
  compPoolList: document.querySelector("#compPoolList"),
  compLaneMeta: document.querySelector("#compLaneMeta"),
  compPoolMeta: document.querySelector("#compPoolMeta"),
  compPlayButton: document.querySelector("#compPlayButton"),
  compClearButton: document.querySelector("#compClearButton"),
  exportMixButton: document.querySelector("#exportMixButton"),
  downloadLatestButton: document.querySelector("#downloadLatestButton"),
  timelineLength: document.querySelector("#timelineLength"),
  timelineRuler: document.querySelector("#timelineRuler"),
  timelineMarkers: document.querySelector("#timelineMarkers"),
  timelineRegions: document.querySelector("#timelineRegions"),
  markerTypeSelect: document.querySelector("#markerTypeSelect"),
  markerTimeInput: document.querySelector("#markerTimeInput"),
  addMarkerButton: document.querySelector("#addMarkerButton"),
  markerList: document.querySelector("#markerList"),
  regionList: document.querySelector("#regionList"),
  timelineUndoButton: document.querySelector("#timelineUndoButton"),
  timelineRedoButton: document.querySelector("#timelineRedoButton"),
  exportStemsButton: document.querySelector("#exportStemsButton"),
  exportDryVocalsButton: document.querySelector("#exportDryVocalsButton"),
  exportTunedVocalsButton: document.querySelector("#exportTunedVocalsButton"),
  exportStatusText: document.querySelector("#exportStatusText"),
  exportList: document.querySelector("#exportList"),
  exportArtistInput: document.querySelector("#exportArtistInput"),
  exportTitleInput: document.querySelector("#exportTitleInput"),
  exportNormalizeInput: document.querySelector("#exportNormalizeInput"),
};

function init() {
  state.mimeType = getBestMimeType();
  bindEvents();
  renderTracks();
  renderArmTracks();
  renderTakes();
  renderTimeline();
  renderExportPanel();
  renderPresets();
  applyPreset("trap-hard");
  updateTimelineHistoryButtons();
  updateInputGain();
  updatePunchControls();
  checkAutosave();
  drawIdleWave();
  updateTimer();

  window.addEventListener("resize", drawIdleWave);
  window.addEventListener("keydown", handleGlobalShortcut);
  window.addEventListener("load", () => {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  });
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
  els.beatInput.addEventListener("change", loadBeat);
  els.inputGainSlider.addEventListener("input", updateInputGain);
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
  els.setPunchInButton.addEventListener("click", () => setPunchPoint("in"));
  els.setPunchOutButton.addEventListener("click", () => setPunchPoint("out"));
  els.beatAudio.addEventListener("timeupdate", maintainLoopPlayback);
  els.playQueueButton.addEventListener("click", () => toggleTakeQueue("all"));
  els.playCompButton.addEventListener("click", () => toggleTakeQueue("comp"));
  els.compPlayButton.addEventListener("click", () => toggleTakeQueue("comp"));
  els.compClearButton.addEventListener("click", clearCompLane);
  els.exportMixButton.addEventListener("click", exportFullMix);
  els.downloadLatestButton.addEventListener("click", downloadLatestTake);
  els.retuneSpeedSlider.addEventListener("input", () => {
    updateTuneControls();
    scheduleAutosave();
  });
  els.humanizeSlider.addEventListener("input", () => {
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
  els.batchRenderButton.addEventListener("click", renderBatchVocalTakes);
  els.saveProjectButton.addEventListener("click", saveProject);
  els.saveProjectZipButton.addEventListener("click", saveProjectZip);
  els.projectInput.addEventListener("change", loadProject);
  els.recoverProjectButton.addEventListener("click", recoverAutosave);
  els.addMarkerButton.addEventListener("click", addTimelineMarker);
  els.timelineUndoButton.addEventListener("click", undoTimelineEdit);
  els.timelineRedoButton.addEventListener("click", redoTimelineEdit);
  els.exportStemsButton.addEventListener("click", exportTrackStems);
  els.exportDryVocalsButton.addEventListener("click", exportDryVocals);
  els.exportTunedVocalsButton.addEventListener("click", exportTunedVocals);
  els.exportArtistInput.addEventListener("input", updateExportMetadata);
  els.exportTitleInput.addEventListener("input", updateExportMetadata);
  els.exportNormalizeInput.addEventListener("change", updateExportMetadata);
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
}

function getBestMimeType() {
  const types = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", ""];
  return types.find((type) => !type || MediaRecorder.isTypeSupported(type)) || "";
}

async function ensureAudioContext() {
  if (!state.audioContext) {
    state.audioContext = new AudioContext();
  }

  if (state.audioContext.state === "suspended") {
    await state.audioContext.resume();
  }

  return state.audioContext;
}

async function enableMic() {
  if (state.stream) {
    return;
  }

  try {
    state.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });

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
    startMeter();
  } catch (error) {
    els.sessionState.textContent = "Mic blocked";
    console.error(error);
  }
}

async function toggleInputMonitor() {
  state.monitorEnabled = !state.monitorEnabled;
  if (!state.stream) {
    await enableMic();
    if (!state.stream) {
      state.monitorEnabled = false;
      updateMonitorButton();
      return;
    }
  }

  syncMonitorRouting();
  updateMonitorButton();
  els.sessionState.textContent = state.monitorEnabled ? "Monitor on" : "Monitor off";
}

function syncMonitorRouting() {
  if (!state.gainNode || !state.monitorGain || !state.audioContext) {
    return;
  }

  if (state.monitorEnabled && !state.monitorConnected) {
    state.gainNode.connect(state.monitorGain).connect(state.audioContext.destination);
    state.monitorConnected = true;
    return;
  }

  if (!state.monitorEnabled && state.monitorConnected) {
    try {
      state.gainNode.disconnect(state.monitorGain);
      state.monitorGain.disconnect();
    } catch {
      // The node may already be disconnected by the browser.
    }
    state.monitorConnected = false;
  }
}

function updateMonitorButton() {
  if (!els.monitorButton) {
    return;
  }

  els.monitorButton.classList.toggle("monitor-active", state.monitorEnabled);
  els.monitorButton.setAttribute("aria-pressed", String(state.monitorEnabled));
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
    });
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
    downloadBlob(blob, window.PunchLabProject.makeProjectFilename(state.beatFileName));
    els.sessionState.textContent = "Project saved";
  } catch (error) {
    els.sessionState.textContent = "Save failed";
    console.error(error);
  } finally {
    els.saveProjectButton.disabled = false;
  }
}

async function saveProjectZip() {
  if (!window.PunchLabProject) {
    els.sessionState.textContent = "Project module missing";
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
    });
    const projectFilename = window.PunchLabProject.makeProjectFilename(state.beatFileName);
    const zipBlob = window.PunchLabProject.buildProjectZip({
      [projectFilename]: JSON.stringify(bundle, null, 2),
    });
    downloadBlob(zipBlob, window.PunchLabProject.makeProjectZipFilename(state.beatFileName));
    els.sessionState.textContent = "Zip saved";
  } catch (error) {
    els.sessionState.textContent = "Zip failed";
    console.error(error);
  } finally {
    els.saveProjectZipButton.disabled = false;
  }
}

async function loadProject(event) {
  const [file] = event.target.files;
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
  } finally {
    els.projectInput.value = "";
  }
}

async function recoverAutosave() {
  if (!window.PunchLabStorage || !window.PunchLabProject) {
    return;
  }

  try {
    els.sessionState.textContent = "Recovering";
    const bundle = await window.PunchLabStorage.loadAutosave();
    if (!bundle) {
      els.sessionState.textContent = "No recovery";
      state.hasAutosave = false;
      updateRecoveryButton();
      return;
    }

    stopAll();
    const project = await window.PunchLabProject.hydrateProjectBundle(bundle);
    applyLoadedProject(project);
    els.sessionState.textContent = "Autosave recovered";
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
    state.hasAutosave = await window.PunchLabStorage.hasAutosave();
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
    });
    await window.PunchLabStorage.saveAutosave(bundle);
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
}

function applyLoadedProject(project) {
  revokeCurrentProjectAssets();

  if (project.beat) {
    state.beatArrayBuffer = project.beat.arrayBuffer;
    state.beatFileName = project.beat.fileName;
    state.beatUrl = URL.createObjectURL(project.beat.blob);
    els.beatAudio.src = state.beatUrl;
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
      takes: track.takes.map((take) => ({
        ...take,
        trackName: take.trackName || track.name,
        url: URL.createObjectURL(take.blob),
      })),
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
    customScaleIntervals: [...state.customScaleIntervals],
    inputGain: state.inputGain,
    armedTrackId: state.armedTrackId,
    selectedPresetId: state.selectedPresetId,
    tune: getTuneSettings(),
    exportMetadata: getExportMetadata(),
    exportNormalize: els.exportNormalizeInput.checked,
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
  state.customScaleIntervals = normalizeScaleIntervals(settings.customScaleIntervals);
  els.exportArtistInput.value = settings.exportMetadata?.artist || "";
  els.exportTitleInput.value = settings.exportMetadata?.title || "";
  els.exportNormalizeInput.checked = settings.exportNormalize !== false;
  els.inputGainSlider.value = settings.inputGain || 2;
  state.armedTrackId = tracks.some((track) => track.id === settings.armedTrackId)
    ? settings.armedTrackId
    : tracks[0]?.id || "main";
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
    els.formantSlider.value = settings.tune.formant ?? els.formantSlider.value;
    els.gateSlider.value = settings.tune.gate ?? els.gateSlider.value;
    els.deEssSlider.value = settings.tune.deEss ?? els.deEssSlider.value;
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
    const offset = Math.max(0, origin - takeStart);
    const delay = takeStart - origin;
    if (offset >= take.duration) {
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
  if (!track || getTrackOutputVolume(track) <= 0 || offset >= take.duration) {
    return;
  }

  const ctx = await ensureAudioContext();
  const audio = new Audio(take.url);
  audio.currentTime = Math.max(0, Math.min(offset, Math.max(0, take.duration - 0.05)));

  const source = ctx.createMediaElementSource(audio);
  const gain = ctx.createGain();
  const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
  const player = { takeId: take.id, trackId: track.id, take, audio, source, gain, panner };

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

function playTakeAudio(take, label) {
  stopCurrentTake(false);
  els.beatAudio.pause();
  const audio = new Audio(take.url);
  audio.volume = Math.min(1, getTakeClipGain(take));
  state.currentTakeAudio = audio;
  state.currentTakeId = take.id;
  renderTracks();
  renderTakes();

  return new Promise((resolve) => {
    let settled = false;

    const finish = (status) => {
      if (settled) {
        return;
      }

      settled = true;
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
  if (state.isRecording) {
    stopRecording();
    return;
  }

  if (state.isPunchWaiting) {
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
    startPunchRecording();
    return;
  }

  const bars = Number(els.countInSelect.value);
  if (bars > 0) {
    await countIn(bars);
  }

  startRecording();
}

async function startPunchRecording() {
  if (state.punchOut <= state.punchIn) {
    els.sessionState.textContent = "Set punch out";
    return;
  }

  stopTakeQueue(false);
  stopSessionPlayback(false);
  stopCurrentTake(false);
  clearPunchTimers();
  await ensureAudioContext();

  const preRoll = getCountInSeconds();
  const punchIn = state.punchIn;
  const punchOut = state.punchOut;
  const playStart = Math.max(0, punchIn - preRoll);
  const waitMs = Math.max(0, (punchIn - playStart) * 1000);
  const durationMs = Math.max(100, (punchOut - punchIn) * 1000);

  state.isPunchWaiting = true;
  els.recordButton.classList.add("armed");
  els.sessionState.textContent = "Punch armed";

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
  state.mediaRecorder.start(250);
  state.isRecording = true;
  els.recordButton.classList.add("active");
  els.sessionState.textContent = options.punch ? "Punch recording" : "Recording";
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
  clearPunchTimers();
  state.mediaRecorder.stop();
  state.isRecording = false;
  state.isPunchRecording = false;
  els.recordButton.classList.remove("active");
  els.sessionState.textContent = wasPunchRecording ? "Punch saved" : "Take saved";
  if (!state.isSessionPlaying) {
    stopMetronome();
  }

  if (wasPunchRecording && state.loopEnabled && els.beatAudio.src && state.punchOut > state.punchIn) {
    els.beatAudio.currentTime = state.punchIn;
    els.beatAudio.play().catch((error) => {
      console.error(error);
    });
    els.sessionState.textContent = "Looping punch";
  }
}

function saveTake() {
  const track = tracks.find((item) => item.id === state.armedTrackId);
  const extension = state.mimeType.includes("mp4") ? "m4a" : "webm";
  const blob = new Blob(state.chunks, { type: state.mimeType || "audio/webm" });
  const url = URL.createObjectURL(blob);
  const latencySeconds = state.recordLatencyMs / 1000;
  const take = {
    id: crypto.randomUUID(),
    trackId: track.id,
    trackName: track.name,
    url,
    blob,
    extension,
    createdAt: new Date(),
    startTime: Math.max(0, state.recordStartPosition - latencySeconds),
    duration: (performance.now() - state.recordStart) / 1000,
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
}

async function countIn(bars) {
  const bpm = Number(els.bpmInput.value) || 140;
  const beats = bars * 4;
  const beatMs = 60000 / bpm;

  els.countdown.hidden = false;
  els.sessionState.textContent = "Count in";

  for (let beat = beats; beat > 0; beat -= 1) {
    els.countdown.textContent = String(beat);
    tick(beat === beats ? 880 : 660);
    await wait(beatMs);
  }

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

function makeWaveformFromAudioBuffer(audioBuffer, targetLength = 240) {
  const peaks = [];
  const length = audioBuffer.length;
  const channels = audioBuffer.numberOfChannels;
  const bucketSize = Math.max(1, Math.floor(length / targetLength));

  for (let start = 0; start < length; start += bucketSize) {
    let peak = 0;
    const end = Math.min(length, start + bucketSize);
    for (let channel = 0; channel < channels; channel += 1) {
      const data = audioBuffer.getChannelData(channel);
      for (let index = start; index < end; index += 1) {
        peak = Math.max(peak, Math.abs(data[index]));
      }
    }
    peaks.push(Math.min(1, peak));
  }

  return downsampleWaveform(peaks, targetLength);
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
  els.trackList.innerHTML = tracks
    .map((track) => {
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
            <span>
              ${track.name}
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
    })
    .join("");

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

function renderPresets() {
  els.presetGrid.innerHTML = presets
    .map(
      (preset) => `
        <button class="preset-button" type="button" data-preset="${preset.id}">
          ${escapeHtml(preset.name)}
        </button>
      `,
    )
    .join("");

  els.presetGrid.querySelectorAll("[data-preset]").forEach((button) => {
    button.addEventListener("click", () => applyPreset(button.dataset.preset));
  });
}

function saveCustomPreset() {
  const basePreset = getSelectedPreset();
  const tuneSettings = getTuneSettings();
  const name = els.customPresetNameInput.value.trim() || `Custom ${presets.filter((preset) => preset.custom).length + 1}`;
  const preset = {
    id: `custom-${crypto.randomUUID()}`,
    name,
    retune: tuneSettings.retuneSpeed,
    humanize: tuneSettings.humanize,
    formant: tuneSettings.formant,
    gate: tuneSettings.gate,
    deEss: tuneSettings.deEss,
    comp: basePreset.comp,
    space: basePreset.space,
    width: basePreset.width,
    custom: true,
  };

  presets.push(preset);
  els.customPresetNameInput.value = "";
  renderPresets();
  applyPreset(preset.id);
  els.sessionState.textContent = "Preset saved";
  scheduleAutosave();
}

function normalizePreset(preset) {
  return {
    id: preset.id || `custom-${crypto.randomUUID()}`,
    name: preset.name || "Custom",
    retune: Number(preset.retune ?? 50),
    humanize: Number(preset.humanize ?? 25),
    formant: Number(preset.formant ?? 0),
    gate: Number(preset.gate ?? 0),
    deEss: Number(preset.deEss ?? 0),
    comp: Number(preset.comp ?? 60),
    space: Number(preset.space ?? 12),
    width: Number(preset.width ?? 24),
    custom: Boolean(preset.custom),
  };
}

function applyPreset(id) {
  state.selectedPresetId = id;
  const preset = presets.find((item) => item.id === id) || presets[0];
  state.selectedPresetId = preset.id;
  els.presetName.textContent = preset.name;
  els.compValue.textContent = preset.comp;
  els.spaceValue.textContent = preset.space;
  els.widthValue.textContent = preset.width;
  els.retuneSpeedSlider.value = preset.retune;
  els.humanizeSlider.value = preset.humanize;
  els.formantSlider.value = preset.formant;
  els.gateSlider.value = preset.gate || 0;
  els.deEssSlider.value = preset.deEss || 0;
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
  const batchTargets = getBatchTargets(selectedTake);
  const vocalBusy = isVocalBusy();
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
  els.batchRenderButton.disabled = vocalBusy || batchTargets.length === 0;
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
  renderBatchPanel(batchTargets);

  if (!selectedTake) {
    els.vocalStatus.textContent = "No take";
    els.selectedTakeMeta.innerHTML = `<span class="eyebrow">Record a take first</span>`;
    renderComparePanel(null);
    return;
  }

  const preset = getSelectedPreset();
  els.vocalStatus.textContent = state.isRenderingVocal ? "Rendering" : `${preset.name} ready`;
  els.selectedTakeMeta.innerHTML = `
    <strong>${selectedTake.trackName}</strong>
    <span>${selectedTake.processed ? "Processed" : "Original"} / ${formatDuration(selectedTake.duration)} @ ${formatDuration(selectedTake.startTime || 0)}</span>
    <small>${selectedTake.processed ? `${selectedTake.presetName} v${selectedTake.version || 1} / ${getTuneSignature(selectedTake.tuneSettings)}` : "Raw take"}</small>
  `;
  renderComparePanel(comparisonPair);
}

function updateTuneControls() {
  const settings = getTuneSettings();
  els.retuneSpeedText.textContent = String(settings.retuneSpeed);
  els.retuneValue.textContent = String(settings.retuneSpeed);
  els.humanizeText.textContent = String(settings.humanize);
  els.formantText.textContent = formatSigned(settings.formant);
  els.gateText.textContent = String(settings.gate);
  els.deEssText.textContent = String(settings.deEss);
}

function setTuneControlsDisabled(isDisabled) {
  els.retuneSpeedSlider.disabled = isDisabled;
  els.humanizeSlider.disabled = isDisabled;
  els.formantSlider.disabled = isDisabled;
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
    const decodeContext = new OfflineAudioContext(2, 1, 48000);
    const sourceBuffer = await decodeContext.decodeAudioData(await selectedTake.blob.arrayBuffer());
    selectedTake.pitchAnalysis = analyzePitchBuffer(sourceBuffer);
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

function renderBatchPanel(targets) {
  const scope = els.batchScopeSelect.value;
  els.batchStatus.textContent = targets.length ? `${targets.length} raw` : "No raw";
  if (targets.length) {
    els.batchMeta.textContent =
      scope === "track"
        ? `Will render ${targets.length} raw take(s) on this track.`
        : `Will render ${targets.length} raw take(s) across all vocal tracks.`;
    return;
  }

  els.batchMeta.textContent = scope === "track" ? "No raw takes on this track." : "No raw vocal takes available.";
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
    els.sessionState.textContent = "No raw takes";
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
  const decodeContext = new OfflineAudioContext(2, 1, 48000);
  const sourceBuffer = await decodeContext.decodeAudioData(await sourceTake.blob.arrayBuffer());
  sourceTake.pitchAnalysis ||= analyzePitchBuffer(sourceBuffer);
  const pitchPlan = getPitchPlan(sourceTake.pitchAnalysis, sourceTake);
  sourceTake.pitchPlan = pitchPlan;
  const rendered = await renderVocalBuffer(sourceBuffer, preset, pitchPlan, tuneSettings);
  const renderedAnalysis = analyzePitchBuffer(rendered);
  const blob = encodeWav(rendered);
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
    waveform: makeWaveformFromAudioBuffer(rendered, 240),
    clipGain: sourceTake.clipGain ?? 1,
    fadeIn: sourceTake.fadeIn || 0,
    fadeOut: sourceTake.fadeOut || 0,
    processed: true,
    sourceTakeId: sourceTake.id,
    presetId: preset.id,
    presetName: preset.name,
    version,
    renderLabel: `${preset.name} v${version}`,
    chainSnapshot: {
      preset: { ...preset },
      tuneSettings: { ...tuneSettings },
      key: els.keySelect.value,
      scaleMode: els.scaleModeSelect.value,
      customScaleIntervals: [...state.customScaleIntervals],
    },
    pitchAnalysis: renderedAnalysis,
    pitchPlan: getPitchPlan(renderedAnalysis),
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

function getPitchModeLabel() {
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
          <div>
            <strong>${escapeHtml(getTakeTitle(take, index))}</strong>
            <small>${getTakeSubtitle(take)}</small>
            ${renderTakeWaveform(take)}
          </div>
          <div class="take-controls">
            <button class="mini-button ${isPlaying ? "active" : ""}" type="button" data-play-take="${take.id}">
              ${isPlaying ? "Pause" : "Play"}
            </button>
            <button class="mini-button ${take.compSelected ? "active" : ""}" type="button" data-comp-take="${take.id}">
              Comp
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

  updateQueueButton();
  updateExportButtons();
  renderCompView();
  renderVocalPanel();
  renderTimeline();
  renderExportPanel();
}

function renderCompView() {
  if (!els.compLaneList || !els.compPoolList) {
    return;
  }

  const compTakes = getCompTakes();
  const poolTakes = getAllTakes().filter((take) => !take.compSelected);
  els.compLaneMeta.textContent = `${compTakes.length} take${compTakes.length === 1 ? "" : "s"}`;
  els.compPoolMeta.textContent = `${poolTakes.length} available`;
  els.compPlayButton.disabled = !state.isQueuePlaying && compTakes.length === 0;
  els.compClearButton.disabled = compTakes.length === 0;
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
    { label: "Dry vocals", count: getAllTakes().filter((take) => !take.processed).length, unit: "source" },
    { label: "Tuned vocals", count: getAllTakes().filter((take) => take.processed).length, unit: "source" },
    { label: "Metadata", count: [metadata.artist, metadata.title, metadata.bpm, metadata.key].filter(Boolean).length, unit: "field" },
    { label: "Normalize", count: els.exportNormalizeInput.checked ? `On ${formatGainDb(state.lastExportNormalizeGain)}` : "Off", unit: "" },
  ];
  const jobs = state.exportQueue.slice(-8).reverse();

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
            </div>
          </div>
        `,
      )
      .join("")
    : `<span class="empty-takes">No export jobs yet</span>`;

  els.exportList.innerHTML = `
    <div class="export-section-heading">Sources</div>
    ${sourceRows}
    <div class="export-section-heading">Queue</div>
    ${queueRows}
  `;

  els.exportList.querySelectorAll("[data-preview-export]").forEach((button) => {
    button.addEventListener("click", () => playExportPreview(button.dataset.previewExport));
  });
}

function formatExportRowCount(row) {
  if (typeof row.count === "string") {
    return row.count;
  }

  return `${row.count} ${row.unit}${row.count === 1 ? "" : "s"}`;
}

function updateExportMetadata() {
  renderExportPanel();
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

  els.timelineMarkers.innerHTML = markers
    .map(
      (marker) => `
        <span class="timeline-marker" style="left: ${timelinePercent(marker.time, timelineEnd)}%">
          <span>${escapeHtml(marker.type)}</span>
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
      const track = findTrack(take.trackId);
      return `
        <div class="timeline-region take-region" style="left: ${left}%; width: ${width}%; --row-index: ${index}; --track-color: ${track?.color || "#c8ff4d"};">
          <strong>${escapeHtml(getTakeShortName(take))}</strong>
        </div>
      `;
    })
    .join("");
  els.timelineRegions.innerHTML = beatRegion + takeRegions;

  els.markerList.innerHTML = markers.length
    ? markers
      .map(
        (marker) => `
          <div class="marker-row">
            <header>
              <strong>${escapeHtml(marker.type)}</strong>
              <button class="mini-button danger" type="button" data-delete-marker="${marker.id}">Del</button>
            </header>
            <small>${formatDuration(marker.time)}</small>
          </div>
        `,
      )
      .join("")
    : `<span class="empty-takes">No markers</span>`;

  els.regionList.innerHTML = takes.length
    ? takes
      .map(
        (take, index) => `
          <div class="region-row">
            <header>
              <strong>${escapeHtml(getTakeTitle(take, index))}</strong>
              <small>${escapeHtml(take.trackName)}</small>
            </header>
            <input class="region-name-input" type="text" value="${escapeHtml(getTakeTitle(take, index))}" data-region-name="${take.id}" />
            <div class="region-actions">
              <button class="mini-button" type="button" data-nudge-region="${take.id}" data-delta="-0.1">-0.1</button>
              <input type="number" min="0" step="0.1" value="${(take.startTime || 0).toFixed(1)}" data-region-start="${take.id}" />
              <button class="mini-button" type="button" data-nudge-region="${take.id}" data-delta="0.1">+0.1</button>
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

  els.markerList.querySelectorAll("[data-delete-marker]").forEach((button) => {
    button.addEventListener("click", () => deleteTimelineMarker(button.dataset.deleteMarker));
  });
  els.regionList.querySelectorAll("[data-region-start]").forEach((input) => {
    input.addEventListener("change", () => setRegionStart(input.dataset.regionStart, input.value));
  });
  els.regionList.querySelectorAll("[data-region-name]").forEach((input) => {
    input.addEventListener("change", () => setRegionName(input.dataset.regionName, input.value));
  });
  els.regionList.querySelectorAll("[data-region-gain]").forEach((input) => {
    input.addEventListener("change", () => setRegionClipGain(input.dataset.regionGain, input.value));
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
      clipGain: take.clipGain ?? 1,
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
    take.clipGain = Math.max(0, Number(saved.clipGain ?? 1));
    take.fadeIn = Math.max(0, Number(saved.fadeIn) || 0);
    take.fadeOut = Math.max(0, Number(saved.fadeOut) || 0);
  });
}

function refreshTimelineEdit() {
  updateActiveSessionMix();
  renderTracks();
  renderTakes();
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
    time: Math.max(0, Number(els.markerTimeInput.value) || 0),
  };
  state.markers.push(marker);
  state.markers = normalizeMarkers(state.markers);
  els.markerTimeInput.value = marker.time.toFixed(1);
  els.sessionState.textContent = "Marker added";
  refreshTimelineEdit();
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

  const nextStart = Math.max(0, Number(value) || 0);
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
  els.sessionState.textContent = "Region renamed";
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

  setRegionStart(takeId, (take.startTime || 0) + delta);
}

function isSameTimelineNumber(left, right) {
  return Math.abs(Number(left || 0) - Number(right || 0)) < 0.0001;
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

function timelinePercent(value, end) {
  return Math.max(0, Math.min(100, (value / Math.max(1, end)) * 100));
}

function normalizeMarkers(markers = []) {
  return markers
    .map((marker) => ({
      id: marker.id || crypto.randomUUID(),
      type: marker.type || "Marker",
      time: Math.max(0, Number(marker.time) || 0),
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
  const endPosition = Math.max(
    beatBuffer?.duration || 0,
    ...takeBuffers.map(({ take, buffer }) => (take.startTime || 0) + buffer.duration),
    0.1,
  );
  const frameCount = Math.ceil(endPosition * sampleRate);
  const renderContext = new OfflineAudioContext(2, frameCount, sampleRate);

  if (beatBuffer) {
    scheduleBuffer(renderContext, beatBuffer, 0, 1, 0);
  }

  takeBuffers.forEach(({ take, track, buffer }) => {
    scheduleBuffer(renderContext, buffer, take.startTime || 0, getTrackOutputVolume(track), track.pan, take);
  });

  return encodeWav(applyExportNormalize(await renderContext.startRendering()), getExportMetadata());
}

async function exportTrackStems() {
  await exportRenderGroups(getStemExportGroups(), "Track stems");
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
  if (job.previewUrl) {
    URL.revokeObjectURL(job.previewUrl);
  }

  job.previewUrl = URL.createObjectURL(blob);
  job.previewName = filename;
}

function playExportPreview(jobId) {
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
    if (removable.includes(index) && job.previewUrl) {
      URL.revokeObjectURL(job.previewUrl);
    }
  });
  state.exportQueue = state.exportQueue.filter((_, index) => !removable.includes(index));
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
  const endPosition = Math.max(
    beatBuffer?.duration || 0,
    ...takeBuffers.map(({ take, buffer }) => (take.startTime || 0) + buffer.duration),
    0.1,
  );
  const frameCount = Math.ceil(endPosition * sampleRate);
  const renderContext = new OfflineAudioContext(2, frameCount, sampleRate);

  if (beatBuffer) {
    scheduleBuffer(renderContext, beatBuffer, 0, 1, 0);
  }

  takeBuffers.forEach(({ take, track, buffer }) => {
    scheduleBuffer(renderContext, buffer, take.startTime || 0, getTrackOutputVolume(track), track.pan, take);
  });

  return encodeWav(applyExportNormalize(await renderContext.startRendering()), getExportMetadata());
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

function scheduleBuffer(context, buffer, startTime, volume, pan, take = null) {
  const source = context.createBufferSource();
  const gain = context.createGain();
  const panner = context.createStereoPanner ? context.createStereoPanner() : null;

  source.buffer = buffer;
  if (take) {
    applyTakeGainAutomation(gain.gain, volume * getTakeClipGain(take), take, 0, Math.max(0, startTime));
  } else {
    gain.gain.value = volume;
  }
  source.connect(gain);

  if (panner) {
    panner.pan.value = pan;
    gain.connect(panner).connect(context.destination);
  } else {
    gain.connect(context.destination);
  }

  source.start(Math.max(0, startTime));
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
  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel += 1) {
    const data = audioBuffer.getChannelData(channel);
    for (let index = 0; index < data.length; index += 1) {
      data[index] = Math.max(-1, Math.min(1, data[index] * gain));
    }
  }
  return audioBuffer;
}

function getAudioBufferPeak(audioBuffer) {
  let peak = 0;
  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel += 1) {
    const data = audioBuffer.getChannelData(channel);
    for (let index = 0; index < data.length; index += 1) {
      peak = Math.max(peak, Math.abs(data[index]));
    }
  }
  return peak;
}

function encodeWav(audioBuffer, metadata = null) {
  return window.PunchLabAudio.encodeWav(audioBuffer, metadata);
}

function downloadBlob(blob, filename) {
  window.PunchLabAudio.downloadBlob(blob, filename);
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
  const db = 20 * Math.log10(gain);
  return `${db >= 0 ? "+" : ""}${db.toFixed(1)} dB`;
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
  return {
    retuneSpeed: Number(els.retuneSpeedSlider?.value) || 0,
    humanize: Number(els.humanizeSlider?.value) || 0,
    formant: Number(els.formantSlider?.value) || 0,
    gate: Number(els.gateSlider?.value) || 0,
    deEss: Number(els.deEssSlider?.value) || 0,
  };
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
  return getAllTakes()
    .filter((take) => take.processed && take.sourceTakeId === sourceTakeId)
    .sort((a, b) => {
      const versionDelta = (a.version || 1) - (b.version || 1);
      return versionDelta || a.createdAt.getTime() - b.createdAt.getTime();
    })
    .at(-1);
}

function getNextProcessedVersion(sourceTakeId, presetId) {
  const currentMax = getAllTakes()
    .filter((take) => take.processed && take.sourceTakeId === sourceTakeId && take.presetId === presetId)
    .reduce((max, take) => Math.max(max, Number(take.version) || 1), 0);
  return currentMax + 1;
}

function getBatchTargets(selectedTake) {
  const rawTakes = getAllTakes().filter((take) => !take.processed);
  if (els.batchScopeSelect.value === "all") {
    return rawTakes;
  }

  const trackId = selectedTake?.trackId || state.armedTrackId;
  return rawTakes.filter((take) => take.trackId === trackId);
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

function getTakeClipGain(take) {
  return Math.max(0, Number(take?.clipGain ?? 1));
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
  const hasDry = getAllTakes().some((take) => !take.processed && getTrackOutputVolume(findTrack(take.trackId)) > 0);
  const hasTuned = getAllTakes().some((take) => take.processed && getTrackOutputVolume(findTrack(take.trackId)) > 0);
  els.exportStemsButton.disabled = !hasStems;
  els.exportDryVocalsButton.disabled = !hasDry;
  els.exportTunedVocalsButton.disabled = !hasTuned;
  els.exportStemsButton.classList.toggle("rendering", state.isExportingAssets);
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

  return take.processed ? `${take.trackName} ${take.presetName} v${take.version || 1}` : `${take.trackName} take ${index + 1}`;
}

function getTakeSubtitle(take) {
  const compTag = take.compSelected ? "comp / " : "";
  if (take.processed) {
    return `${compTag}processed v${take.version || 1} / ${getTuneSignature(take.tuneSettings)} / ${formatDuration(take.duration)} @ ${formatDuration(take.startTime || 0)}`;
  }

  return `${compTag}raw / ${formatDuration(take.duration)} @ ${formatDuration(take.startTime || 0)}`;
}

function getTakeShortName(take) {
  if (take.name) {
    return take.name;
  }

  return take.processed ? `${take.trackName} ${take.presetName} v${take.version || 1}` : `${take.trackName} raw`;
}

function getTuneSignature(settings = {}) {
  settings ||= {};
  const retuneSpeed = Number(settings.retuneSpeed ?? 0);
  const humanize = Number(settings.humanize ?? 0);
  const formant = Number(settings.formant ?? 0);
  const gate = Number(settings.gate ?? 0);
  const deEss = Number(settings.deEss ?? 0);
  return `R${retuneSpeed} H${humanize} F${formatSigned(formant)} G${gate} D${deEss}`;
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
