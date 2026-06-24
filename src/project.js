(() => {
  const PROJECT_VERSION = 1;

  async function buildProjectBundle({ state, tracks, presets, settings }) {
    return {
      app: "PunchLab",
      version: PROJECT_VERSION,
      savedAt: new Date().toISOString(),
      settings,
      markers: (state.markers || []).map((marker) => ({ ...marker })),
      presets: presets.map((preset) => ({ ...preset })),
      beat: state.beatArrayBuffer
        ? {
            fileName: state.beatFileName || "beat",
            dataUrl: await blobToDataUrl(new Blob([state.beatArrayBuffer])),
          }
        : null,
      tracks: await Promise.all(
        tracks.map(async (track) => ({
          id: track.id,
          name: track.name,
          color: track.color,
          volume: track.volume,
          pan: track.pan,
          muted: track.muted,
          solo: track.solo,
          takes: await Promise.all(track.takes.map(serializeTake)),
        })),
      ),
    };
  }

  async function serializeTake(take) {
    return {
      id: take.id,
      name: take.name || null,
      trackId: take.trackId,
      trackName: take.trackName,
      extension: take.extension,
      createdAt: take.createdAt instanceof Date ? take.createdAt.toISOString() : take.createdAt,
      startTime: take.startTime || 0,
      duration: take.duration || 0,
      clipGain: take.clipGain ?? 1,
      fadeIn: take.fadeIn || 0,
      fadeOut: take.fadeOut || 0,
      compSelected: Boolean(take.compSelected),
      recordLatencyMs: take.recordLatencyMs || 0,
      processed: Boolean(take.processed),
      sourceTakeId: take.sourceTakeId || null,
      presetId: take.presetId || null,
      presetName: take.presetName || null,
      version: take.version || null,
      renderLabel: take.renderLabel || null,
      chainSnapshot: take.chainSnapshot || null,
      manualPitchTargets: sanitizeManualPitchTargets(take.manualPitchTargets),
      pitchAnalysis: take.pitchAnalysis || null,
      pitchPlan: take.pitchPlan || null,
      sourcePitchPlan: take.sourcePitchPlan || null,
      tuneSettings: take.tuneSettings || null,
      audio: {
        type: take.blob?.type || "audio/wav",
        dataUrl: await blobToDataUrl(take.blob),
      },
    };
  }

  async function hydrateProjectBundle(bundle) {
    if (!bundle || bundle.app !== "PunchLab" || bundle.version !== PROJECT_VERSION) {
      throw new Error("Unsupported PunchLab project file.");
    }

    const beat = bundle.beat
      ? {
          fileName: bundle.beat.fileName || "beat",
          blob: dataUrlToBlob(bundle.beat.dataUrl),
        }
      : null;

    if (beat) {
      beat.arrayBuffer = await beat.blob.arrayBuffer();
    }

    const tracks = await Promise.all(
      (bundle.tracks || []).map(async (track) => ({
        id: track.id,
        name: track.name,
        color: track.color,
        volume: Number(track.volume ?? 0.8),
        pan: Number(track.pan ?? 0),
        muted: Boolean(track.muted),
        solo: Boolean(track.solo),
        takes: await Promise.all((track.takes || []).map(hydrateTake)),
      })),
    );

    return {
      settings: bundle.settings || {},
      markers: bundle.markers || [],
      presets: bundle.presets || [],
      beat,
      tracks,
    };
  }

  async function hydrateTake(take) {
    const blob = dataUrlToBlob(take.audio?.dataUrl || "");
    return {
      id: take.id || crypto.randomUUID(),
      name: take.name || null,
      trackId: take.trackId,
      trackName: take.trackName,
      blob,
      extension: take.extension || "wav",
      createdAt: take.createdAt ? new Date(take.createdAt) : new Date(),
      startTime: Number(take.startTime || 0),
      duration: Number(take.duration || 0),
      clipGain: Number(take.clipGain ?? 1),
      fadeIn: Number(take.fadeIn || 0),
      fadeOut: Number(take.fadeOut || 0),
      compSelected: Boolean(take.compSelected),
      recordLatencyMs: Number(take.recordLatencyMs || 0),
      processed: Boolean(take.processed),
      sourceTakeId: take.sourceTakeId || null,
      presetId: take.presetId || null,
      presetName: take.presetName || null,
      version: take.version || null,
      renderLabel: take.renderLabel || null,
      chainSnapshot: take.chainSnapshot || null,
      manualPitchTargets: sanitizeManualPitchTargets(take.manualPitchTargets),
      pitchAnalysis: take.pitchAnalysis || null,
      pitchPlan: take.pitchPlan || null,
      sourcePitchPlan: take.sourcePitchPlan || null,
      tuneSettings: take.tuneSettings || null,
    };
  }

  function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      if (!blob) {
        reject(new Error("Missing audio blob."));
        return;
      }

      const reader = new FileReader();
      reader.addEventListener("load", () => resolve(reader.result));
      reader.addEventListener("error", () => reject(reader.error));
      reader.readAsDataURL(blob);
    });
  }

  function dataUrlToBlob(dataUrl) {
    if (!dataUrl || !dataUrl.includes(",")) {
      throw new Error("Project audio asset is missing.");
    }

    const [meta, payload] = dataUrl.split(",", 2);
    const type = /data:([^;]+)/.exec(meta)?.[1] || "application/octet-stream";
    const binary = atob(payload);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }

    return new Blob([bytes], { type });
  }

  function sanitizeManualPitchTargets(targets) {
    if (!targets || typeof targets !== "object" || Array.isArray(targets)) {
      return null;
    }

    return Object.fromEntries(
      Object.entries(targets)
        .map(([key, value]) => [String(key), Number(value)])
        .filter(([, value]) => Number.isFinite(value)),
    );
  }

  function makeProjectFilename(beatFileName) {
    const source = beatFileName || "session";
    const slug = source
      .toLowerCase()
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    return `punchlab-${slug || "session"}.punchlab.json`;
  }

  window.PunchLabProject = {
    buildProjectBundle,
    hydrateProjectBundle,
    makeProjectFilename,
  };
})();
