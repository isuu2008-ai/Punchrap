(() => {
  function installNativeEngine() {
    const bridge = window.PunchLabNativeBridge;
    const status = bridge?.getStatus?.();
    if (!bridge || !status?.available) {
      return null;
    }

    const nativeEngine = {
      capabilities: window.PunchLabEngineContract?.mergeNativeCapabilities?.({}) || { realtimeNativeMonitoring: true },
      async refreshCapabilities() {
        const capabilities = await bridge.callNative("getCapabilities");
        nativeEngine.capabilities = window.PunchLabEngineContract?.mergeNativeCapabilities?.(capabilities) || {
          ...nativeEngine.capabilities,
          ...capabilities,
          realtimeNativeMonitoring: true,
        };
        return nativeEngine.capabilities;
      },
      getDevices: () => bridge.callNative("getDevices"),
      analyzeLoudness: (...args) => window.PunchLabAudio.analyzeLoudness(...args),
      applyTruePeakCeiling: (...args) => window.PunchLabAudio.applyTruePeakCeiling(...args),
      analyzeTakePitch: (...args) => window.PunchLabVocal.analyzeTakePitch(...args),
      decodeTakeBuffer: (...args) => window.PunchLabVocal.decodeTakeBuffer(...args),
      downloadBlob: (...args) => window.PunchLabAudio.downloadBlob(...args),
      encodeWav: (...args) => window.PunchLabAudio.encodeWav(...args),
      getEffectivePreset: (...args) => window.PunchLabVocal.getEffectivePreset(...args),
      startInputMonitor: (payload = null) => bridge.callNative("startInputMonitor", payload),
      stopInputMonitor: (payload = null) => bridge.callNative("stopInputMonitor", payload),
      async renderMixBuffer(request) {
        const result = await bridge.callNative("renderMix", serializeMixRequest(request));
        return toAudioBuffer(result?.audioBuffer || result);
      },
      async renderProcessedVocal(request) {
        const preparedRequest = {
          ...request,
          sourceBuffer: request.sourceBuffer || await window.PunchLabVocal.decodeTakeBuffer(request.sourceTake),
        };
        const result = await bridge.callNative("renderVocal", serializeVocalRequest(preparedRequest));
        const audioBuffer = await toAudioBuffer(result?.audioBuffer || result);
        const renderPreset = result?.renderPreset || window.PunchLabVocal?.getEffectivePreset?.(preparedRequest.preset, preparedRequest.tuneSettings) || preparedRequest.preset;
        const blob = result?.blob instanceof Blob ? result.blob : window.PunchLabAudio.encodeWav(audioBuffer);

        return {
          blob,
          duration: Number(result?.duration || audioBuffer.duration || 0),
          pitchAnalysis: result?.pitchAnalysis || window.PunchLabDSP?.analyzePitchBuffer?.(audioBuffer) || null,
          renderPreset,
          waveform: result?.waveform || makeWaveformFromAudioBuffer(audioBuffer, preparedRequest.waveformLength || 240),
        };
      },
    };

    window.PunchLabNativeEngine = nativeEngine;
    nativeEngine.refreshCapabilities().catch((error) => {
      console.warn("PunchLab native capabilities refresh failed", error);
    });
    window.dispatchEvent(new CustomEvent("punchlab:native-ready", { detail: status }));
    return nativeEngine;
  }

  function getSmokeReport() {
    const bridgeStatus = window.PunchLabNativeBridge?.getStatus?.() || null;
    return {
      bridgeStatus,
      adapterInstalled: Boolean(window.PunchLabNativeEngine),
      canInstall: Boolean(bridgeStatus?.available),
      requiredMethods: window.PunchLabNativeBridge?.requiredMethods || [],
    };
  }

  function serializeMixRequest(request = {}) {
    return {
      sampleRate: Number(request.sampleRate || 48000),
      beatBuffer: serializeAudioBuffer(request.beatBuffer),
      takes: (request.takes || []).map((entry) => ({
        ...entry,
        buffer: serializeAudioBuffer(entry.buffer),
      })),
    };
  }

  function serializeVocalRequest(request = {}) {
    return {
      sourceTake: pickTakeMeta(request.sourceTake),
      sourceBuffer: serializeAudioBuffer(request.sourceBuffer),
      preset: request.preset || null,
      tuneSettings: request.tuneSettings || null,
      pitchPlan: request.pitchPlan || null,
      waveformLength: Number(request.waveformLength || 240),
    };
  }

  function pickTakeMeta(take = {}) {
    return {
      id: take.id || null,
      trackId: take.trackId || null,
      trackName: take.trackName || null,
      duration: Number(take.duration || 0),
      startTime: Number(take.startTime || 0),
      sourceOffset: Number(take.sourceOffset || 0),
      sourceDuration: Number(take.sourceDuration || take.duration || 0),
      processed: Boolean(take.processed),
    };
  }

  function serializeAudioBuffer(audioBuffer) {
    if (!audioBuffer?.getChannelData) {
      return null;
    }

    return {
      sampleRate: audioBuffer.sampleRate,
      length: audioBuffer.length,
      numberOfChannels: audioBuffer.numberOfChannels,
      duration: audioBuffer.duration,
      channels: Array.from({ length: audioBuffer.numberOfChannels }, (_, channel) => Array.from(audioBuffer.getChannelData(channel))),
    };
  }

  async function toAudioBuffer(payload) {
    if (payload?.getChannelData) {
      return payload;
    }

    const channels = payload?.channels;
    if (!Array.isArray(channels) || !channels.length) {
      throw new Error("Native render returned no audio channels.");
    }

    const numberOfChannels = Math.max(1, Number(payload.numberOfChannels || channels.length));
    const length = Math.max(1, Number(payload.length || channels[0]?.length || 1));
    const sampleRate = Math.max(8000, Number(payload.sampleRate || 48000));
    const buffer = createAudioBuffer(numberOfChannels, length, sampleRate);

    for (let channel = 0; channel < numberOfChannels; channel += 1) {
      const source = channels[channel] || channels[0] || [];
      const target = buffer.getChannelData(channel);
      for (let index = 0; index < length; index += 1) {
        target[index] = Math.max(-1, Math.min(1, Number(source[index]) || 0));
      }
    }

    return buffer;
  }

  function createAudioBuffer(numberOfChannels, length, sampleRate) {
    if (typeof AudioBuffer === "function") {
      return new AudioBuffer({ numberOfChannels, length, sampleRate });
    }

    return new OfflineAudioContext(numberOfChannels, length, sampleRate)
      .createBuffer(numberOfChannels, length, sampleRate);
  }

  function makeWaveformFromAudioBuffer(audioBuffer, targetLength) {
    const peaks = [];
    const bucketSize = Math.max(1, Math.floor(audioBuffer.length / targetLength));
    for (let start = 0; start < audioBuffer.length; start += bucketSize) {
      const end = Math.min(audioBuffer.length, start + bucketSize);
      let peak = 0;
      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel += 1) {
        const data = audioBuffer.getChannelData(channel);
        for (let index = start; index < end; index += 1) {
          peak = Math.max(peak, Math.abs(data[index]));
        }
      }
      peaks.push(Math.min(1, peak));
    }
    return peaks.slice(0, targetLength);
  }

  window.PunchLabNativeAdapter = {
    getSmokeReport,
    installNativeEngine,
  };

  installNativeEngine();
})();
