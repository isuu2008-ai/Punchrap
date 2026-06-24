(() => {
  const REQUIRED_METHODS = window.PunchLabEngineContract?.getRequiredNativeMethods?.() || [
    "getCapabilities",
    "getDevices",
    "renderMix",
    "renderVocal",
    "startInputMonitor",
    "stopInputMonitor",
  ];
  const OPTIONAL_METHODS = window.PunchLabEngineContract?.getOptionalNativeMethods?.() || [
    "getLatencyStats",
    "setOutputDevice",
    "setBufferSize",
    "openProjectFile",
    "saveProjectFile",
    "exportCompressedAudio",
    "scanPluginHosts",
  ];

  function getNativeHost() {
    return window.__PUNCHLAB_NATIVE__ || null;
  }

  function getStatus() {
    const host = getNativeHost();
    if (!host) {
      return {
        available: false,
        driverId: "web-audio",
        missingMethods: REQUIRED_METHODS,
        missingOptionalMethods: OPTIONAL_METHODS,
        nativeHostAvailable: false,
        optionalMethods: OPTIONAL_METHODS,
      };
    }

    const missingMethods = REQUIRED_METHODS.filter((method) => typeof host[method] !== "function");
    const missingOptionalMethods = OPTIONAL_METHODS.filter((method) => typeof host[method] !== "function");
    return {
      available: missingMethods.length === 0,
      driverId: host.driverId || "native",
      missingMethods,
      nativeHostAvailable: true,
      optionalMethods: OPTIONAL_METHODS,
      missingOptionalMethods,
    };
  }

  async function callNative(method, payload = null) {
    const host = getNativeHost();
    const status = getStatus();
    if (!host || !status.available || typeof host[method] !== "function") {
      throw new Error(`PunchLab native bridge unavailable for ${method}.`);
    }
    return host[method](payload);
  }

  async function callOptionalNative(method, payload = null) {
    const host = getNativeHost();
    if (!host || typeof host[method] !== "function") {
      return null;
    }
    return host[method](payload);
  }

  window.PunchLabNativeBridge = {
    callOptionalNative,
    callNative,
    getNativeHost,
    getStatus,
    optionalMethods: [...OPTIONAL_METHODS],
    requiredMethods: [...REQUIRED_METHODS],
  };
})();
