(() => {
  const REQUIRED_NATIVE_METHODS = [
    "getCapabilities",
    "getDevices",
    "renderMix",
    "renderVocal",
    "startInputMonitor",
    "stopInputMonitor",
  ];

  const WEB_AUDIO_CAPABILITIES = {
    offlineMixRender: true,
    vocalRender: true,
    pitchAnalysis: true,
    wavExport: true,
    loudnessAnalysis: true,
    truePeakLimiter: true,
    realtimeNativeMonitoring: false,
    pluginHost: false,
  };

  function getRequiredNativeMethods() {
    return [...REQUIRED_NATIVE_METHODS];
  }

  function getWebAudioCapabilities() {
    return { ...WEB_AUDIO_CAPABILITIES };
  }

  function mergeNativeCapabilities(nativeCapabilities = {}) {
    return {
      ...WEB_AUDIO_CAPABILITIES,
      ...nativeCapabilities,
      realtimeNativeMonitoring: true,
    };
  }

  function describeDriver(driver, bridgeStatus = null) {
    const isNative = driver?.id === "native";
    const missingCount = bridgeStatus?.missingMethods?.length || 0;
    const driverName = driver?.name || "Web Audio Engine";

    if (isNative) {
      return {
        kind: "native",
        label: "Native",
        title: `${driverName} active`,
      };
    }

    return {
      kind: "web",
      label: "Web Audio",
      title: `Web Audio fallback${missingCount ? ` / native bridge missing ${missingCount}` : ""}`,
    };
  }

  window.PunchLabEngineContract = {
    describeDriver,
    getRequiredNativeMethods,
    getWebAudioCapabilities,
    mergeNativeCapabilities,
  };
})();
