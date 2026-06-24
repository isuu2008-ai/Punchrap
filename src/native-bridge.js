(() => {
  const REQUIRED_METHODS = [
    "getCapabilities",
    "getDevices",
    "renderMix",
    "renderVocal",
    "startInputMonitor",
    "stopInputMonitor",
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
      };
    }

    const missingMethods = REQUIRED_METHODS.filter((method) => typeof host[method] !== "function");
    return {
      available: missingMethods.length === 0,
      driverId: host.driverId || "native",
      missingMethods,
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

  window.PunchLabNativeBridge = {
    callNative,
    getNativeHost,
    getStatus,
    requiredMethods: [...REQUIRED_METHODS],
  };
})();
