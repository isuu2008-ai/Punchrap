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

  function slugify(value) {
    return String(value || "session")
      .toLowerCase()
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  window.PunchLabExportPlan = {
    buildSingleExportGroup,
    buildStemExportGroups,
    formatExportRowCount,
    formatExportJobDetail,
    getExportJobStatusLabel,
    makeExportBaseSlug,
    makeMixFilename,
    normalizeCompressedFormat,
    replaceAudioExtension,
    slugify,
  };
})();
