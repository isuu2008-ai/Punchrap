(() => {
  const platform = {
    displayMode: getDisplayMode(),
    nativeBridge: window.PunchLabNativeBridge?.getStatus() || null,
    serviceWorker: {
      supported: "serviceWorker" in navigator,
      registered: false,
      error: null,
    },
  };

  function getDisplayMode() {
    if (window.matchMedia?.("(display-mode: standalone)").matches || navigator.standalone) {
      return "standalone";
    }
    return "browser";
  }

  function emitPlatformReady() {
    window.dispatchEvent(new CustomEvent("punchlab:platform-ready", { detail: platform }));
  }

  async function registerServiceWorker() {
    if (!platform.serviceWorker.supported || !window.isSecureContext) {
      emitPlatformReady();
      return platform;
    }

    try {
      await navigator.serviceWorker.register("./sw.js");
      platform.serviceWorker.registered = true;
    } catch (error) {
      platform.serviceWorker.error = error?.message || "registration failed";
      console.warn("PunchLab service worker registration failed", error);
    }

    emitPlatformReady();
    return platform;
  }

  window.PunchLabPlatform = {
    platform,
    registerServiceWorker,
  };

  registerServiceWorker();
})();
