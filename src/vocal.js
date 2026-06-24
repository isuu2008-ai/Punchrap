(() => {
  async function decodeTakeBuffer(take, sampleRate = 48000) {
    const decodeContext = new OfflineAudioContext(2, 1, sampleRate);
    return decodeContext.decodeAudioData(await take.blob.arrayBuffer());
  }

  async function analyzeTakePitch(take) {
    const sourceBuffer = await decodeTakeBuffer(take);
    return {
      sourceBuffer,
      pitchAnalysis: window.PunchLabDSP.analyzePitchBuffer(sourceBuffer),
    };
  }

  async function renderProcessedVocal({ sourceTake, sourceBuffer = null, preset, tuneSettings, pitchPlan, waveformLength = 240 }) {
    sourceBuffer ||= await decodeTakeBuffer(sourceTake);
    const renderPreset = getEffectivePreset(preset, tuneSettings);
    const renderedBuffer = await window.PunchLabDSP.renderVocalBuffer(sourceBuffer, renderPreset, pitchPlan, tuneSettings);
    const safeBuffer = window.PunchLabAudio.applyTruePeakCeiling(renderedBuffer, renderPreset.limiterCeiling);
    const pitchAnalysis = window.PunchLabDSP.analyzePitchBuffer(safeBuffer);
    const blob = window.PunchLabAudio.encodeWav(safeBuffer);

    return {
      blob,
      duration: safeBuffer.duration,
      pitchAnalysis,
      renderPreset,
      waveform: makeWaveformFromAudioBuffer(safeBuffer, waveformLength),
    };
  }

  function getEffectivePreset(preset, tuneSettings = {}) {
    return {
      ...preset,
      vibrato: Number(tuneSettings.vibrato ?? preset.vibrato ?? 55),
      comp: Number(tuneSettings.comp ?? preset.comp),
      compThreshold: Number(tuneSettings.compThreshold ?? preset.compThreshold ?? -30),
      compRatio: Number(tuneSettings.compRatio ?? preset.compRatio ?? 6),
      compAttack: Number(tuneSettings.compAttack ?? preset.compAttack ?? 4),
      compRelease: Number(tuneSettings.compRelease ?? preset.compRelease ?? 140),
      saturation: Number(tuneSettings.saturation ?? preset.saturation ?? 35),
      space: Number(tuneSettings.space ?? preset.space),
      delay: Number(tuneSettings.delay ?? preset.delay ?? preset.space),
      reverb: Number(tuneSettings.reverb ?? preset.reverb ?? Math.round(Number(preset.space ?? 12) * 0.65)),
      width: Number(tuneSettings.width ?? preset.width),
      lowEq: Number(tuneSettings.lowEq ?? preset.lowEq ?? 0),
      midEq: Number(tuneSettings.midEq ?? preset.midEq ?? 0),
      airEq: Number(tuneSettings.airEq ?? preset.airEq ?? 0),
      limiterCeiling: Number(tuneSettings.limiterCeiling ?? preset.limiterCeiling ?? -3),
    };
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

  window.PunchLabVocal = {
    analyzeTakePitch,
    decodeTakeBuffer,
    getEffectivePreset,
    renderProcessedVocal,
  };
})();
