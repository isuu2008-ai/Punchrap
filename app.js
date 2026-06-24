const state = {
  audioContext: null,
  stream: null,
  processedStream: null,
  analyser: null,
  gainNode: null,
  recorderDestination: null,
  mediaRecorder: null,
  chunks: [],
  isRecording: false,
  recordStart: 0,
  recordStartPosition: 0,
  timerFrame: 0,
  waveFrame: 0,
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
  isExportingMix: false,
  isExportingAssets: false,
  isRenderingVocal: false,
  autosaveTimer: 0,
  isAutosaving: false,
  hasAutosave: false,
  currentTakeAudio: null,
  currentTakeId: null,
  currentTakeResolve: null,
  isQueuePlaying: false,
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
};

const tracks = [
  { id: "main", name: "Main", color: "#c8ff4d", volume: 0.9, pan: 0, muted: false, solo: false, takes: [] },
  { id: "double", name: "Double", color: "#41e6d0", volume: 0.72, pan: 0, muted: false, solo: false, takes: [] },
  { id: "adlib-l", name: "Adlib L", color: "#ffb74a", volume: 0.68, pan: -0.45, muted: false, solo: false, takes: [] },
  { id: "adlib-r", name: "Adlib R", color: "#7db2ff", volume: 0.68, pan: 0.45, muted: false, solo: false, takes: [] },
  { id: "hook", name: "Hook", color: "#ff4f64", volume: 0.82, pan: 0, muted: false, solo: false, takes: [] },
];

const presets = [
  { id: "trap-hard", name: "Trap Hard", retune: 88, humanize: 10, formant: 10, comp: 72, space: 18, width: 42 },
  { id: "drill-dark", name: "Drill Dark", retune: 72, humanize: 18, formant: -12, comp: 82, space: 12, width: 28 },
  { id: "clean-rap", name: "Clean Rap", retune: 22, humanize: 60, formant: 0, comp: 62, space: 8, width: 18 },
  { id: "rage-wide", name: "Rage Wide", retune: 95, humanize: 5, formant: 18, comp: 76, space: 34, width: 86 },
  { id: "radio-hook", name: "Radio Hook", retune: 58, humanize: 30, formant: 8, comp: 68, space: 45, width: 72 },
  { id: "lofi-demo", name: "Lo-Fi Demo", retune: 36, humanize: 55, formant: -18, comp: 54, space: 22, width: 12 },
];

