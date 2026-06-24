(() => {
  const DEFAULT_TARGET_LUFS = -14;
  const DEFAULT_CEILING_DB = -1;

  function finalizeAudio(audioBuffer, options = {}) {
    if (!audioBuffer?.getChannelData) {
      throw new Error("Export mastering requires an AudioBuffer.");
    }

    const loudnessResult = applyLoudnessNormalize(audioBuffer, options);
    const peakResult = applyPeakNormalize(loudnessResult.audioBuffer, options);
    const limitedBuffer = applyTruePeakCeiling(peakResult.audioBuffer, options);

    return {
      audioBuffer: limitedBuffer,
      loudnessGain: loudnessResult.gain,
      loudnessGainDb: gainToDb(loudnessResult.gain),
      loudnessReport: loudnessResult.report,
      normalizeGain: peakResult.gain,
      normalizeGainDb: gainToDb(peakResult.gain),
      targetLufs: getTargetLufs(options),
      ceilingDb: getCeilingDb(options),
    };
  }

  function applyLoudnessNormalize(audioBuffer, options) {
    if (!options.loudnessNormalize) {
      return { audioBuffer, gain: 1, report: null };
    }

    const analyzer = getAnalyzer(options);
    if (typeof analyzer !== "function") {
      return { audioBuffer, gain: 1, report: null };
    }

    const report = analyzer(audioBuffer);
    const targetLufs = getTargetLufs(options);
    const measuredLufs = Number(report?.integratedLufs);
    const recommendedGainDb = Number.isFinite(Number(report?.recommendedGainDb))
      ? Number(report.recommendedGainDb)
      : Number.isFinite(measuredLufs) ? targetLufs - measuredLufs : 0;
    const gainDb = clamp(recommendedGainDb, -18, 18);
    const gain = dbToGain(gainDb);
    return { audioBuffer: applyBufferGain(audioBuffer, gain), gain, report };
  }

  function applyPeakNormalize(audioBuffer, options) {
    if (!options.peakNormalize) {
      return { audioBuffer, gain: 1 };
    }

    const peak = getAudioBufferPeak(audioBuffer);
    if (peak <= 0.000001) {
      return { audioBuffer, gain: 1 };
    }

    const targetPeak = dbToGain(getCeilingDb(options));
    const gain = targetPeak / peak;
    return { audioBuffer: applyBufferGain(audioBuffer, gain), gain };
  }

  function applyTruePeakCeiling(audioBuffer, options) {
    const limiter = options.truePeakLimiter || window.PunchLabEngine?.applyTruePeakCeiling || window.PunchLabAudio?.applyTruePeakCeiling;
    return typeof limiter === "function" ? limiter(audioBuffer, getCeilingDb(options)) : audioBuffer;
  }

  function applyBufferGain(audioBuffer, gain) {
    if (!Number.isFinite(gain) || Math.abs(gain - 1) < 0.000001) {
      return audioBuffer;
    }

    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel += 1) {
      const data = audioBuffer.getChannelData(channel);
      for (let index = 0; index < data.length; index += 1) {
        data[index] *= gain;
      }
    }
    return audioBuffer;
  }

  function getAudioBufferPeak(audioBuffer) {
    let peak = 0;
    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel += 1) {
      const data = audioBuffer.getChannelData(channel);
      for (let index = 0; index < data.length; index += 1) {
        peak = Math.max(peak, Math.abs(data[index]));
      }
    }
    return peak;
  }

  function getAnalyzer(options) {
    return options.analyzer || window.PunchLabEngine?.analyzeLoudness || window.PunchLabAudio?.analyzeLoudness || null;
  }

  function getTargetLufs(options) {
    const target = Number(options.targetLufs);
    return Number.isFinite(target) ? target : DEFAULT_TARGET_LUFS;
  }

  function getCeilingDb(options) {
    const ceiling = Number(options.ceilingDb);
    return Number.isFinite(ceiling) ? Math.min(0, ceiling) : DEFAULT_CEILING_DB;
  }

  function dbToGain(db) {
    return Math.pow(10, db / 20);
  }

  function gainToDb(gain) {
    return gain > 0 ? 20 * Math.log10(gain) : Number.NEGATIVE_INFINITY;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, Number(value) || 0));
  }

  window.PunchLabExportMastering = {
    finalizeAudio,
    getAudioBufferPeak,
  };
})();
