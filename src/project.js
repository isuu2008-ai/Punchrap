(() => {
  const PROJECT_VERSION = 1;

  async function buildProjectBundle({ state, tracks, presets, settings, environment = {} }) {
    return {
      app: "PunchLab",
      version: PROJECT_VERSION,
      savedAt: new Date().toISOString(),
      settings,
      environment: sanitizeEnvironment(environment),
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
      sourceOffset: take.sourceOffset || 0,
      sourceDuration: take.sourceDuration || take.duration || 0,
      waveform: sanitizeWaveform(take.waveform),
      clipGain: take.clipGain ?? 1,
      regionColor: sanitizeColor(take.regionColor),
      regionGroup: sanitizeRegionGroup(take.regionGroup),
      fadeIn: take.fadeIn || 0,
      fadeOut: take.fadeOut || 0,
      compSelected: Boolean(take.compSelected),
      compOrder: Number.isFinite(Number(take.compOrder)) ? Number(take.compOrder) : null,
      bestTake: Boolean(take.bestTake),
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

  function sanitizeEnvironment(environment = {}) {
    return {
      nativeAudio: environment.nativeAudio || null,
      desktopReadiness: environment.desktopReadiness || null,
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
      environment: sanitizeEnvironment(bundle.environment || {}),
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
      sourceOffset: Number(take.sourceOffset || 0),
      sourceDuration: Number(take.sourceDuration || Number(take.sourceOffset || 0) + Number(take.duration || 0)),
      waveform: sanitizeWaveform(take.waveform),
      clipGain: Number(take.clipGain ?? 1),
      regionColor: sanitizeColor(take.regionColor),
      regionGroup: sanitizeRegionGroup(take.regionGroup),
      fadeIn: Number(take.fadeIn || 0),
      fadeOut: Number(take.fadeOut || 0),
      compSelected: Boolean(take.compSelected),
      compOrder: Number.isFinite(Number(take.compOrder)) ? Number(take.compOrder) : null,
      bestTake: Boolean(take.bestTake),
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

  function sanitizeWaveform(waveform) {
    if (!Array.isArray(waveform)) {
      return [];
    }

    return waveform
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value))
      .map((value) => Math.max(0, Math.min(1, value)))
      .slice(0, 240);
  }

  function sanitizeColor(value) {
    const color = String(value || "").trim();
    if (/^#[0-9a-f]{6}$/i.test(color)) {
      return color.toLowerCase();
    }

    if (/^#[0-9a-f]{3}$/i.test(color)) {
      return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`.toLowerCase();
    }

    return null;
  }

  function sanitizeRegionGroup(value) {
    const group = String(value || "").trim().toLowerCase();
    return ["verse", "hook", "adlib", "intro", "bridge", "outro"].includes(group) ? group : null;
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

  function makeProjectZipFilename(beatFileName) {
    return makeProjectFilename(beatFileName).replace(/\.punchlab\.json$/, ".punchlab.zip");
  }

  function buildProjectZip(files) {
    const encoder = new TextEncoder();
    const entries = Object.entries(files).map(([name, content]) => ({
      name,
      nameBytes: encoder.encode(name),
      data: typeof content === "string" ? encoder.encode(content) : new Uint8Array(content),
    }));
    const localParts = [];
    const centralParts = [];
    let offset = 0;

    entries.forEach((entry) => {
      const crc = crc32(entry.data);
      const localHeader = makeZipLocalHeader(entry, crc);
      localParts.push(localHeader, entry.data);
      centralParts.push(makeZipCentralHeader(entry, crc, offset));
      offset += localHeader.length + entry.data.length;
    });

    const centralOffset = offset;
    const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
    const endRecord = makeZipEndRecord(entries.length, centralSize, centralOffset);
    return new Blob([...localParts, ...centralParts, endRecord], { type: "application/zip" });
  }

  function makeZipLocalHeader(entry, crc) {
    const output = new Uint8Array(30 + entry.nameBytes.length);
    const view = new DataView(output.buffer);
    const timeDate = getZipTimeDate();
    view.setUint32(0, 0x04034b50, true);
    view.setUint16(4, 20, true);
    view.setUint16(6, 0x0800, true);
    view.setUint16(8, 0, true);
    view.setUint16(10, timeDate.time, true);
    view.setUint16(12, timeDate.date, true);
    view.setUint32(14, crc, true);
    view.setUint32(18, entry.data.length, true);
    view.setUint32(22, entry.data.length, true);
    view.setUint16(26, entry.nameBytes.length, true);
    view.setUint16(28, 0, true);
    output.set(entry.nameBytes, 30);
    return output;
  }

  function makeZipCentralHeader(entry, crc, offset) {
    const output = new Uint8Array(46 + entry.nameBytes.length);
    const view = new DataView(output.buffer);
    const timeDate = getZipTimeDate();
    view.setUint32(0, 0x02014b50, true);
    view.setUint16(4, 20, true);
    view.setUint16(6, 20, true);
    view.setUint16(8, 0x0800, true);
    view.setUint16(10, 0, true);
    view.setUint16(12, timeDate.time, true);
    view.setUint16(14, timeDate.date, true);
    view.setUint32(16, crc, true);
    view.setUint32(20, entry.data.length, true);
    view.setUint32(24, entry.data.length, true);
    view.setUint16(28, entry.nameBytes.length, true);
    view.setUint16(30, 0, true);
    view.setUint16(32, 0, true);
    view.setUint16(34, 0, true);
    view.setUint16(36, 0, true);
    view.setUint32(38, 0, true);
    view.setUint32(42, offset, true);
    output.set(entry.nameBytes, 46);
    return output;
  }

  function makeZipEndRecord(entryCount, centralSize, centralOffset) {
    const output = new Uint8Array(22);
    const view = new DataView(output.buffer);
    view.setUint32(0, 0x06054b50, true);
    view.setUint16(8, entryCount, true);
    view.setUint16(10, entryCount, true);
    view.setUint32(12, centralSize, true);
    view.setUint32(16, centralOffset, true);
    return output;
  }

  function getZipTimeDate() {
    const now = new Date();
    return {
      time: (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2),
      date: ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate(),
    };
  }

  function crc32(bytes) {
    let crc = 0xffffffff;
    for (let index = 0; index < bytes.length; index += 1) {
      crc = ZIP_CRC_TABLE[(crc ^ bytes[index]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  const ZIP_CRC_TABLE = (() => {
    const table = new Uint32Array(256);
    for (let index = 0; index < table.length; index += 1) {
      let value = index;
      for (let bit = 0; bit < 8; bit += 1) {
        value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
      }
      table[index] = value >>> 0;
    }
    return table;
  })();

  window.PunchLabProject = {
    buildProjectZip,
    buildProjectBundle,
    hydrateProjectBundle,
    makeProjectFilename,
    makeProjectZipFilename,
  };
})();
