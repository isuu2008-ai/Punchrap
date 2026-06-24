(() => {
  const platform = {
    displayMode: getDisplayMode(),
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

  async function registerServiceWorker() {
    if (!platform.serviceWorker.supported || !window.isSecureContext) {
      return platform;
    }

    try {
      await navigator.serviceWorker.register("./sw.js");
      platform.serviceWorker.registered = true;
    } catch (error) {
      platform.serviceWorker.error = error?.message || "registration failed";
      console.warn("PunchLab service worker registration failed", error);
    }

    return platform;
  }

  window.PunchLabPlatform = {
    platform,
    registerServiceWorker,
  };

  registerServiceWorker();
})();