const els = {
  viewTabs: document.querySelectorAll("[data-view]"),
  viewPanels: document.querySelectorAll("[data-view-panel]"),
  projectInput: document.querySelector("#projectInput"),
  saveProjectButton: document.querySelector("#saveProjectButton"),
  recoverProjectButton: document.querySelector("#recoverProjectButton"),
  beatInput: document.querySelector("#beatInput"),
  beatName: document.querySelector("#beatName"),
  beatAudio: document.querySelector("#beatAudio"),
  bpmInput: document.querySelector("#bpmInput"),
  countInSelect: document.querySelector("#countInSelect"),
  keySelect: document.querySelector("#keySelect"),
  inputGainSlider: document.querySelector("#inputGainSlider"),
  inputGainText: document.querySelector("#inputGainText"),
  micButton: document.querySelector("#micButton"),
  playButton: document.querySelector("#playButton"),
  stopButton: document.querySelector("#stopButton"),
  recordButton: document.querySelector("#recordButton"),
  sessionState: document.querySelector("#sessionState"),
  clock: document.querySelector("#clock"),
  micStatus: document.querySelector("#micStatus"),
  inputMeter: document.querySelector("#inputMeter"),
  inputLevelText: document.querySelector("#inputLevelText"),
  waveCanvas: document.querySelector("#waveCanvas"),
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
  setPunchInButton: document.querySelector("#setPunchInButton"),
  setPunchOutButton: document.querySelector("#setPunchOutButton"),
  punchWindowText: document.querySelector("#punchWindowText"),
  presetGrid: document.querySelector("#presetGrid"),
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
  batchScopeSelect: document.querySelector("#batchScopeSelect"),
  batchRenderButton: document.querySelector("#batchRenderButton"),
  batchStatus: document.querySelector("#batchStatus"),
  batchMeta: document.querySelector("#batchMeta"),
  takesList: document.querySelector("#takesList"),
  playQueueButton: document.querySelector("#playQueueButton"),
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
  exportStemsButton: document.querySelector("#exportStemsButton"),
  exportDryVocalsButton: document.querySelector("#exportDryVocalsButton"),
  exportTunedVocalsButton: document.querySelector("#exportTunedVocalsButton"),
  exportStatusText: document.querySelector("#exportStatusText"),
  exportList: document.querySelector("#exportList"),
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
  updateInputGain();
  updatePunchControls();
  checkAutosave();
  drawIdleWave();
  updateTimer();

  window.addEventListener("resize", drawIdleWave);
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
  els.keySelect.addEventListener("change", renderVocalPanel);
  els.setPunchInButton.addEventListener("click", () => setPunchPoint("in"));
  els.setPunchOutButton.addEventListener("click", () => setPunchPoint("out"));
  els.beatAudio.addEventListener("timeupdate", maintainLoopPlayback);
  els.playQueueButton.addEventListener("click", toggleTakeQueue);
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
  els.vocalTakeSelect.addEventListener("change", () => {
    state.selectedVocalTakeId = els.vocalTakeSelect.value || null;
    renderVocalPanel();
  });
  els.previewVocalButton.addEventListener("click", previewSelectedVocalTake);
  els.analyzeVocalButton.addEventListener("click", analyzeSelectedVocalTake);
  els.renderVocalButton.addEventListener("click", renderSelectedVocalTake);
  els.compareSourceButton.addEventListener("click", () => playComparisonTake("source"));
  els.compareProcessedButton.addEventListener("click", () => playComparisonTake("processed"));
  els.batchScopeSelect.addEventListener("change", renderVocalPanel);
  els.batchRenderButton.addEventListener("click", renderBatchVocalTakes);
  els.saveProjectButton.addEventListener("click", saveProject);
  els.projectInput.addEventListener("change", loadProject);
  els.recoverProjectButton.addEventListener("click", recoverAutosave);
  els.addMarkerButton.addEventListener("click", addTimelineMarker);
  els.exportStemsButton.addEventListener("click", exportTrackStems);
  els.exportDryVocalsButton.addEventListener("click", exportDryVocals);
  els.exportTunedVocalsButton.addEventListener("click", exportTunedVocals);
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
    state.recorderDestination = state.audioContext.createMediaStreamDestination();

    state.analyser.fftSize = 2048;
    state.gainNode.gain.value = state.inputGain;
    source.connect(state.gainNode);
    state.gainNode.connect(state.analyser);
    state.gainNode.connect(state.recorderDestination);
    state.processedStream = state.recorderDestination.stream;

    els.micStatus.classList.add("ready");
    els.sessionState.textContent = "Mic ready";
    updateInputGain();
    startMeter();
  } catch (error) {
    els.sessionState.textContent = "Mic blocked";
    console.error(error);
  }
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

  applyProjectSettings(project.settings);
  state.markers = normalizeMarkers(project.markers);
  state.latestTake = getAllTakes().at(-1) || null;
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
    inputGain: state.inputGain,
    armedTrackId: state.armedTrackId,
    selectedPresetId: state.selectedPresetId,
    tune: getTuneSettings(),
    punchEnabled: state.punchEnabled,
    loopEnabled: state.loopEnabled,
    metronomeEnabled: state.metronomeEnabled,
    punchIn: state.punchIn,
    punchOut: state.punchOut,
  };
}

