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

  async function saveProjectFile(blob, suggestedName) {
    const bridge = window.PunchLabNativeBridge;
    const status = bridge?.getStatus?.();
    if (!status?.available || status.missingOptionalMethods?.includes("saveProjectFile")) {
      return null;
    }

    const result = await bridge.callOptionalNative("saveProjectFile", {
      suggestedName,
      type: blob.type || "application/octet-stream",
      data: await blobToDataUrl(blob),
    });
    return result ? { canceled: Boolean(result.canceled), method: "native", native: result } : null;
  }

  async function openProjectFile() {
    const bridge = window.PunchLabNativeBridge;
    const status = bridge?.getStatus?.();
    if (!status?.available || status.missingOptionalMethods?.includes("openProjectFile")) {
      return null;
    }

    const result = await bridge.callOptionalNative("openProjectFile", {
      accept: [".json", ".punchlab.json"],
      type: "application/json",
    });
    if (!result || result.canceled) {
      return result ? { canceled: true, method: "native" } : null;
    }

    return {
      canceled: false,
      method: "native",
      file: dataUrlToFile(result.dataUrl || result.data || "", result.fileName || "project.punchlab.json", result.type || "application/json"),
      native: result,
    };
  }

  function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => resolve(String(reader.result || "")));
      reader.addEventListener("error", () => reject(reader.error));
      reader.readAsDataURL(blob);
    });
  }

  function dataUrlToFile(dataUrl, fileName, type) {
    const source = String(dataUrl || "");
    const comma = source.indexOf(",");
    const meta = comma >= 0 ? source.slice(0, comma) : "";
    const body = comma >= 0 ? source.slice(comma + 1) : source;
    const mime = /data:([^;]+)/.exec(meta)?.[1] || type || "application/json";
    const binary = atob(body);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return new File([bytes], fileName, { type: mime });
  }

  window.PunchLabPlatform = {
    openProjectFile,
    platform,
    registerServiceWorker,
    saveProjectFile,
  };

  registerServiceWorker();
})();
