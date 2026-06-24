(() => {
  const FALLBACK_REQUIRED_NATIVE_METHODS = [
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

  const WRAPPER_HANDOFF_STAGES = [
    { id: "browser-shell", label: "Browser shell", status: "ready" },
    { id: "desktop-wrapper", label: "Tauri/Electron wrapper", status: "planned" },
    { id: "native-audio-engine", label: "Native low-latency audio engine", status: "planned" },
    { id: "plugin-host", label: "VST3/AU plugin host", status: "planned" },
  ];

  function getManifest() {
    const requiredNativeMethods = window.PunchLabEngineContract?.getRequiredNativeMethods?.() || FALLBACK_REQUIRED_NATIVE_METHODS;
    return {
      appId: "ai.isuu2008.punchrap",
      appName: "PunchLab",
      bridgeVersion: 1,
      bridgeGlobal: "__PUNCHLAB_NATIVE__",
      manifestPath: "./desktop-host-manifest.json",
      wrapperManifestPath: "./desktop-wrapper-manifest.json",
      pluginHostManifestPath: "./plugin-host-manifest.json",
      projectFormat: ".punchlab.json",
      bundleFormat: ".punchlab.zip",
      wrapper: {
        shell: {
          entry: "index.html",
          minWidth: 1180,
          minHeight: 760,
        },
        permissions: {
          microphone: true,
          filesystem: true,
          audioOutputRouting: true,
          network: false,
        },
        handoffStages: WRAPPER_HANDOFF_STAGES.map((stage) => ({ ...stage })),
        pluginHost: {
          manifest: "plugin-host-manifest.json",
          scanMethod: "scanPluginHosts",
          requiresCapability: "pluginHost",
        },
      },
      requiredNativeMethods,
      optionalNativeMethods: [...OPTIONAL_NATIVE_METHODS],
      requiredEngineCapabilities: window.PunchLabEngineContract?.getRequiredEngineCapabilities?.() || [],
      optionalEngineCapabilities: window.PunchLabEngineContract?.getOptionalEngineCapabilities?.() || [],
      contracts: {
        chainParams: "src/chain-params.js",
        engine: "src/engine-contract.js",
        bridge: "src/native-bridge.js",
        nativeFixture: "src/native-fixture.js",
        nativeAdapter: "src/native-adapter.js",
        project: "src/project.js",
        desktop: "src/desktop.js",
      },
    };
  }

  function getReadiness() {
    const platform = window.PunchLabPlatform?.platform || {};
    const bridgeStatus = window.PunchLabNativeBridge?.getStatus?.() || null;
    const engineDriver = window.PunchLabEngine?.getDriver?.() || null;
    const capabilities = engineDriver?.capabilities || {};
    const requiredCapabilities = window.PunchLabEngineContract?.getRequiredEngineCapabilities?.() || [];
    const missingCapabilities = window.PunchLabEngineContract?.getMissingCapabilities?.(capabilities, requiredCapabilities) || [];
    const missingLatencyMethods = getMissingOptionalMethods(bridgeStatus, ["getLatencyStats", "setBufferSize"]);
    const hasLatencyControl = missingLatencyMethods.length === 0;
    const handoffStages = getWrapperHandoffStages(bridgeStatus, capabilities);
    const serviceWorker = platform.serviceWorker || {};
    const checks = [
      makeCheck(
        "secure-context",
        "Secure context",
        window.isSecureContext ? "ready" : "blocked",
        window.isSecureContext ? "Required browser APIs are available." : "Use localhost or HTTPS.",
      ),
      makeCheck(
        "file-access",
        "File access",
        window.PunchLabFiles?.supportsFileSystemAccess?.() ? "ready" : "fallback",
        window.PunchLabFiles?.supportsFileSystemAccess?.() ? "OS file picker available." : "Download/input fallback active.",
      ),
      makeCheck(
        "service-worker",
        "Service worker",
        getServiceWorkerStatus(serviceWorker),
        getServiceWorkerDetail(serviceWorker),
      ),
      makeCheck(
        "native-bridge",
        "Native bridge",
        bridgeStatus?.available ? "ready" : "fallback",
        bridgeStatus?.available
          ? "Native host contract satisfied."
          : `Web Audio fallback active; missing ${bridgeStatus?.missingMethods?.length || getManifest().requiredNativeMethods.length} method(s).`,
      ),
      makeCheck(
        "engine-capabilities",
        "Engine capabilities",
        missingCapabilities.length ? "blocked" : "ready",
        missingCapabilities.length
          ? `Missing ${missingCapabilities.join(", ")}.`
          : `${engineDriver?.name || "Audio engine"} satisfies required render/export capabilities.`,
      ),
      makeCheck(
        "latency-buffer-control",
        "Latency/buffer control",
        hasLatencyControl ? "ready" : "fallback",
        hasLatencyControl
          ? "Native host can report latency and change buffer size."
          : "Browser fallback active; native host needs getLatencyStats and setBufferSize for low-latency tuning.",
      ),
    ];
    const readyCount = checks.filter((check) => check.status === "ready").length;

    return {
      manifest: getManifest(),
      displayMode: platform.displayMode || "browser",
      bridgeStatus,
      latencyControl: {
        available: hasLatencyControl,
        missingMethods: missingLatencyMethods,
      },
      wrapper: {
        manifestPath: getManifest().wrapperManifestPath,
        handoffStages,
        summary: summarizeHandoffStages(handoffStages),
      },
      engineDriver: engineDriver
        ? {
          id: engineDriver.id,
          name: engineDriver.name,
          capabilities,
          missingCapabilities,
        }
        : null,
      nativeAvailable: Boolean(bridgeStatus?.available),
      desktopReady: checks.every((check) => check.status !== "blocked"),
      summary: `${readyCount}/${checks.length} ready`,
      checks,
    };
  }

  function getServiceWorkerStatus(serviceWorker) {
    if (!serviceWorker.supported) {
      return "fallback";
    }
    if (serviceWorker.registered) {
      return "ready";
    }
    if (serviceWorker.error) {
      return "fallback";
    }
    return "pending";
  }

  function getServiceWorkerDetail(serviceWorker) {
    if (!serviceWorker.supported) {
      return "Browser service worker unsupported.";
    }
    if (serviceWorker.registered) {
      return "Offline shell cache registered.";
    }
    return serviceWorker.error || "Registration pending.";
  }

  function makeCheck(id, label, status, detail) {
    return { id, label, status, detail };
  }

  function getWrapperHandoffStages(bridgeStatus, capabilities) {
    return WRAPPER_HANDOFF_STAGES.map((stage) => {
      if (stage.id === "desktop-wrapper" && bridgeStatus?.available) {
        return { ...stage, status: "ready" };
      }
      if (stage.id === "native-audio-engine" && capabilities?.realtimeNativeMonitoring) {
        return { ...stage, status: "ready" };
      }
      if (stage.id === "plugin-host" && capabilities?.pluginHost) {
        return { ...stage, status: "ready" };
      }
      return { ...stage };
    });
  }

  function summarizeHandoffStages(stages) {
    const readyCount = stages.filter((stage) => stage.status === "ready").length;
    return `${readyCount}/${stages.length} handoff stages ready`;
  }

  function getMissingOptionalMethods(status, methods) {
    if (!status?.available) {
      return [...methods];
    }
    const missing = new Set(status.missingOptionalMethods || []);
    return methods.filter((method) => missing.has(method));
  }

  window.PunchLabDesktop = {
    getManifest,
    getReadiness,
  };
})();
