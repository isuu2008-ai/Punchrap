(() => {
  function makeExportBaseSlug({ metadata = {}, beatFileName = "" } = {}) {
    const source = [metadata.artist, metadata.title].filter(Boolean).join("-") || beatFileName || "session";
    return `punchlab-${slugify(source.replace(/\.[^.]+$/, "")) || "session"}`;
  }

  function makeMixFilename({ baseSlug = "" } = {}) {
    return `${baseSlug || "punchlab-session"}-mix.wav`;
  }

  function buildStemExportGroups({ tracks = [], beatAvailable = false, baseSlug = "", getTrackVolume = null } = {}) {
    const exportBase = baseSlug || "punchlab-session";
    const groups = [];
    if (beatAvailable) {
      groups.push({
        name: "Beat",
        filename: `${exportBase}-beat-stem.wav`,
        takes: [],
        includeBeat: true,
      });
    }

    tracks.forEach((track) => {
      const volume = typeof getTrackVolume === "function" ? getTrackVolume(track) : Number(track?.volume ?? 1);
      if (volume <= 0 || !track?.takes?.length) {
        return;
      }

      groups.push({
        name: track.name,
        filename: `${exportBase}-${slugify(track.name)}-stem.wav`,
        takes: track.takes,
        includeBeat: false,
      });
    });

    return groups;
  }

  function buildSingleExportGroup({ name = "Export", suffix = "", takes = [], includeBeat = false, baseSlug = "" } = {}) {
    const exportBase = baseSlug || "punchlab-session";
    const safeSuffix = slugify(suffix || name || "export") || "export";
    return {
      name,
      filename: `${exportBase}-${safeSuffix}.wav`,
      takes,
      includeBeat: Boolean(includeBeat),
    };
  }

  function normalizeExportBitDepth(bitDepth) {
    return Number(bitDepth) === 24 ? 24 : 16;
  }

  function buildExportWavOptions({ bitDepth = 16 } = {}) {
    return {
      bitDepth: normalizeExportBitDepth(bitDepth),
    };
  }

  function normalizeCompressedFormat(format) {
    return String(format || "").toLowerCase() === "m4a" ? "m4a" : "mp3";
  }

  function replaceAudioExtension(fileName, extension) {
    const base = String(fileName || "punchlab-export.wav").replace(/\.[a-z0-9]+$/i, "");
    return `${base}.${normalizeCompressedFormat(extension)}`;
  }

  function getExportJobStatusLabel(status) {
    return {
      queued: "Queued",
      running: "Running",
      done: "Done",
      failed: "Failed",
    }[status] || "Idle";
  }

  function formatExportRowCount(row = {}) {
    if (typeof row.count === "string") {
      return row.count;
    }

    return `${row.count} ${row.unit}${row.count === 1 ? "" : "s"}`;
  }

  function formatExportJobDetail(job = {}, fallbackStatus = "Idle") {
    const detail = job.previewName || job.detail || fallbackStatus;
    return [detail, job.compressedStatus].filter(Boolean).join(" / ");
  }

  function getClippingRisk(report = {}, stale = false, { formatDb = formatDbValue } = {}) {
    if (stale) {
      return { warning: true, label: "Re-analyze mix" };
    }

    const truePeakDb = Number(report?.truePeakDbfs ?? report?.peakDbfs ?? -Infinity);
    const clippingSamples = Number(report?.clippingSamples || 0);
    if (clippingSamples > 0) {
      return { warning: true, label: `${clippingSamples} clipped samples` };
    }

    if (truePeakDb >= -0.1) {
      return { warning: true, label: `${formatDb(truePeakDb)} dBTP near ceiling` };
    }

    if (truePeakDb >= -1) {
      return { warning: false, label: `${formatDb(truePeakDb)} dBTP close` };
    }

    return { warning: false, label: "Safe headroom" };
  }

  function getCompressedExportStatus(ready = false) {
    return ready ? "Native MP3/M4A ready" : "Native required";
  }

  function formatDbValue(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      return "-inf";
    }

    return `${number.toFixed(1)}`;
  }

  function slugify(value) {
    return String(value || "session")
      .toLowerCase()
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  window.PunchLabExportPlan = {
    buildExportWavOptions,
    buildSingleExportGroup,
    buildStemExportGroups,
    formatExportRowCount,
    formatExportJobDetail,
    getClippingRisk,
    getCompressedExportStatus,
    getExportJobStatusLabel,
    makeExportBaseSlug,
    makeMixFilename,
    normalizeCompressedFormat,
    normalizeExportBitDepth,
    replaceAudioExtension,
    slugify,
  };
})();
