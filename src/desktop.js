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
    { id: "desktop-wrapper", label: "Tauri/Electron wrapper", status: "scaffolded" },
    { id: "native-audio-engine", label: "Native low-latency audio engine", status: "planned" },
    { id: "plugin-host", label: "VST3/AU plugin host", status: "planned" },
  ];
  const FILE_ASSOCIATIONS = [
    {
      id: "project",
      extension: ".punchlab.json",
      mimeType: "application/vnd.punchlab.project+json",
      role: "Editor",
    },
    {
      id: "archive",
      extension: ".punchlab.zip",
      mimeType: "application/vnd.punchlab.archive+zip",
      role: "Editor",
    },
  ];
  const TAURI_CAPABILITIES = [
    {
      id: "main",
      path: "src-tauri/capabilities/main.json",
      windows: ["main"],
      permissions: ["core:default", "dialog:default", "fs:default"],
    },
  ];

  const NATIVE_AUDIO_ENGINE_CONTRACT = {
    sampleRates: [44100, 48000],
    bufferSizes: [64, 128, 256, 512, 1024],
    preferredBufferSize: 128,
    maxRoundTripLatencyMs: 10,
    requiresExclusiveAudioThread: true,
  };

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
      packageManifestPath: "./desktop-package-manifest.json",
      projectFormat: ".punchlab.json",
      bundleFormat: ".punchlab.zip",
      wrapper: {
        shell: {
          entry: "index.html",
          tauriConfig: "src-tauri/tauri.conf.json",
          cargoManifest: "src-tauri/Cargo.toml",
          rustEntry: "src-tauri/src/main.rs",
          rustLibrary: "src-tauri/src/lib.rs",
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
        tauriCapabilities: TAURI_CAPABILITIES.map((capability) => ({
          ...capability,
          windows: [...capability.windows],
          permissions: [...capability.permissions],
        })),
        pluginHost: {
          manifest: "plugin-host-manifest.json",
          scanMethod: "scanPluginHosts",
          requiresCapability: "pluginHost",
        },
        tauriBridge: {
          global: "__TAURI__",
          adapter: "src/tauri-bridge.js",
          statusCommand: "get_punchlab_bridge_status",
          implementedMethods: [
            "getCapabilities",
            "getDevices",
            "getLatencyStats",
            "setBufferSize",
            "openProjectFile",
            "saveProjectFile",
          ],
          nativeBridgeReady: false,
          activatesNativeBridgeWhen: "nativeBridgeReady",
        },
        fileAssociations: FILE_ASSOCIATIONS.map((association) => ({ ...association })),
      },
      requiredNativeMethods,
      optionalNativeMethods: [...OPTIONAL_NATIVE_METHODS],
      requiredEngineCapabilities: window.PunchLabEngineContract?.getRequiredEngineCapabilities?.() || [],
      optionalEngineCapabilities: window.PunchLabEngineContract?.getOptionalEngineCapabilities?.() || [],
      nativeAudioEngine: { ...NATIVE_AUDIO_ENGINE_CONTRACT },
      contracts: {
        chainParams: "src/chain-params.js",
        engine: "src/engine-contract.js",
        bridge: "src/native-bridge.js",
        tauriBridge: "src/tauri-bridge.js",
        nativeFixture: "src/native-fixture.js",
        nativeAdapter: "src/native-adapter.js",
        project: "src/project.js",
        desktop: "src/desktop.js",
      },
    };
  }

  function getReadiness() {
    const platform = window.PunchLabPlatform?.platform || {};
    const preferredNativeBufferSize = normalizeNativeBufferSize(platform.preferences?.nativeBufferSize);
    const bridgeStatus = window.PunchLabNativeBridge?.getStatus?.() || null;
    const engineDriver = window.PunchLabEngine?.getDriver?.() || null;
    const capabilities = engineDriver?.capabilities || {};
    const requiredCapabilities = window.PunchLabEngineContract?.getRequiredEngineCapabilities?.() || [];
    const missingCapabilities = window.PunchLabEngineContract?.getMissingCapabilities?.(capabilities, requiredCapabilities) || [];
    const missingLatencyMethods = getMissingOptionalMethods(bridgeStatus, ["getLatencyStats", "setBufferSize"]);
    const hasLatencyMethods = missingLatencyMethods.length === 0;
    const missingOutputMethods = getMissingOptionalMethods(bridgeStatus, ["setOutputDevice"]);
    const hasOutputRoutingMethod = missingOutputMethods.length === 0;
    const nativeOutputRoutingReady = hasOutputRoutingMethod && capabilities.audioOutputRouting === true;
    const browserOutputRoutingReady = canUseBrowserOutputRouting();
    const missingProjectFileMethods = getMissingOptionalMethods(bridgeStatus, ["openProjectFile", "saveProjectFile"]);
    const hasProjectFileHandoff = missingProjectFileMethods.length === 0;
    const missingCompressedExportMethods = getMissingOptionalMethods(bridgeStatus, ["exportCompressedAudio"]);
    const hasCompressedExportMethod = missingCompressedExportMethods.length === 0;
    const missingPluginMethods = getMissingOptionalMethods(bridgeStatus, ["scanPluginHosts"]);
    const hasPluginScan = missingPluginMethods.length === 0;
    const nativeAudioContract = getNativeAudioContractStatus(capabilities);
    const latencyStats = normalizeLatencyStats(platform.latencyStats);
    const latencyStatsAvailable = hasMeasuredLatencyStats(latencyStats);
    const latencyControlReady = hasLatencyMethods && latencyStatsAvailable;
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
        "project-file-handoff",
        "Project file handoff",
        hasProjectFileHandoff ? "ready" : "fallback",
        hasProjectFileHandoff
          ? "Native host can open and save project files."
          : "Project files use browser picker/download fallback until native openProjectFile and saveProjectFile are available.",
      ),
      makeCheck(
        "output-routing",
        "Output routing",
        nativeOutputRoutingReady || browserOutputRoutingReady ? "ready" : hasOutputRoutingMethod ? "pending" : "fallback",
        nativeOutputRoutingReady
          ? "Native host can route playback to the selected output device."
          : browserOutputRoutingReady
            ? "Browser output sink routing is available."
            : hasOutputRoutingMethod
              ? "Native host exposes setOutputDevice; audio output routing capability is pending."
              : "Output routing waits for native setOutputDevice or browser sink routing support.",
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
        latencyControlReady ? "ready" : hasLatencyMethods ? "pending" : "fallback",
        latencyControlReady
          ? "Native host reports measured latency and can change buffer size."
          : hasLatencyMethods
            ? "Native shell can store buffer preference; measured audio latency is pending."
            : "Browser fallback active; native host needs getLatencyStats and setBufferSize for low-latency tuning.",
      ),
      makeCheck(
        "native-audio-performance",
        "Native audio performance",
        nativeAudioContract.ready ? "ready" : "fallback",
        nativeAudioContract.detail,
      ),
      makeCheck(
        "compressed-export-handoff",
        "Compressed export handoff",
        hasCompressedExportMethod ? "ready" : "fallback",
        hasCompressedExportMethod
          ? "Native host can receive compressed MP3/M4A export requests."
          : "MP3/M4A export waits for native exportCompressedAudio support.",
      ),
      makeCheck(
        "plugin-host-scan",
        "Plugin host scan",
        hasPluginScan ? "ready" : "fallback",
        hasPluginScan
          ? "Native host can scan installed VST3/AU plugin locations."
          : "Plugin scan waits for native scanPluginHosts support.",
      ),
    ];
    const readyCount = checks.filter((check) => check.status === "ready").length;

    return {
      manifest: getManifest(),
      displayMode: platform.displayMode || "browser",
      bridgeStatus,
      latencyControl: {
        available: hasLatencyMethods,
        methodAvailable: hasLatencyMethods,
        ready: latencyControlReady,
        statsAvailable: latencyStatsAvailable,
        missingMethods: missingLatencyMethods,
        preferredBufferSize: preferredNativeBufferSize,
        stats: latencyStats,
        statsUpdatedAt: platform.latencyStatsUpdatedAt || null,
      },
      nativeAudioEngine: {
        ...nativeAudioContract,
        fixture: Boolean(capabilities.nativeFixture),
        runtimeRoundTripLatencyMs: latencyStats?.roundTripLatencyMs ?? nativeAudioContract.roundTripLatencyMs,
        runtimeLatencyReady: latencyStatsAvailable || Number.isFinite(nativeAudioContract.roundTripLatencyMs),
        preferredRuntimeBufferSize: preferredNativeBufferSize,
      },
      outputRouting: {
        nativeAvailable: nativeOutputRoutingReady,
        methodAvailable: hasOutputRoutingMethod,
        ready: nativeOutputRoutingReady || browserOutputRoutingReady,
        capabilityReady: capabilities.audioOutputRouting === true,
        missingMethods: missingOutputMethods,
        browserMediaOutput: Boolean(window.PunchLabDevices?.canSetMediaOutput?.()),
        browserAudioContextOutput: Boolean(window.PunchLabDevices?.canSetAudioContextOutput?.()),
      },
      projectFiles: {
        nativeAvailable: hasProjectFileHandoff,
        missingMethods: missingProjectFileMethods,
        browserFileSystemAccess: Boolean(window.PunchLabFiles?.supportsFileSystemAccess?.()),
      },
      compressedExport: {
        methodAvailable: hasCompressedExportMethod,
        capabilityReady: capabilities.compressedAudioExport === true,
        missingMethods: missingCompressedExportMethods,
      },
      pluginHost: {
        scanAvailable: hasPluginScan,
        missingMethods: missingPluginMethods,
        capabilityReady: capabilities.pluginHost === true,
        manifestPath: getManifest().pluginHostManifestPath,
      },
      tauriBridge: window.PunchLabTauriBridge?.getStatus?.() || null,
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

  function canUseBrowserOutputRouting() {
    return Boolean(window.PunchLabDevices?.canSetMediaOutput?.() || window.PunchLabDevices?.canSetAudioContextOutput?.());
  }

  function getNativeAudioContractStatus(capabilities = {}) {
    const contract = NATIVE_AUDIO_ENGINE_CONTRACT;
    const supportedSampleRates = capabilities.sampleRates || capabilities.supportedSampleRates || [];
    const supportedBufferSizes = capabilities.bufferSizes || capabilities.supportedBufferSizes || [];
    const roundTripLatencyMs = Number(capabilities.roundTripLatencyMs ?? capabilities.latencyMs);
    const hasSampleRates = includesAll(supportedSampleRates, contract.sampleRates);
    const hasLowLatencyBuffers = includesAll(supportedBufferSizes, [64, 128, 256]);
    const hasPreferredBuffer = supportedBufferSizes.includes?.(contract.preferredBufferSize);
    const latencyReady = Number.isFinite(roundTripLatencyMs) && roundTripLatencyMs <= contract.maxRoundTripLatencyMs;
    const audioThreadReady = contract.requiresExclusiveAudioThread
      ? capabilities.exclusiveAudioThread === true
      : true;
    const hasNativeMonitoring = capabilities.realtimeNativeMonitoring === true;
    const ready = hasNativeMonitoring && hasSampleRates && hasLowLatencyBuffers && hasPreferredBuffer && latencyReady && audioThreadReady;

    return {
      ...contract,
      ready,
      supportedSampleRates,
      supportedBufferSizes,
      roundTripLatencyMs: Number.isFinite(roundTripLatencyMs) ? roundTripLatencyMs : null,
      exclusiveAudioThread: capabilities.exclusiveAudioThread === true,
      missing: {
        realtimeNativeMonitoring: !hasNativeMonitoring,
        sampleRates: hasSampleRates ? [] : contract.sampleRates.filter((rate) => !supportedSampleRates.includes(rate)),
        bufferSizes: hasLowLatencyBuffers ? [] : [64, 128, 256].filter((size) => !supportedBufferSizes.includes(size)),
        preferredBufferSize: hasPreferredBuffer ? null : contract.preferredBufferSize,
        roundTripLatencyMs: latencyReady ? null : contract.maxRoundTripLatencyMs,
        exclusiveAudioThread: audioThreadReady ? null : true,
      },
      detail: ready
        ? `Native engine meets ${contract.maxRoundTripLatencyMs}ms round-trip target at ${contract.preferredBufferSize} samples.`
        : `Native engine target: 44.1/48kHz, 64/128/256 buffers, <=${contract.maxRoundTripLatencyMs}ms round-trip latency.`,
    };
  }

  function includesAll(values = [], requiredValues = []) {
    return requiredValues.every((value) => values.includes?.(value));
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
    if (!status?.nativeHostAvailable) {
      return [...methods];
    }
    const missing = new Set(status.missingOptionalMethods || []);
    return methods.filter((method) => missing.has(method));
  }

  function normalizeNativeBufferSize(value) {
    const size = Number(value || NATIVE_AUDIO_ENGINE_CONTRACT.preferredBufferSize);
    return NATIVE_AUDIO_ENGINE_CONTRACT.bufferSizes.includes(size) ? size : NATIVE_AUDIO_ENGINE_CONTRACT.preferredBufferSize;
  }

  function normalizeLatencyStats(stats) {
    if (!stats || typeof stats !== "object") {
      return null;
    }

    return {
      inputLatencyMs: finiteOrNull(stats.inputLatencyMs),
      outputLatencyMs: finiteOrNull(stats.outputLatencyMs),
      roundTripLatencyMs: finiteOrNull(stats.roundTripLatencyMs ?? stats.latencyMs),
      bufferSize: finiteOrNull(stats.bufferSize),
      sampleRate: finiteOrNull(stats.sampleRate),
    };
  }

  function hasMeasuredLatencyStats(stats) {
    return Boolean(stats && [
      stats.inputLatencyMs,
      stats.outputLatencyMs,
      stats.roundTripLatencyMs,
    ].some((value) => Number.isFinite(value)));
  }

  function finiteOrNull(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  window.PunchLabDesktop = {
    getManifest,
    getReadiness,
  };
})();
