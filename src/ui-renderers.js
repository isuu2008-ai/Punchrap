(() => {
  function requireHelper(deps, name, fallback) {
    const helper = deps[name] || fallback;
    if (typeof helper !== "function") {
      throw new Error(`PunchLab UI renderer helper missing: ${name}`);
    }
    return helper;
  }

  function createRenderers(deps = {}) {
    const escapeHtml = requireHelper(deps, "escapeHtml", window.PunchLabFormat?.escapeHtml);
    const formatDuration = requireHelper(deps, "formatDuration", window.PunchLabFormat?.formatDuration);
    const formatPitchNote = requireHelper(
      deps,
      "formatPitchNote",
      (midi) => window.PunchLabPitch.formatPitchNote(midi, window.PunchLabDSP.formatMidiNote),
    );
    const getPitchFrameKey = requireHelper(deps, "getPitchFrameKey", window.PunchLabPitch?.getPitchFrameKey);
    const getTakeTitle = requireHelper(deps, "getTakeTitle", window.PunchLabTakes?.getTakeTitle);
    const getTakeSubtitle = requireHelper(deps, "getTakeSubtitle");
    const downsampleWaveform = requireHelper(deps, "downsampleWaveform");

    function renderRegionGroupOptions(selectedGroup) {
      return window.PunchLabTimeline.getRegionGroups().map(
        (group) => `<option value="${group.id}" ${group.id === selectedGroup ? "selected" : ""}>${group.label}</option>`,
      ).join("");
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

    return {
      renderRegionGroupOptions,
      renderCompPoolRow,
      renderAudioDeviceSelect,
      renderPitchLaneFrame,
      renderTakeWaveform,
    };
  }

  window.PunchLabUIRenderers = {
    createRenderers,
  };
})();