function applyProjectSettings(settings = {}) {
  els.bpmInput.value = settings.bpm || 140;
  els.countInSelect.value = settings.countIn || "0";
  els.keySelect.value = settings.key || "C minor";
  els.inputGainSlider.value = settings.inputGain || 2;
  state.armedTrackId = tracks.some((track) => track.id === settings.armedTrackId)
    ? settings.armedTrackId
    : tracks[0]?.id || "main";
  state.punchEnabled = Boolean(settings.punchEnabled);
  state.loopEnabled = Boolean(settings.loopEnabled);
  state.metronomeEnabled = Boolean(settings.metronomeEnabled);
  state.punchIn = Number(settings.punchIn || 0);
  state.punchOut = Number(settings.punchOut || 4);

  if (settings.selectedPresetId && presets.some((preset) => preset.id === settings.selectedPresetId)) {
    applyPreset(settings.selectedPresetId);
  }

  if (settings.tune) {
    els.retuneSpeedSlider.value = settings.tune.retuneSpeed ?? els.retuneSpeedSlider.value;
    els.humanizeSlider.value = settings.tune.humanize ?? els.humanizeSlider.value;
    els.formantSlider.value = settings.tune.formant ?? els.formantSlider.value;
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

async function toggleTakeQueue() {
  if (state.isQueuePlaying) {
    stopTakeQueue();
    els.sessionState.textContent = "Review stopped";
    return;
  }

  const allTakes = getAllTakes();
  if (!allTakes.length) {
    els.sessionState.textContent = "No takes";
    return;
  }

  stopSessionPlayback(false);
  state.isQueuePlaying = true;
  state.queueTakeIds = allTakes.map((take) => take.id);
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
    const status = await playTakeAudio(take, `Review ${index + 1}/${state.queueTakeIds.length} ${take.trackName}`);
    if (status === "blocked" || status === "error") {
      break;
    }

    if (state.isQueuePlaying) {
      await wait(120);
    }
  }

  if (state.isQueuePlaying) {
    state.isQueuePlaying = false;
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
  const take = {
    id: crypto.randomUUID(),
    trackId: track.id,
    trackName: track.name,
    url,
    blob,
    extension,
    createdAt: new Date(),
    startTime: state.recordStartPosition,
    duration: (performance.now() - state.recordStart) / 1000,
  };

  track.takes.push(take);
  state.latestTake = take;
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
          ${preset.name}
        </button>
      `,
    )
    .join("");

  els.presetGrid.querySelectorAll("[data-preset]").forEach((button) => {
    button.addEventListener("click", () => applyPreset(button.dataset.preset));
  });
}

function applyPreset(id) {
  state.selectedPresetId = id;
  const preset = presets.find((item) => item.id === id);
  els.presetName.textContent = preset.name;
  els.compValue.textContent = preset.comp;
  els.spaceValue.textContent = preset.space;
  els.widthValue.textContent = preset.width;
  els.retuneSpeedSlider.value = preset.retune;
  els.humanizeSlider.value = preset.humanize;
  els.formantSlider.value = preset.formant;
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
  renderPitchPanel(selectedTake?.pitchAnalysis || null);
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
    const plan = getPitchPlan(selectedTake.pitchAnalysis);
    els.sessionState.textContent = plan.detectedLabel === "--" ? "Pitch not found" : `${plan.detectedLabel} detected`;
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
  const pitchPlan = getPitchPlan(sourceTake.pitchAnalysis);
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

function renderPitchPanel(analysis) {
  if (!els.pitchDetectedText) {
    return;
  }

  const plan = getPitchPlan(analysis);
  els.pitchKeyText.textContent = els.keySelect.value;
  els.pitchDetectedText.textContent = plan.detectedLabel;
  els.pitchTargetText.textContent = plan.targetLabel;
  els.pitchCorrectionText.textContent = plan.correctionLabel;
  els.pitchConfidenceText.textContent = plan.keyFitLabel;
}

function getPitchPlan(analysis) {
  return window.PunchLabDSP.getPitchPlan(analysis, els.keySelect.value);
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
          </div>
          <div class="take-controls">
            <button class="mini-button ${isPlaying ? "active" : ""}" type="button" data-play-take="${take.id}">
              ${isPlaying ? "Pause" : "Play"}
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

  updateQueueButton();
  updateExportButtons();
  renderVocalPanel();
  renderTimeline();
  renderExportPanel();
}

function renderExportPanel() {
  if (!els.exportList) {
    return;
  }

  const rows = [
    { label: "Full mix", count: getAudibleTakes().length + (state.beatArrayBuffer ? 1 : 0) },
    { label: "Track stems", count: getStemExportGroups().length },
    { label: "Dry vocals", count: getAllTakes().filter((take) => !take.processed).length },
    { label: "Tuned vocals", count: getAllTakes().filter((take) => take.processed).length },
  ];

  els.exportList.innerHTML = rows
    .map(
      (row) => `
        <div class="export-row">
          <strong>${row.label}</strong>
          <small>${row.count} source${row.count === 1 ? "" : "s"}</small>
        </div>
      `,
    )
    .join("");
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

function addTimelineMarker() {
  const marker = {
    id: crypto.randomUUID(),
    type: els.markerTypeSelect.value,
    time: Math.max(0, Number(els.markerTimeInput.value) || 0),
  };
  state.markers.push(marker);
  state.markers = normalizeMarkers(state.markers);
  els.markerTimeInput.value = marker.time.toFixed(1);
  renderTimeline();
  scheduleAutosave();
}

function deleteTimelineMarker(markerId) {
  state.markers = state.markers.filter((marker) => marker.id !== markerId);
  renderTimeline();
  scheduleAutosave();
}

function setRegionStart(takeId, value) {
  const take = findTake(takeId);
  if (!take) {
    return;
  }

  take.startTime = Math.max(0, Number(value) || 0);
  els.sessionState.textContent = "Region moved";
  renderTracks();
  renderTakes();
  updateExportButtons();
  scheduleAutosave();
}

function setRegionName(takeId, value) {
  const take = findTake(takeId);
  if (!take) {
    return;
  }

  take.name = value.trim() || null;
  els.sessionState.textContent = "Region renamed";
  renderTracks();
  renderTakes();
  updateExportButtons();
  scheduleAutosave();
}

function setRegionClipGain(takeId, value) {
  const take = findTake(takeId);
  if (!take) {
    return;
  }

  take.clipGain = Math.max(0, Number(value) || 0);
  els.sessionState.textContent = "Clip gain updated";
  updateActiveSessionMix();
  renderTracks();
  renderTakes();
  updateExportButtons();
  scheduleAutosave();
}

function setRegionFade(takeId, edge, value) {
  const take = findTake(takeId);
  if (!take) {
    return;
  }

  const safeValue = Math.max(0, Number(value) || 0);
  if (edge === "in") {
    take.fadeIn = safeValue;
  } else {
    take.fadeOut = safeValue;
  }
  els.sessionState.textContent = "Fade updated";
  renderTimeline();
  updateExportButtons();
  scheduleAutosave();
}

function nudgeRegionStart(takeId, delta) {
  const take = findTake(takeId);
  if (!take) {
    return;
  }

  setRegionStart(takeId, (take.startTime || 0) + delta);
}

function getTimelineEndPosition() {
  const markerEnd = state.markers.reduce((end, marker) => Math.max(end, marker.time + 4), 0);
  return Math.max(16, getSessionEndPosition(), markerEnd);
}

function makeTimelineTicks(end) {
  const step = end > 120 ? 30 : end > 60 ? 15 : 5;
  const ticks = [];
  for (let time = 0; time <= end; time += step) {
    ticks.push(time);
  }
  return ticks;
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

async function exportFullMix() {
  if (state.isExportingMix) {
    return;
  }

  const audibleTakes = getAudibleTakes();
  if (!state.beatArrayBuffer && !audibleTakes.length) {
    els.sessionState.textContent = "No audible mix";
    return;
  }

  state.isExportingMix = true;
  updateExportButtons();
  stopTakeQueue(false);
  stopSessionPlayback(false);
  stopCurrentTake(false);
  els.sessionState.textContent = "Rendering mix";

  try {
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

    const rendered = await renderContext.startRendering();
    const wavBlob = encodeWav(rendered);
    downloadBlob(wavBlob, makeMixFilename());
    els.sessionState.textContent = "Mix exported";
  } catch (error) {
    els.sessionState.textContent = "Export failed";
    console.error(error);
  } finally {
    state.isExportingMix = false;
    updateExportButtons();
  }
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

  state.isExportingAssets = true;
  updateExportButtons();
  stopTakeQueue(false);
  stopSessionPlayback(false);
  stopCurrentTake(false);
  els.sessionState.textContent = `Rendering ${label}`;
  els.exportStatusText.textContent = "Rendering";

  try {
    for (let index = 0; index < activeGroups.length; index += 1) {
      const group = activeGroups[index];
      els.exportStatusText.textContent = `${index + 1}/${activeGroups.length} ${group.name}`;
      const wavBlob = await renderTakeMixBlob(group.takes, group.includeBeat);
      downloadBlob(wavBlob, group.filename);
    }
    els.sessionState.textContent = `${label} exported`;
    els.exportStatusText.textContent = "Done";
  } catch (error) {
    els.sessionState.textContent = "Export failed";
    els.exportStatusText.textContent = "Failed";
    console.error(error);
  } finally {
    state.isExportingAssets = false;
    updateExportButtons();
  }
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

  return encodeWav(await renderContext.startRendering());
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

function encodeWav(audioBuffer) {
  return window.PunchLabAudio.encodeWav(audioBuffer);
}

function downloadBlob(blob, filename) {
  window.PunchLabAudio.downloadBlob(blob, filename);
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
  state.latestTake = getAllTakes().at(-1) || null;
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

function getSelectedPreset() {
  return presets.find((preset) => preset.id === state.selectedPresetId) || presets[0];
}

function getTuneSettings() {
  return {
    retuneSpeed: Number(els.retuneSpeedSlider?.value) || 0,
    humanize: Number(els.humanizeSlider?.value) || 0,
    formant: Number(els.formantSlider?.value) || 0,
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
  const label = els.playQueueButton.querySelector(".button-label");
  els.playQueueButton.disabled = !state.isQueuePlaying && allTakes.length === 0;
  els.playQueueButton.classList.toggle("queue-active", state.isQueuePlaying);
  if (label) {
    label.textContent = state.isQueuePlaying ? "Stop all" : "Play all";
  }
}

function updateExportButtons() {
  if (!els.exportMixButton) {
    return;
  }

  const hasAudibleSources = Boolean(state.beatArrayBuffer) || getAudibleTakes().length > 0;
  const label = els.exportMixButton.querySelector(".button-label");
  els.exportMixButton.disabled = state.isExportingMix || !hasAudibleSources;
  els.exportMixButton.classList.toggle("rendering", state.isExportingMix);
  if (label) {
    label.textContent = state.isExportingMix ? "Rendering" : "Full mix";
  }

  const isBusy = state.isExportingMix || state.isExportingAssets;
  const hasStems = getStemExportGroups().length > 0;
  const hasDry = getAllTakes().some((take) => !take.processed && getTrackOutputVolume(findTrack(take.trackId)) > 0);
  const hasTuned = getAllTakes().some((take) => take.processed && getTrackOutputVolume(findTrack(take.trackId)) > 0);
  els.exportStemsButton.disabled = isBusy || !hasStems;
  els.exportDryVocalsButton.disabled = isBusy || !hasDry;
  els.exportTunedVocalsButton.disabled = isBusy || !hasTuned;
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
  const source = state.beatFileName || "session";
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
  if (take.processed) {
    return `processed v${take.version || 1} / ${getTuneSignature(take.tuneSettings)} / ${formatDuration(take.duration)} @ ${formatDuration(take.startTime || 0)}`;
  }

  return `raw / ${formatDuration(take.duration)} @ ${formatDuration(take.startTime || 0)}`;
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
  return `R${retuneSpeed} H${humanize} F${formatSigned(formant)}`;
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
