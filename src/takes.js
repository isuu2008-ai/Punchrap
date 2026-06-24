(() => {
  function getTakeCreatedTime(take = {}) {
    if (take.createdAt instanceof Date) {
      return take.createdAt.getTime();
    }

    const createdTime = new Date(take.createdAt || 0).getTime();
    return Number.isFinite(createdTime) ? createdTime : 0;
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
    getNextCompOrder,
    getNextProcessedVersion,
    getTakeCreatedTime,
    moveCompTakeOrder,
    normalizeCompOrder,
    sortBestTakesForComp,
    sortCompTakes,
    sortProcessedVersions,
    sortTakesByCreatedAt,
  };
})();
