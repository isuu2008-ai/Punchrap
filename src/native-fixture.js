(() => {
  if (!shouldInstallFixture() || window.__PUNCHLAB_NATIVE__) {
    return;
  }

  window.__PUNCHLAB_NATIVE__ = {
    driverId: "native-fixture",
    getCapabilities() {
      return {
        nativeFixture: true,
        offlineMixRender: true,
        vocalRender: true,
        pitchAnalysis: true,
        wavExport: true,
        loudnessAnalysis: true,
        truePeakLimiter: true,
        compressedAudioExport: true,
        realtimeNativeMonitoring: true,
        pluginHost: false,
        sampleRates: [44100, 48000],
        bufferSizes: [64, 128, 256, 512, 1024],
        preferredBufferSize: 128,
        roundTripLatencyMs: 8,
        exclusiveAudioThread: true,
      };
    },
    getDevices() {
      return {
        audioInput: [],
        audioOutput: [],
      };
    },
    getLatencyStats() {
      return {
        inputLatencyMs: 4,
        outputLatencyMs: 4,
        roundTripLatencyMs: 8,
        bufferSize: 128,
        sampleRate: 48000,
      };
    },
    setBufferSize(payload = {}) {
      const requested = Number(payload.bufferSize || payload.size || 128);
      return {
        bufferSize: [64, 128, 256, 512, 1024].includes(requested) ? requested : 128,
        sampleRate: 48000,
      };
    },
    setOutputDevice(payload = {}) {
      return {
        active: true,
        deviceId: payload.deviceId || "",
        fixture: true,
      };
    },
    scanPluginHosts() {
      return {
        formats: ["VST3", "AU"],
        plugins: [],
        scannedAt: new Date().toISOString(),
        fixture: true,
      };
    },
    exportCompressedAudio(payload = {}) {
      return {
        format: payload.format || "mp3",
        mimeType: payload.format === "m4a" ? "audio/mp4" : "audio/mpeg",
        fileName: payload.fileName || `punchlab-export.${payload.format || "mp3"}`,
        dataUrl: payload.wavDataUrl || payload.dataUrl || "",
        fixture: true,
      };
    },
    openProjectFile() {
      return { canceled: true, fixture: true };
    },
    saveProjectFile(payload = {}) {
      return {
        canceled: false,
        fixture: true,
        fileName: payload.suggestedName || "project.punchlab.json",
        bytes: String(payload.data || payload.dataUrl || "").length,
      };
    },
    startInputMonitor() {
      return { active: true, fixture: true };
    },
    stopInputMonitor() {
      return { active: false, fixture: true };
    },
    renderMix(request) {
      return renderFixtureMix(request);
    },
    renderVocal(request) {
      return renderFixtureVocal(request);
    },
  };

  function shouldInstallFixture() {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("nativeFixture") === "0") {
        window.localStorage?.removeItem("punchlab:nativeFixture");
        return false;
      }
      if (params.get("nativeFixture") === "1" || params.has("nativeFixture")) {
        window.localStorage?.setItem("punchlab:nativeFixture", "1");
        return true;
      }
      return window.localStorage?.getItem("punchlab:nativeFixture") === "1";
    } catch {
      return false;
    }
  }

  function renderFixtureMix(request = {}) {
    const sampleRate = getSampleRate(request);
    const beatBuffer = normalizeBufferPayload(request.beatBuffer);
    const takes = Array.isArray(request.takes) ? request.takes : [];
    const length = Math.max(1, beatBuffer.length, getTakeEndSample(takes, sampleRate));
    const output = makeChannels(2, length);

    addBuffer(output, beatBuffer, {
      gain: 1,
      startSample: 0,
      sourceOffset: 0,
      durationSamples: beatBuffer.length,
      pan: 0,
    });

    takes.forEach((take) => {
      const buffer = normalizeBufferPayload(take.buffer);
      const sourceOffset = Math.max(0, Math.round(Number(take.sourceOffset || 0) * sampleRate));
      const durationSamples = Math.max(0, Math.round(Number(take.duration || buffer.duration || 0) * sampleRate));
      addBuffer(output, buffer, {
        gain: Math.max(0, Number(take.volume ?? 1) * Number(take.clipGain ?? 1)),
        startSample: Math.max(0, Math.round(Number(take.startTime || 0) * sampleRate)),
        sourceOffset,
        durationSamples: durationSamples || buffer.length,
        pan: Math.max(-1, Math.min(1, Number(take.pan || 0))),
      });
    });

    return makePayload(output, sampleRate);
  }

  function renderFixtureVocal(request = {}) {
    const source = normalizeBufferPayload(request.sourceBuffer);
    if (!source.length) {
      return makePayload(makeChannels(1, 1), 48000);
    }

    const output = makeChannels(source.numberOfChannels, source.length);
    for (let channel = 0; channel < output.length; channel += 1) {
      const input = source.channels[channel] || source.channels[0] || [];
      for (let index = 0; index < source.length; index += 1) {
        output[channel][index] = clampSample(Number(input[index]) * 0.96);
      }
    }
    return makePayload(output, source.sampleRate);
  }

  function addBuffer(output, source, options) {
    if (!source.length) {
      return;
    }

    const leftGain = options.gain * (options.pan > 0 ? 1 - options.pan * 0.55 : 1);
    const rightGain = options.gain * (options.pan < 0 ? 1 + options.pan * 0.55 : 1);
    const maxSamples = Math.min(options.durationSamples, source.length - options.sourceOffset, output[0].length - options.startSample);
    for (let index = 0; index < maxSamples; index += 1) {
      const outputIndex = options.startSample + index;
      const sourceIndex = options.sourceOffset + index;
      const left = readSample(source, 0, sourceIndex);
      const right = source.numberOfChannels > 1 ? readSample(source, 1, sourceIndex) : left;
      output[0][outputIndex] = clampSample(output[0][outputIndex] + left * leftGain);
      output[1][outputIndex] = clampSample(output[1][outputIndex] + right * rightGain);
    }
  }

  function getTakeEndSample(takes, sampleRate) {
    return takes.reduce((max, take) => {
      const buffer = normalizeBufferPayload(take.buffer);
      const startSample = Math.max(0, Math.round(Number(take.startTime || 0) * sampleRate));
      const durationSamples = Math.max(0, Math.round(Number(take.duration || buffer.duration || 0) * sampleRate)) || buffer.length;
      return Math.max(max, startSample + durationSamples);
    }, 0);
  }

  function normalizeBufferPayload(payload = null) {
    const channels = Array.isArray(payload?.channels) ? payload.channels : [];
    const length = Math.max(0, Number(payload?.length || channels[0]?.length || 0));
    const sampleRate = Math.max(8000, Number(payload?.sampleRate || 48000));
    const numberOfChannels = Math.max(0, Number(payload?.numberOfChannels || channels.length || 0));
    return {
      channels,
      duration: length / sampleRate,
      length,
      numberOfChannels,
      sampleRate,
    };
  }

  function getSampleRate(request) {
    return Math.max(8000, Number(request?.sampleRate || request?.beatBuffer?.sampleRate || 48000));
  }

  function makeChannels(numberOfChannels, length) {
    return Array.from({ length: numberOfChannels }, () => new Float32Array(length));
  }

  function makePayload(channels, sampleRate) {
    return {
      channels: channels.map((channel) => Array.from(channel)),
      duration: channels[0].length / sampleRate,
      length: channels[0].length,
      numberOfChannels: channels.length,
      sampleRate,
    };
  }

  function readSample(source, channel, index) {
    return Number(source.channels[channel]?.[index]) || 0;
  }

  function clampSample(sample) {
    return Math.max(-1, Math.min(1, sample));
  }
})();
