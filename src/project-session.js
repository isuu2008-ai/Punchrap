(() => {
  function requireValue(source, key) {
    const value = source?.[key];
    if (!value) {
      throw new Error(`PunchLab project session dependency missing: ${key}`);
    }
    return value;
  }

  function createProjectSession(deps = {}) {
    const els = requireValue(deps, "els");
    const state = requireValue(deps, "state");
    const tracks = requireValue(deps, "tracks");
    const presets = requireValue(deps, "presets");
    const actions = requireValue(deps, "actions");
    const helpers = requireValue(deps, "helpers");

    async function newProject() {
      window.clearTimeout(state.autosaveTimer);
      state.autosaveTimer = 0;
      actions.stopAll();
      actions.revokeCurrentProjectAssets();
      resetCurrentProjectState();

      let recoveryClearFailed = false;
      try {
        if (window.PunchLabStorage?.clearRecovery) {
          await window.PunchLabStorage.clearRecovery();
        } else if (window.PunchLabStorage?.clearAutosave) {
          await window.PunchLabStorage.clearAutosave();
        }
      } catch (error) {
        console.error(error);
        recoveryClearFailed = true;
      }

      state.hasAutosave = false;
      state.backupHistory = [];
      renderCleanProject();
      els.sessionState.textContent = recoveryClearFailed ? "New project, recovery clear failed" : "New project";
    }

    function resetCurrentProjectState() {
      state.loadedProjectEnvironment = null;
      state.loadedProjectExportHistory = [];
      state.latestTake = null;
      state.recordWaveform = [];
      state.selectedVocalTakeId = null;
      state.selectedTimelineTakeId = null;
      state.timelineRegionDrag = null;
      state.exportQueue = [];
      state.exportJobSeq = 1;
      state.loudnessReport = null;
      state.lastExportNormalizeGain = 1;
      state.lastExportLoudnessGain = 1;
      state.isExportingMix = false;
      state.isExportingAssets = false;
      state.isExportQueueRunning = false;
      state.isAnalyzingLoudness = false;
      state.isRenderingVocal = false;
      state.isBatchRendering = false;
      state.isAnalyzingVocal = false;
      state.lastBackupAt = 0;
      state.autosaveDeferred = false;
      state.beatArrayBuffer = null;
      state.beatFileName = "";
      state.beatUrl = "";
      state.markers = getDefaultProjectMarkers();
      state.timelineCursor = 0;
      state.punchEnabled = false;
      state.loopEnabled = false;
      state.metronomeEnabled = false;
      state.punchIn = 0;
      state.punchOut = 4;
      state.recordLatencyMs = 0;
      state.inputGain = 1.25;
      state.beatGain = 1.4;
      state.selectedPresetId = "trap-hard";
      state.armedTrackId = "main";
      state.trackFolderCollapsed = { lead: false, adlibs: false, hook: false };
      state.customScaleIntervals = window.PunchLabPitch.getDefaultCustomScaleIntervals();
      state.isQueuePlaying = false;
      state.queueMode = "all";
      state.queueTakeIds = [];
      state.queueIndex = -1;

      tracks.splice(0, tracks.length, ...window.PunchLabStudioState.createTracks());
      presets.splice(0, presets.length, ...window.PunchLabStudioState.createPresets().map(helpers.normalizePreset));
      actions.clearTimelineHistory();

      els.beatAudio.removeAttribute("src");
      els.beatAudio.load();
      els.beatName.textContent = "MP3, WAV, M4A";
      if (els.beatInput) {
        els.beatInput.value = "";
      }
      if (els.projectInput) {
        els.projectInput.value = "";
      }
      els.downloadLatestButton.disabled = true;

      actions.applyProjectSettings({
        bpm: 140,
        countIn: "0",
        key: "C minor",
        scaleMode: "minor",
        targetMidi: null,
        customScaleIntervals: state.customScaleIntervals,
        inputGain: state.inputGain,
        beatGain: state.beatGain,
        audioInputDeviceId: "",
        audioOutputDeviceId: "",
        nativeBufferSize: 128,
        armedTrackId: state.armedTrackId,
        selectedPresetId: state.selectedPresetId,
        timelineCursor: 0,
        punchEnabled: false,
        loopEnabled: false,
        metronomeEnabled: false,
        recordLatencyMs: 0,
        punchIn: 0,
        punchOut: 4,
      });
      actions.applyPreset("trap-hard");
    }

    function renderCleanProject() {
      actions.renderPresets();
      actions.renderProjectTemplates();
      actions.updateTemplateMeta();
      actions.renderTracks();
      actions.renderArmTracks();
      actions.renderTakes();
      actions.renderVocalPanel();
      actions.renderCompView();
      actions.renderTimeline();
      actions.renderLyrics();
      actions.renderExportPanel();
      actions.renderRecoverySelect();
      actions.updateRecoveryButton();
      actions.updateQueueButton();
      actions.updateExportButtons();
      actions.updateTimelineHistoryButtons();
      actions.updateSelectedRegionControls();
      actions.updatePunchControls();
      els.clock.textContent = helpers.formatDuration(0);
      actions.drawIdleWave();
      if (window.lucide) {
        window.lucide.createIcons();
      }
    }

    function getDefaultProjectMarkers() {
      return helpers.normalizeMarkers([
        { id: "marker-intro", type: "Intro", time: 0 },
        { id: "marker-verse", type: "Verse", time: 16 },
        { id: "marker-hook", type: "Hook", time: 48 },
      ]);
    }

    return {
      newProject,
    };
  }

  window.PunchLabProjectSession = {
    createProjectSession,
  };
})();
