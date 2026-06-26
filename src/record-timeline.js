(() => {
  function requireValue(deps, name) {
    const value = deps[name];
    if (!value) {
      throw new Error(`PunchLab record timeline dependency missing: ${name}`);
    }
    return value;
  }

  function requireHelper(deps, name) {
    const helper = deps[name];
    if (typeof helper !== "function") {
      throw new Error(`PunchLab record timeline helper missing: ${name}`);
    }
    return helper;
  }

  function createRecordTimeline(deps = {}) {
    const els = requireValue(deps, "els");
    const state = requireValue(deps, "state");
    const helpers = deps.helpers || {};
    const escapeHtml = requireHelper(helpers, "escapeHtml");
    const formatDuration = requireHelper(helpers, "formatDuration");
    const getAllTakes = requireHelper(helpers, "getAllTakes");
    const getTakeRegionColor = requireHelper(helpers, "getTakeRegionColor");
    const getTakeShortName = requireHelper(helpers, "getTakeShortName");
    const getTakeVisibleDuration = requireHelper(helpers, "getTakeVisibleDuration");
    const getTimelineCursorPosition = requireHelper(helpers, "getTimelineCursorPosition");
    const getTimelineEndPosition = requireHelper(helpers, "getTimelineEndPosition");
    const makeTimelineTicks = requireHelper(helpers, "makeTimelineTicks");
    const timelinePercent = requireHelper(helpers, "timelinePercent");

    function renderRecordTimeline() {
      if (!els.recordTimelineSurface) {
        return;
      }

      const timelineEnd = getTimelineEndPosition();
      const takes = getAllTakes();
      const beatDuration = els.beatAudio.src && Number.isFinite(els.beatAudio.duration) ? els.beatAudio.duration : 0;

      els.recordTimelineLength.textContent = formatDuration(timelineEnd);
      els.recordTimelineRuler.innerHTML = makeTimelineTicks(timelineEnd)
        .map(
          (tick) => `
        <span class="timeline-tick" style="left: ${timelinePercent(tick, timelineEnd)}%">
          <span>${formatDuration(tick)}</span>
        </span>
      `,
        )
        .join("");

      els.recordTimelineRegions.innerHTML = renderBeatRegion(beatDuration, timelineEnd) + renderTakeRegions(takes, timelineEnd);
      renderRecordTimelineCursor(timelineEnd, getTimelineCursorPosition());
      renderRecordTimelineRecordingPreview(timelineEnd);
    }

    function renderBeatRegion(beatDuration, timelineEnd) {
      return beatDuration
        ? `
      <div class="record-timeline-region record-beat-region" style="left: 0%; width: ${timelinePercent(beatDuration, timelineEnd)}%; --track-color: var(--lime);">
        <strong>${escapeHtml(state.beatFileName || "Beat")}</strong>
      </div>
    `
        : "";
    }

    function renderTakeRegions(takes, timelineEnd) {
      return takes
        .slice(-10)
        .map((take, index) => {
          const left = timelinePercent(take.startTime || 0, timelineEnd);
          const width = Math.max(1.4, timelinePercent(getTakeVisibleDuration(take) || 0.2, timelineEnd));
          const top = 30 + (index % 2) * 28;
          return `
        <div class="record-timeline-region record-take-region" style="left: ${left}%; width: ${width}%; top: ${top}px; --track-color: ${getTakeRegionColor(take)};">
          <strong>${escapeHtml(getTakeShortName(take))}</strong>
        </div>
      `;
        })
        .join("");
    }

    function renderRecordTimelineCursor(timelineEnd = getTimelineEndPosition(), position = getTimelineCursorPosition()) {
      const cursor = Math.max(0, Number(position) || 0);
      if (els.recordTimelinePlayhead) {
        els.recordTimelinePlayhead.style.left = `${timelinePercent(cursor, timelineEnd)}%`;
      }
      if (els.recordTimelineCursorText) {
        els.recordTimelineCursorText.textContent = formatDuration(cursor);
      }
      updateRecordTimelineButtons();
      renderRecordTimelineRecordingPreview(timelineEnd);
    }

    function renderRecordTimelineRecordingPreview(timelineEnd = getTimelineEndPosition()) {
      if (!els.recordTimelineRecordingPreview) {
        return;
      }

      if (!state.isRecording) {
        els.recordTimelineRecordingPreview.hidden = true;
        els.recordTimelineRecordingPreview.style.width = "0%";
        return;
      }

      const start = Math.max(0, Number(state.recordStartPosition) || 0);
      const current = start + Math.max(0, (performance.now() - state.recordStart) / 1000);
      const width = Math.max(0.8, timelinePercent(current - start, timelineEnd));
      const track = (deps.tracks || []).find((item) => item.id === state.armedTrackId);
      els.recordTimelineRecordingPreview.hidden = false;
      els.recordTimelineRecordingPreview.style.left = `${timelinePercent(start, timelineEnd)}%`;
      els.recordTimelineRecordingPreview.style.width = `${width}%`;
      els.recordTimelineRecordingPreview.style.setProperty("--track-color", track?.color || "#ff4f64");
      els.recordTimelineRecordingPreview.textContent = `${track?.name || "Recording"} ${formatDuration(current - start)}`;
    }

    function updateRecordTimelineButtons() {
      if (els.recordTimelinePlayButton) {
        els.recordTimelinePlayButton.classList.toggle("session-active", state.isSessionPlaying);
      }
      if (!els.recordTimelineRecordButton) {
        return;
      }

      const isActive = state.isRecording || state.isPunchWaiting;
      els.recordTimelineRecordButton.classList.toggle("active", isActive);
      const label = els.recordTimelineRecordButton.querySelector(".button-label");
      if (label) {
        label.textContent = state.isRecording ? "Stop" : state.isPunchWaiting ? "Cancel" : "Record";
      }
    }

    return {
      renderRecordTimeline,
      renderRecordTimelineCursor,
      updateRecordTimelineButtons,
    };
  }

  window.PunchLabRecordTimeline = {
    createRecordTimeline,
  };
})();
