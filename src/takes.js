(() => {
  function getTakeCreatedTime(take = {}) {
    if (take.createdAt instanceof Date) {
      return take.createdAt.getTime();
    }

    const createdTime = new Date(take.createdAt || 0).getTime();
    return Number.isFinite(createdTime) ? createdTime : 0;
  }

  function slugifyTakeValue(value, fallback = "session") {
    return String(value || fallback)
      .toLowerCase()
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || fallback;
  }

  function makeTakeFilename(take = {}) {
    const slug = slugifyTakeValue(take.trackName);
    const preset = take.presetName ? `-${slugifyTakeValue(take.presetName, "preset")}` : "";
    const version = take.processed ? `-v${take.version || 1}` : "";
    const id = String(take.id || "take").slice(0, 8) || "take";
    const extension = String(take.extension || "wav").replace(/^\.+/, "") || "wav";
    return `punchlab-${slug}${preset}${version}-${id}.${extension}`;
  }

  function getTakeTitle(take = {}, index = 0) {
    if (take.name) {
      return take.name;
    }

    if (take.processed) {
      return `${take.trackName} ${take.presetName || "Processed"} v${take.version || 1}`;
    }

    return `${take.trackName} take ${Number(index) + 1}`;
  }

  function getTakeShortName(take = {}) {
    if (take.name) {
      return take.name;
    }

    return take.processed ? `${take.trackName} ${take.presetName || "Processed"} v${take.version || 1}` : `${take.trackName} raw`;
  }

  function formatTakeLatencyTag(take = {}) {
    const latencyMs = Number(take?.recordLatencyMs || 0);
    return latencyMs > 0 ? ` / latency -${Math.round(latencyMs)}ms` : "";
  }

  function getBatchScopeReadyText(scope = "track", count = 0, skippedCount = 0) {
    const messages = {
      all: `Will render ${count} raw take(s) across all vocal tracks.`,
      best: `Will render ${count} best raw take(s).`,
      comp: `Will render ${count} raw take(s) from the comp lane.`,
      track: `Will render ${count} raw take(s) on this track.`,
    };
    const skippedText = skippedCount ? ` Skipping ${skippedCount} already rendered.` : "";
    return `${messages[scope] || messages.track}${skippedText}`;
  }

  function getBatchScopeEmptyText(scope = "track", skippedCount = 0) {
    if (skippedCount) {
      return "All matching raw takes already have this preset/tune render.";
    }

    const messages = {
      all: "No raw vocal takes available.",
      best: "No best raw takes selected.",
      comp: "No raw takes in the comp lane.",
      track: "No raw takes on this track.",
    };
    return messages[scope] || messages.track;
  }

  function getBatchSourceTargets({ allTakes = [], compTakes = [], scope = "track", trackId = "" } = {}) {
    const rawTakes = (Array.isArray(allTakes) ? allTakes : []).filter((take) => !take.processed);
    if (scope === "all") {
      return rawTakes;
    }

    if (scope === "comp") {
      return (Array.isArray(compTakes) ? compTakes : []).filter((take) => !take.processed);
    }

    if (scope === "best") {
      return rawTakes.filter((take) => take.bestTake);
    }

    return rawTakes.filter((take) => take.trackId === trackId);
  }

  function getBatchTargets({ sourceTargets = [], takes = [], preset = null, tuneSettings = null, skipRendered = false, getTuneSignature = null } = {}) {
    const targets = Array.isArray(sourceTargets) ? sourceTargets : [];
    if (!skipRendered) {
      return targets;
    }

    const tuneSignature = typeof getTuneSignature === "function" ? getTuneSignature(tuneSettings) : String(tuneSettings || "");
    return targets.filter((take) => !hasProcessedTakeForChain({
      getTuneSignature,
      preset,
      sourceTake: take,
      takes,
      tuneSignature,
    }));
  }

  function hasProcessedTakeForChain({ takes = [], sourceTake = null, preset = null, tuneSignature = "", getTuneSignature = null } = {}) {
    if (!sourceTake || !preset) {
      return false;
    }

    const makeTuneSignature = typeof getTuneSignature === "function" ? getTuneSignature : (settings) => String(settings || "");
    return (Array.isArray(takes) ? takes : []).some((take) => {
      const takeTuneSettings = take.tuneSettings || take.chainSnapshot?.tuneSettings || null;
      return take.processed
        && take.sourceTakeId === sourceTake.id
        && take.presetId === preset.id
        && makeTuneSignature(takeTuneSettings) === tuneSignature;
    });
  }

  function getTakeCompOrder(take = {}) {
    if (take.compOrder == null || take.compOrder === "") {
      return Number.POSITIVE_INFINITY;
    }

    const order = Number(take.compOrder);
    return Number.isFinite(order) ? order : Number.POSITIVE_INFINITY;
  }

  function compareTakeCreatedAt(a = {}, b = {}) {
    return getTakeCreatedTime(a) - getTakeCreatedTime(b);
  }

  function compareCompTakes(a = {}, b = {}) {
    return getTakeCompOrder(a) - getTakeCompOrder(b)
      || (a.startTime || 0) - (b.startTime || 0)
      || compareTakeCreatedAt(a, b);
  }

  function compareBestTakesForComp(a = {}, b = {}) {
    return (a.startTime || 0) - (b.startTime || 0) || compareTakeCreatedAt(a, b);
  }

  function compareProcessedVersions(a = {}, b = {}) {
    const presetDelta = String(a.presetName || "").localeCompare(String(b.presetName || ""));
    if (presetDelta) {
      return presetDelta;
    }

    return compareProcessedTimeline(a, b);
  }

  function compareProcessedTimeline(a = {}, b = {}) {
    const versionDelta = (a.version || 1) - (b.version || 1);
    return versionDelta || compareTakeCreatedAt(a, b);
  }

  function sortTakesByCreatedAt(takes = []) {
    return [...(Array.isArray(takes) ? takes : [])].sort(compareTakeCreatedAt);
  }

  function sortCompTakes(takes = []) {
    return [...(Array.isArray(takes) ? takes : [])].sort(compareCompTakes);
  }

  function sortBestTakesForComp(takes = []) {
    return [...(Array.isArray(takes) ? takes : [])].sort(compareBestTakesForComp);
  }

  function sortProcessedVersions(takes = []) {
    return [...(Array.isArray(takes) ? takes : [])].sort(compareProcessedVersions);
  }

  function normalizeCompOrder(takes = []) {
    sortCompTakes(takes).forEach((take, index) => {
      take.compOrder = index + 1;
    });
  }

  function moveCompTakeOrder(takes = [], takeId = "", delta = 0) {
    const compTakes = sortCompTakes(takes);
    const index = compTakes.findIndex((take) => take.id === takeId);
    const nextIndex = index + Number(delta || 0);
    if (index < 0 || nextIndex < 0 || nextIndex >= compTakes.length) {
      return false;
    }

    [compTakes[index], compTakes[nextIndex]] = [compTakes[nextIndex], compTakes[index]];
    compTakes.forEach((take, order) => {
      take.compOrder = order + 1;
    });
    return true;
  }

  function getNextCompOrder(takes = []) {
    return (Array.isArray(takes) ? takes : [])
      .reduce((max, take) => Math.max(max, Number(take.compOrder) || 0), 0) + 1;
  }

  function getNextProcessedVersion(takes = [], sourceTakeId = "", presetId = "") {
    const currentMax = (Array.isArray(takes) ? takes : [])
      .filter((take) => take.processed && take.sourceTakeId === sourceTakeId && take.presetId === presetId)
      .reduce((max, take) => Math.max(max, Number(take.version) || 1), 0);
    return currentMax + 1;
  }

  window.PunchLabTakes = {
    compareBestTakesForComp,
    compareCompTakes,
    compareProcessedTimeline,
    compareProcessedVersions,
    compareTakeCreatedAt,
    formatTakeLatencyTag,
    getBatchSourceTargets,
    getBatchScopeEmptyText,
    getBatchScopeReadyText,
    getBatchTargets,
    getNextCompOrder,
    getNextProcessedVersion,
    getTakeCreatedTime,
    getTakeShortName,
    getTakeTitle,
    hasProcessedTakeForChain,
    makeTakeFilename,
    moveCompTakeOrder,
    normalizeCompOrder,
    slugifyTakeValue,
    sortBestTakesForComp,
    sortCompTakes,
    sortProcessedVersions,
    sortTakesByCreatedAt,
  };
})();
