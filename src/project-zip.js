(() => {
  const README_MANIFEST_LINES = Object.freeze([
    "manifest.json lists extracted audio assets for backup, transfer, and manual inspection.",
    "manifest.json includes session settings for tempo, key, tuning mode, punch, loop, and snap review.",
    "manifest.json includes exportSettings for WAV depth, normalize, loudness target, and recent analysis context.",
    "manifest.json includes automationManifest for plugin-style vocal chain parameter interpretation.",
    "manifest.json includes nativeAudio for driver, buffer, and latency environment context.",
    "manifest.json includes desktopReadiness for wrapper, native audio, and plugin host handoff context.",
    "manifest.json includes presets for vocal chain backup and transfer review.",
    "manifest.json includes notes and marker lyrics for read-only archive review.",
  ]);

  function createProjectZipManifest({
    projectFilename = "session.punchlab.json",
    session = {},
    exportSettings = {},
    pluginHost = {},
    automationManifest = {},
    nativeAudio = {},
    desktopReadiness = {},
    presets = [],
    notes = {},
  } = {}) {
    return {
      app: "PunchLab",
      exportedAt: new Date().toISOString(),
      project: projectFilename,
      preview: "preview.html",
      session,
      exportSettings,
      pluginHost,
      automationManifest,
      nativeAudio,
      desktopReadiness,
      presets: Array.isArray(presets) ? presets : [],
      notes,
      beat: null,
      markers: [],
      takes: [],
    };
  }

  function buildProjectZipReadme(projectFilename = "session.punchlab.json") {
    return [
      "PunchLab project archive",
      "",
      `${projectFilename} is the full PunchLab project bundle used by the current web app.`,
      "preview.html is a read-only browser preview for quick review after extracting the zip.",
      ...README_MANIFEST_LINES,
      "Processed takes include automationState when a chain snapshot is available.",
      "assets/beat contains the loaded beat when available.",
      "assets/takes contains recorded and processed take audio files.",
    ].join("\n");
  }

  window.PunchLabProjectZip = {
    README_MANIFEST_LINES,
    createProjectZipManifest,
    buildProjectZipReadme,
  };
})();
