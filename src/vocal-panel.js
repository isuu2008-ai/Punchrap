(() => {
  function requireValue(deps, name) {
    const value = deps[name];
    if (!value) {
      throw new Error(`PunchLab vocal panel dependency missing: ${name}`);
    }
    return value;
  }

  function requireFunction(deps, name, type = "dependency") {
    const value = deps[name];
    if (typeof value !== "function") {
      throw new Error(`PunchLab vocal panel ${type} missing: ${name}`);
    }
    return value;
  }

  function createVocalPanel(deps = {}) {
    const els = requireValue(deps, "els");
    const state = requireValue(deps, "state");
    const actions = deps.actions || {};
    const helpers = deps.helpers || {};
    const deleteVocalVersion = requireFunction(actions, "deleteVocalVersion", "action");
    const playVocalVersion = requireFunction(actions, "playVocalVersion", "action");
    const selectVocalVersion = requireFunction(actions, "selectVocalVersion", "action");
    const toggleBestTake = requireFunction(actions, "toggleBestTake", "action");
    const toggleCompTake = requireFunction(actions, "toggleCompTake", "action");
    const escapeHtml = requireFunction(helpers, "escapeHtml", "helper");
    const findTake = requireFunction(helpers, "findTake", "helper");
    const formatDuration = requireFunction(helpers, "formatDuration", "helper");
    const formatSemitones = requireFunction(helpers, "formatSemitones", "helper");
    const getAllTakes = requireFunction(helpers, "getAllTakes", "helper");
    const getAverageCorrection = requireFunction(helpers, "getAverageCorrection", "helper");
    const getBatchScopeEmptyText = requireFunction(helpers, "getBatchScopeEmptyText", "helper");
    const getBatchScopeReadyText = requireFunction(helpers, "getBatchScopeReadyText", "helper");
    const getBatchSourceTargets = requireFunction(helpers, "getBatchSourceTargets", "helper");
    const getBatchTargets = requireFunction(helpers, "getBatchTargets", "helper");
    const getComparisonPair = requireFunction(helpers, "getComparisonPair", "helper");
    const getKeyRootClass = requireFunction(helpers, "getKeyRootClass", "helper");
    const getManualPitchCount = requireFunction(helpers, "getManualPitchCount", "helper");
    const getPitchLaneFrames = requireFunction(helpers, "getPitchLaneFrames", "helper");
    const getPitchModeLabel = requireFunction(helpers, "getPitchModeLabel", "helper");
    const getPitchPlan = requireFunction(helpers, "getPitchPlan", "helper");
    const getProcessedVersionsForSource = requireFunction(helpers, "getProcessedVersionsForSource", "helper");
    const getScaleNoteName = requireFunction(helpers, "getScaleNoteName", "helper");
    const getSelectedPreset = requireFunction(helpers, "getSelectedPreset", "helper");
    const getSelectedVocalTake = requireFunction(helpers, "getSelectedVocalTake", "helper");
    const getTakeShortName = requireFunction(helpers, "getTakeShortName", "helper");
    const getTakeTitle = requireFunction(helpers, "getTakeTitle", "helper");
    const getTuneSignature = requireFunction(helpers, "getTuneSignature", "helper");
    const isVocalBusy = requireFunction(helpers, "isVocalBusy", "helper");
    const makeTakeFilename = requireFunction(helpers, "makeTakeFilename", "helper");
    const normalizeScaleIntervals = requireFunction(helpers, "normalizeScaleIntervals", "helper");
    const renderPitchLaneFrame = requireFunction(helpers, "renderPitchLaneFrame", "helper");

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
      const vocalBusy = isVocalBusy();
      els.versionStatus.textContent = versions.length ? `${versions.length} version(s)` : "No renders";
      els.versionList.innerHTML = versions.length
        ? versions.map((versionTake) => renderVersionRow(versionTake, vocalBusy)).join("")
        : `<span class="empty-takes">${escapeHtml(sourceTake ? getTakeShortName(sourceTake) : "Selected take")} has no tuned versions yet.</span>`;

      bindVersionActions();
    }

    function renderVersionRow(versionTake, vocalBusy) {
      const isSelected = versionTake.id === state.selectedVocalTakeId;
      const isPlaying = versionTake.id === state.currentTakeId || state.sessionPlayingTakeIds.has(versionTake.id);
      const isBest = Boolean(versionTake.bestTake);
      const isComp = Boolean(versionTake.compSelected);
      return `
          <div class="version-row ${isSelected ? "selected" : ""} ${isPlaying ? "active" : ""}">
            <button class="version-main" type="button" data-select-version="${versionTake.id}" ${vocalBusy ? "disabled" : ""}>
              <strong>${escapeHtml(versionTake.renderLabel || `${versionTake.presetName || "Processed"} v${versionTake.version || 1}`)}</strong>
              <span>${escapeHtml(formatDuration(versionTake.duration))}</span>
              <small>${escapeHtml(getTuneSignature(versionTake.tuneSettings))}</small>
            </button>
            <div class="version-actions">
              <button class="mini-button ${isPlaying ? "active" : ""}" type="button" data-play-version="${versionTake.id}" ${vocalBusy ? "disabled" : ""}>
                ${isPlaying ? "Pause" : "Play"}
              </button>
              <button class="mini-button ${isBest ? "active" : ""}" type="button" data-best-version="${versionTake.id}" ${vocalBusy ? "disabled" : ""}>Best</button>
              <button class="mini-button ${isComp ? "active" : ""}" type="button" data-comp-version="${versionTake.id}" ${vocalBusy ? "disabled" : ""}>Comp</button>
              <a class="mini-button" href="${versionTake.url}" download="${makeTakeFilename(versionTake)}">Save</a>
              <button class="mini-button danger" type="button" data-delete-version="${versionTake.id}" ${vocalBusy ? "disabled" : ""}>Del</button>
            </div>
          </div>
        `;
    }

    function bindVersionActions() {
      els.versionList.querySelectorAll("[data-select-version]").forEach((button) => {
        button.addEventListener("click", () => selectVocalVersion(button.dataset.selectVersion));
      });
      els.versionList.querySelectorAll("[data-play-version]").forEach((button) => {
        button.addEventListener("click", () => playVocalVersion(button.dataset.playVersion));
      });
      els.versionList.querySelectorAll("[data-best-version]").forEach((button) => {
        button.addEventListener("click", () => toggleBestTake(button.dataset.bestVersion));
      });
      els.versionList.querySelectorAll("[data-comp-version]").forEach((button) => {
        button.addEventListener("click", () => toggleCompTake(button.dataset.compVersion));
      });
      els.versionList.querySelectorAll("[data-delete-version]").forEach((button) => {
        button.addEventListener("click", () => deleteVocalVersion(button.dataset.deleteVersion));
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
        const noteName = getScaleNoteName(root, interval);
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

    return {
      renderVocalPanel,
    };
  }

  window.PunchLabVocalPanel = {
    createVocalPanel,
  };
})();
