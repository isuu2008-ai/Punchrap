(() => {
  const WEB_AUDIO_CAPABILITIES = window.PunchLabEngineContract?.getWebAudioCapabilities?.() || {
    offlineMixRender: true,
    vocalRender: true,
    pitchAnalysis: true,
    wavExport: true,
    loudnessAnalysis: true,
    truePeakLimiter: true,
    realtimeNativeMonitoring: false,
    pluginHost: false,
  };

  function getDriver() {
    const bridgeStatus = window.PunchLabNativeBridge?.getStatus();
    if (bridgeStatus?.available && window.PunchLabNativeEngine) {
      return {
        id: "native",
        name: "Native Audio Engine",
        capabilities: window.PunchLabEngineContract?.mergeNativeCapabilities?.(window.PunchLabNativeEngine.capabilities) || {
          ...WEB_AUDIO_CAPABILITIES,
          ...window.PunchLabNativeEngine.capabilities,
          realtimeNativeMonitoring: true,
        },
        ...window.PunchLabNativeEngine,
      };
    }

    return {
      id: "web-audio",
      name: "Web Audio Engine",
      nativeBridge: bridgeStatus || null,
      capabilities: window.PunchLabEngineContract?.getWebAudioCapabilities?.() || { ...WEB_AUDIO_CAPABILITIES },
      analyzeLoudness: window.PunchLabAudio.analyzeLoudness,
      applyTruePeakCeiling: window.PunchLabAudio.applyTruePeakCeiling,
      analyzeTakePitch: window.PunchLabVocal.analyzeTakePitch,
      decodeTakeBuffer: window.PunchLabVocal.decodeTakeBuffer,
      downloadBlob: window.PunchLabAudio.downloadBlob,
      encodeWav: window.PunchLabAudio.encodeWav,
      getEffectivePreset: window.PunchLabVocal.getEffectivePreset,
      getLatencyStats: async () => null,
      renderMixBuffer: window.PunchLabMix.renderMixBuffer,
      renderProcessedVocal: window.PunchLabVocal.renderProcessedVocal,
      setBufferSize: async () => null,
    };
  }

  function requireMethod(name) {
    const driver = getDriver();
    if (typeof driver[name] !== "function") {
      throw new Error(`Audio engine method unavailable: ${name}`);
    }
    return driver[name].bind(driver);
  }

  window.PunchLabEngine = {
    getDriver,
    get capabilities() {
      return getDriver().capabilities;
    },
    get driverId() {
      return getDriver().id;
    },
    analyzeLoudness: (...args) => requireMethod("analyzeLoudness")(...args),
    applyTruePeakCeiling: (...args) => requireMethod("applyTruePeakCeiling")(...args),
    analyzeTakePitch: (...args) => requireMethod("analyzeTakePitch")(...args),
    decodeTakeBuffer: (...args) => requireMethod("decodeTakeBuffer")(...args),
    downloadBlob: (...args) => requireMethod("downloadBlob")(...args),
    encodeWav: (...args) => requireMethod("encodeWav")(...args),
    getEffectivePreset: (...args) => requireMethod("getEffectivePreset")(...args),
    getLatencyStats: (...args) => requireMethod("getLatencyStats")(...args),
    renderMixBuffer: (...args) => requireMethod("renderMixBuffer")(...args),
    renderProcessedVocal: (...args) => requireMethod("renderProcessedVocal")(...args),
    setBufferSize: (...args) => requireMethod("setBufferSize")(...args),
  };
})();
