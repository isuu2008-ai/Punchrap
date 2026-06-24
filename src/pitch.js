(() => {
  const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const DEFAULT_CUSTOM_SCALE_INTERVALS = [0, 2, 3, 5, 7, 8, 10];

  function positiveModulo(value, divisor) {
    return ((value % divisor) + divisor) % divisor;
  }

  function getDefaultCustomScaleIntervals() {
    return [...DEFAULT_CUSTOM_SCALE_INTERVALS];
  }

  function normalizeScaleIntervals(intervals) {
    const source = Array.isArray(intervals) ? intervals : DEFAULT_CUSTOM_SCALE_INTERVALS;
    const normalized = [...new Set(
      source
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value))
        .map((value) => positiveModulo(Math.round(value), 12)),
    )].sort((left, right) => left - right);

    return normalized.length ? normalized : getDefaultCustomScaleIntervals();
  }

  function getKeyRootClass(keyValue, noteNames = NOTE_NAMES) {
    const rootName = String(keyValue || "C minor").split(" ")[0];
    const root = noteNames.indexOf(rootName);
    return root >= 0 ? root : 0;
  }

  function getScaleNoteName(root, interval, noteNames = NOTE_NAMES) {
    return noteNames[positiveModulo(Number(root) + Number(interval), 12)] || "C";
  }

  function getTargetMidiValue(rawValue) {
    if (rawValue === "") {
      return null;
    }

    const value = Number(rawValue);
    return Number.isFinite(value) ? value : null;
  }

  function formatPitchNote(midi, formatMidiNote = null) {
    const value = Number(midi);
    if (!Number.isFinite(value)) {
      return "--";
    }

    if (typeof formatMidiNote === "function") {
      return formatMidiNote(value);
    }

    const rounded = Math.round(value);
    const note = NOTE_NAMES[positiveModulo(rounded, 12)];
    const octave = Math.floor(rounded / 12) - 1;
    return `${note}${octave}`;
  }

  function getPitchModeLabel({ targetMidi = null, scaleMode = "minor", key = "C minor", formatMidiNote = null } = {}) {
    if (targetMidi !== null) {
      return `MIDI ${formatPitchNote(targetMidi, formatMidiNote)}`;
    }

    if (scaleMode === "chromatic") {
      return "Chromatic";
    }

    if (scaleMode === "custom") {
      return "Custom";
    }

    return key;
  }

  function getPitchFrameKey(frame = {}) {
    return String(Math.round(frame.start || 0));
  }

  function applyManualPitchTargets(plan = {}, take = null) {
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

  function getPitchLaneFrames(frames = [], limit = 18) {
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

  function getManualPitchCount(take) {
    return Object.values(take?.manualPitchTargets || {}).filter((value) => Number.isFinite(Number(value))).length;
  }

  function getAverageCorrection(frames = []) {
    const corrected = frames.filter((frame) => Number.isFinite(frame.correctionSemitones));
    if (!corrected.length) {
      return 0;
    }

    return corrected.reduce((sum, frame) => sum + frame.correctionSemitones, 0) / corrected.length;
  }

  function clampMidi(midi) {
    return Math.min(127, Math.max(0, Number(midi)));
  }

  window.PunchLabPitch = {
    DEFAULT_CUSTOM_SCALE_INTERVALS,
    applyManualPitchTargets,
    clampMidi,
    formatPitchNote,
    getAverageCorrection,
    getDefaultCustomScaleIntervals,
    getKeyRootClass,
    getManualPitchCount,
    getPitchFrameKey,
    getPitchLaneFrames,
    getPitchModeLabel,
    getScaleNoteName,
    getTargetMidiValue,
    normalizeScaleIntervals,
  };
})();
