(() => {
  function normalizeTimelineSnapMode(value) {
    return ["off", "beat", "bar"].includes(value) ? value : "off";
  }

  function getBeatDuration(bpm = 140) {
    return 60 / (Number(bpm) || 140);
  }

  function makeTimelineTicks({ end = 16, surfaceWidth = 800 } = {}) {
    const safeEnd = Math.max(1, Number(end) || 16);
    const safeWidth = Math.max(1, Number(surfaceWidth) || 800);
    const minTickWidth = safeWidth < 520 ? 92 : 64;
    const targetTickCount = Math.max(2, Math.floor(safeWidth / minTickWidth));
    const rawStep = safeEnd / targetTickCount;
    const step = getTimelineTickStep(rawStep);
    const ticks = [];
    for (let time = 0; time <= safeEnd; time += step) {
      ticks.push(time);
    }
    return ticks;
  }

  function getTimelineTickStep(rawStep = 1) {
    return [1, 2, 5, 10, 15, 30, 60, 120].find((step) => step >= rawStep) || 240;
  }

  function makeTimelineGridLines({ end = 16, bpm = 140, maxLines = 192 } = {}) {
    const safeEnd = Math.max(1, Number(end) || 16);
    const beatDuration = getBeatDuration(bpm);
    const beatCount = Math.min(Math.max(1, Number(maxLines) || 192), Math.ceil(safeEnd / beatDuration) + 1);
    const lines = [];

    for (let beat = 0; beat < beatCount; beat += 1) {
      const time = beat * beatDuration;
      if (time > safeEnd + 0.001) {
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

  function timelinePercent(value = 0, end = 1) {
    return Math.max(0, Math.min(100, (Number(value || 0) / Math.max(1, Number(end) || 1)) * 100));
  }

  function getTimelineSnapStep({ mode = "off", bpm = 140 } = {}) {
    const snapMode = normalizeTimelineSnapMode(mode);
    if (snapMode === "off") {
      return 0;
    }

    return getBeatDuration(bpm) * (snapMode === "bar" ? 4 : 1);
  }

  function snapTimelineTime({ value = 0, mode = "off", bpm = 140 } = {}) {
    const safeValue = Math.max(0, Number(value) || 0);
    const step = getTimelineSnapStep({ mode, bpm });
    if (!step) {
      return safeValue;
    }

    return Math.max(0, Math.round(safeValue / step) * step);
  }

  function nudgeTimelineTime({ value = 0, delta = 0, mode = "off", bpm = 140 } = {}) {
    const safeValue = Math.max(0, Number(value) || 0);
    const step = getTimelineSnapStep({ mode, bpm });
    const safeDelta = Number(delta) || 0;
    if (!step) {
      return Math.max(0, safeValue + safeDelta);
    }

    if (safeDelta > 0) {
      return Math.ceil((safeValue + 0.0001) / step) * step;
    }

    return Math.max(0, Math.floor((safeValue - 0.0001) / step) * step);
  }

  function snapToInputPrecision(value) {
    return Number(Math.max(0, Number(value) || 0).toFixed(3));
  }

  function normalizeMarkers(markers = [], createId = null) {
    const makeId = typeof createId === "function" ? createId : () => crypto.randomUUID();
    return (Array.isArray(markers) ? markers : [])
      .map((marker) => ({
        id: marker.id || makeId(),
        type: marker.type || "Marker",
        time: Math.max(0, Number(marker.time) || 0),
        lyrics: String(marker.lyrics || ""),
        comment: String(marker.comment || ""),
      }))
      .sort((a, b) => a.time - b.time);
  }

  window.PunchLabTimeline = {
    getBeatDuration,
    getTimelineSnapStep,
    getTimelineTickStep,
    makeTimelineGridLines,
    makeTimelineTicks,
    normalizeMarkers,
    normalizeTimelineSnapMode,
    nudgeTimelineTime,
    snapTimelineTime,
    snapToInputPrecision,
    timelinePercent,
  };
})();
