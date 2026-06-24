(() => {
  const REQUIRED_NATIVE_METHODS = [
    "getCapabilities",
    "getDevices",
    "renderMix",
    "renderVocal",
    "startInputMonitor",
    "stopInputMonitor",
  ];

  const OPTIONAL_NATIVE_METHODS = [
    "getLatencyStats",
    "setOutputDevice",
    "setBufferSize",
    "openProjectFile",
    "saveProjectFile",
    "exportCompressedAudio",
    "scanPluginHosts",
  ];

  const WEB_AUDIO_CAPABILITIES = {
    offlineMixRender: true,
    vocalRender: true,
    pitchAnalysis: true,
    wavExport: true,
    loudnessAnalysis: true,
    truePeakLimiter: true,
    compressedAudioExport: false,
    realtimeNativeMonitoring: false,
    pluginHost: false,
  };

  const REQUIRED_ENGINE_CAPABILITIES = [
    "offlineMixRender",
    "vocalRender",
    "pitchAnalysis",
    "wavExport",
    "loudnessAnalysis",
    "truePeakLimiter",
  ];

  const OPTIONAL_ENGINE_CAPABILITIES = [
    "compressedAudioExport",
    "realtimeNativeMonitoring",
    "pluginHost",
  ];

  function getRequiredNativeMethods() {
    return [...REQUIRED_NATIVE_METHODS];
  }

  function getOptionalNativeMethods() {
    return [...OPTIONAL_NATIVE_METHODS];
  }

  function getRequiredEngineCapabilities() {
    return [...REQUIRED_ENGINE_CAPABILITIES];
  }

  function getOptionalEngineCapabilities() {
    return [...OPTIONAL_ENGINE_CAPABILITIES];
  }

  function getWebAudioCapabilities() {
    return { ...WEB_AUDIO_CAPABILITIES };
  }

  function getMissingCapabilities(capabilities = {}, required = REQUIRED_ENGINE_CAPABILITIES) {
    return required.filter((capability) => capabilities[capability] !== true);
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
    const isFixture = Boolean(driver?.capabilities?.nativeFixture);
    const missingCount = bridgeStatus?.missingMethods?.length || 0;
    const driverName = driver?.name || "Web Audio Engine";

    if (isNative) {
      return {
        kind: "native",
        label: isFixture ? "Fixture" : "Native",
        title: `${driverName}${isFixture ? " fixture" : ""} active`,
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
    getMissingCapabilities,
    getOptionalEngineCapabilities,
    getOptionalNativeMethods,
    getRequiredEngineCapabilities,
    getRequiredNativeMethods,
    getWebAudioCapabilities,
    mergeNativeCapabilities,
  };
})();
