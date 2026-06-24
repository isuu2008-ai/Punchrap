(() => {
  const COMMANDS = {
    getCapabilities: "get_capabilities",
    getDevices: "get_devices",
    renderMix: "render_mix",
    renderVocal: "render_vocal",
    startInputMonitor: "start_input_monitor",
    stopInputMonitor: "stop_input_monitor",
    getLatencyStats: "get_latency_stats",
    setOutputDevice: "set_output_device",
    setBufferSize: "set_buffer_size",
    openProjectFile: "open_project_file",
    saveProjectFile: "save_project_file",
    exportCompressedAudio: "export_compressed_audio",
    scanPluginHosts: "scan_plugin_hosts",
  };

  const status = {
    driverId: "tauri-shell",
    implementedMethods: [],
    missingRequiredMethods: [],
    nativeBridgeReady: false,
    plannedMethods: Object.keys(COMMANDS),
    probeStatus: "pending",
    tauriDetected: false,
  };

  function getTauriInvoke() {
    return window.__TAURI__?.core?.invoke || null;
  }

  function getRequiredMethods() {
    return window.PunchLabEngineContract?.getRequiredNativeMethods?.() || [
      "getCapabilities",
      "getDevices",
      "renderMix",
      "renderVocal",
      "startInputMonitor",
      "stopInputMonitor",
    ];
  }

  function getOptionalMethods() {
    return window.PunchLabEngineContract?.getOptionalNativeMethods?.() || [
      "getLatencyStats",
      "setOutputDevice",
      "setBufferSize",
      "openProjectFile",
      "saveProjectFile",
      "exportCompressedAudio",
      "scanPluginHosts",
    ];
  }

  function getStatus() {
    return {
      ...status,
      implementedMethods: [...status.implementedMethods],
      missingRequiredMethods: [...status.missingRequiredMethods],
      plannedMethods: [...status.plannedMethods],
    };
  }

  async function probe() {
    const invoke = getTauriInvoke();
    status.tauriDetected = typeof invoke === "function";
    if (!status.tauriDetected) {
      status.probeStatus = "unavailable";
      status.missingRequiredMethods = getRequiredMethods();
      return getStatus();
    }

    try {
      const result = await invoke("get_punchlab_bridge_status");
      applyBridgeStatus(result || {});
      maybeInstallNativeHost(invoke);
    } catch (error) {
      status.probeStatus = "error";
      status.error = error?.message || String(error);
      status.missingRequiredMethods = getRequiredMethods();
    }

    window.dispatchEvent(new CustomEvent("punchlab:tauri-bridge-status", { detail: getStatus() }));
    return getStatus();
  }

  function applyBridgeStatus(result) {
    const implemented = Array.isArray(result.implementedMethods) ? result.implementedMethods : [];
    const requiredMethods = getRequiredMethods();
    status.driverId = result.driverId || "tauri-shell";
    status.detail = result.detail || "";
    status.implementedMethods = implemented.filter((method) => COMMANDS[method]);
    status.missingRequiredMethods = requiredMethods.filter((method) => !status.implementedMethods.includes(method));
    status.nativeBridgeReady = result.nativeBridgeReady === true && status.missingRequiredMethods.length === 0;
    status.plannedMethods = Array.isArray(result.plannedMethods) && result.plannedMethods.length
      ? result.plannedMethods.filter((method) => COMMANDS[method])
      : Object.keys(COMMANDS);
    status.probeStatus = "ready";
  }

  function maybeInstallNativeHost(invoke) {
    if (!status.implementedMethods.length || window.__PUNCHLAB_NATIVE__) {
      return false;
    }

    const host = {
      driverId: status.driverId || "tauri-native",
    };
    const implemented = new Set(status.implementedMethods);
    for (const method of [...getRequiredMethods(), ...getOptionalMethods()]) {
      const command = COMMANDS[method];
      if (!command || !implemented.has(method)) {
        continue;
      }
      host[method] = (payload = null) => (payload === null ? invoke(command) : invoke(command, { payload }));
    }

    window.__PUNCHLAB_NATIVE__ = host;
    window.dispatchEvent(new CustomEvent("punchlab:tauri-native-ready", { detail: getStatus() }));
    window.PunchLabNativeAdapter?.installNativeEngine?.();
    return true;
  }

  window.PunchLabTauriBridge = {
    commands: { ...COMMANDS },
    getStatus,
    probe,
  };

  probe();
})();
