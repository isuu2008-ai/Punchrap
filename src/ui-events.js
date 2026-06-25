(() => {
  function requireValue(deps, name) {
    const value = deps[name];
    if (!value) {
      throw new Error(`PunchLab UI events dependency missing: ${name}`);
    }
    return value;
  }

  function on(element, eventName, handler) {
    if (!element) {
      return;
    }
    if (typeof handler !== "function") {
      throw new Error(`PunchLab UI event handler missing for ${eventName}`);
    }
    element.addEventListener(eventName, handler);
  }

  function onEach(elements, eventName, handler) {
    Array.from(elements || []).forEach((element) => on(element, eventName, handler));
  }

  function createEvents(deps = {}) {
    const els = requireValue(deps, "els");
    const state = requireValue(deps, "state");
    const actions = requireValue(deps, "actions");

    function bindRefreshVocalControl(elementName) {
      on(els[elementName], "change", () => {
        actions.renderVocalPanel();
        actions.scheduleAutosave();
      });
    }

    function bindTuneControl(elementName, beforeUpdate = null) {
      on(els[elementName], "input", () => {
        beforeUpdate?.();
        actions.updateTuneControls();
        actions.scheduleAutosave();
      });
    }

    function bindEvents() {
      onEach(els.viewTabs, "click", (event) => actions.setActiveView(event.currentTarget.dataset.view));
      on(els.micButton, "click", actions.enableMic);
      on(els.monitorButton, "click", actions.toggleInputMonitor);
      on(els.playButton, "click", actions.toggleSessionPlayback);
      on(els.stopButton, "click", actions.stopAll);
      on(els.recordButton, "click", actions.toggleRecord);
      on(els.pluginScanStatus, "click", actions.scanPluginHosts);
      on(els.nativeLatencyRefreshButton, "click", actions.refreshNativeLatencyStats);
      on(els.beatInput, "change", actions.loadBeat);
      on(els.bpmInput, "input", actions.updateTempoSettings);
      on(els.countInSelect, "change", actions.scheduleAutosave);
      on(els.templateSelect, "change", actions.updateTemplateMeta);
      on(els.applyTemplateButton, "click", actions.applySelectedTemplate);
      on(els.inputGainSlider, "input", actions.updateInputGain);
      on(els.audioInputSelect, "change", actions.changeAudioInputDevice);
      on(els.audioOutputSelect, "change", actions.changeAudioOutputDevice);
      on(els.nativeBufferSizeSelect, "change", actions.changeNativeBufferSize);
      on(els.punchToggle, "click", actions.togglePunchMode);
      on(els.loopToggle, "click", actions.toggleLoopMode);
      on(els.metronomeToggle, "click", actions.toggleMetronome);
      on(els.punchInInput, "input", actions.updatePunchFromInputs);
      on(els.punchOutInput, "input", actions.updatePunchFromInputs);
      on(els.recordLatencyInput, "input", actions.updateRecordLatency);

      bindRefreshVocalControl("keySelect");
      bindRefreshVocalControl("scaleModeSelect");
      bindRefreshVocalControl("targetMidiSelect");

      on(els.setPunchInButton, "click", () => actions.setPunchPoint("in"));
      on(els.setPunchOutButton, "click", () => actions.setPunchPoint("out"));
      on(els.beatAudio, "timeupdate", actions.maintainLoopPlayback);
      on(els.playQueueButton, "click", () => actions.toggleTakeQueue("all"));
      on(els.playCompButton, "click", () => actions.toggleTakeQueue("comp"));
      on(els.compPlayButton, "click", () => actions.toggleTakeQueue("comp"));
      on(els.compClearButton, "click", actions.clearCompLane);
      on(els.compBestButton, "click", actions.addBestTakesToComp);
      on(els.exportMixButton, "click", actions.exportFullMix);
      on(els.playLatestTakeButton, "click", actions.playLatestTake);
      on(els.sendLatestToVocalButton, "click", actions.sendLatestTakeToVocal);
      on(els.downloadLatestButton, "click", actions.downloadLatestTake);

      for (const elementName of [
        "retuneSpeedSlider",
        "humanizeSlider",
        "vibratoSlider",
        "formantSlider",
        "gateSlider",
        "deEssSlider",
        "compThresholdSlider",
        "compRatioSlider",
        "compAttackSlider",
        "compReleaseSlider",
        "saturationSlider",
        "spaceSlider",
        "delaySlider",
        "reverbSlider",
        "widthSlider",
        "lowEqSlider",
        "midEqSlider",
        "airEqSlider",
        "limiterCeilingSlider",
      ]) {
        bindTuneControl(elementName);
      }
      bindTuneControl("compSlider", actions.syncCompDetailDefaults);

      on(els.vocalTakeSelect, "change", () => {
        state.selectedVocalTakeId = els.vocalTakeSelect.value || null;
        actions.renderVocalPanel();
      });
      on(els.previewVocalButton, "click", actions.previewSelectedVocalTake);
      on(els.analyzeVocalButton, "click", actions.analyzeSelectedVocalTake);
      on(els.renderVocalButton, "click", actions.renderSelectedVocalTake);
      on(els.compareSourceButton, "click", () => actions.playComparisonTake("source"));
      on(els.compareProcessedButton, "click", () => actions.playComparisonTake("processed"));
      on(els.pitchLane, "click", actions.handlePitchLaneClick);
      on(els.resetPitchLaneButton, "click", actions.clearManualPitchLane);
      on(els.customScaleGrid, "click", actions.handleCustomScaleClick);
      on(els.batchScopeSelect, "change", actions.renderVocalPanel);
      on(els.batchSkipRenderedInput, "change", actions.renderVocalPanel);
      on(els.batchRenderButton, "click", actions.renderBatchVocalTakes);
      on(els.saveProjectButton, "click", actions.saveProject);
      on(els.saveProjectZipButton, "click", actions.saveProjectZip);
      on(els.openProjectButton, "click", actions.openProject);
      on(els.projectInput, "change", actions.loadProject);
      on(els.recoverProjectButton, "click", actions.recoverAutosave);
      on(els.recoverySelect, "change", actions.updateRecoveryButton);
      on(els.addMarkerButton, "click", actions.addTimelineMarker);
      on(els.timelineSnapSelect, "change", actions.updateTimelineSnapMode);
      on(els.timelineUndoButton, "click", actions.undoTimelineEdit);
      on(els.timelineRedoButton, "click", actions.redoTimelineEdit);
      on(els.exportStemsButton, "click", actions.exportTrackStems);
      on(els.exportBeatStemButton, "click", actions.exportBeatStem);
      on(els.exportVocalStemButton, "click", actions.exportVocalStem);
      on(els.exportCompVocalButton, "click", actions.exportCompVocal);
      on(els.exportDryVocalsButton, "click", actions.exportDryVocals);
      on(els.exportTunedVocalsButton, "click", actions.exportTunedVocals);
      on(els.analyzeLoudnessButton, "click", actions.analyzeLoudness);
      on(els.exportArtistInput, "input", actions.updateExportMetadata);
      on(els.exportTitleInput, "input", actions.updateExportMetadata);
      on(els.exportBitDepthSelect, "change", actions.updateExportMetadata);
      on(els.exportNormalizeInput, "change", actions.updateExportMetadata);
      on(els.exportLoudnessNormalizeInput, "change", actions.updateExportMetadata);
      on(els.lyricsInput, "input", actions.updateProjectLyrics);
      on(els.sessionNotesInput, "input", actions.updateProjectNotes);
      on(els.updateCustomPresetButton, "click", actions.updateCustomPreset);
      on(els.saveCustomPresetButton, "click", actions.saveCustomPreset);
    }

    return {
      bindEvents,
    };
  }

  window.PunchLabUIEvents = {
    createEvents,
  };
})();
