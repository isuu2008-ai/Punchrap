(() => {
  function normalizeTimelineSnapMode(value) {
    return ["off", "beat", "bar"].includes(value) ? value : "off";
  }

  function getBeatDuration(bpm = 140) {
    return 60 / (Number(bpm) || 140);
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
    normalizeMarkers,
    normalizeTimelineSnapMode,
    nudgeTimelineTime,
    snapTimelineTime,
    snapToInputPrecision,
  };
})();
