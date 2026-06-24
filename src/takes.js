(() => {
  function getTakeCreatedTime(take = {}) {
    if (take.createdAt instanceof Date) {
      return take.createdAt.getTime();
    }

    const createdTime = new Date(take.createdAt || 0).getTime();
    return Number.isFinite(createdTime) ? createdTime : 0;
  }

  function getTakeCompOrder(take = {}) {
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

  function sortProcessedVersions(takes = []) {
    return [...(Array.isArray(takes) ? takes : [])].sort(compareProcessedVersions);
  }

  function getNextProcessedVersion(takes = [], sourceTakeId = "", presetId = "") {
    const currentMax = (Array.isArray(takes) ? takes : [])
      .filter((take) => take.processed && take.sourceTakeId === sourceTakeId && take.presetId === presetId)
      .reduce((max, take) => Math.max(max, Number(take.version) || 1), 0);
    return currentMax + 1;
  }

  window.PunchLabTakes = {
    compareCompTakes,
    compareProcessedTimeline,
    compareProcessedVersions,
    compareTakeCreatedAt,
    getNextProcessedVersion,
    getTakeCreatedTime,
    sortCompTakes,
    sortProcessedVersions,
    sortTakesByCreatedAt,
  };
})();
