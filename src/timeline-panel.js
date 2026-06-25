(() => {
  function requireValue(deps, name) {
    const value = deps[name];
    if (!value) {
      throw new Error(`PunchLab timeline panel dependency missing: ${name}`);
    }
    return value;
  }

  function requireHelper(deps, name) {
    const helper = deps[name];
    if (typeof helper !== "function") {
      throw new Error(`PunchLab timeline panel helper missing: ${name}`);
    }
    return helper;
  }

  function createTimelinePanel(deps = {}) {
    const els = requireValue(deps, "els");
    const state = requireValue(deps, "state");
    const actions = requireValue(deps, "actions");
    const helpers = deps.helpers || {};
    const escapeHtml = requireHelper(helpers, "escapeHtml");
    const formatDuration = requireHelper(helpers, "formatDuration");
    const formatTimelineInputTime = requireHelper(helpers, "formatTimelineInputTime");
    const getAllTakes = requireHelper(helpers, "getAllTakes");
    const getLyricLineCount = requireHelper(helpers, "getLyricLineCount");
    const getRegionGroupLabel = requireHelper(helpers, "getRegionGroupLabel");
    const getTakeClipGain = requireHelper(helpers, "getTakeClipGain");
    const getTakeFadeIn = requireHelper(helpers, "getTakeFadeIn");
    const getTakeFadeOut = requireHelper(helpers, "getTakeFadeOut");
    const getTakeRegionColor = requireHelper(helpers, "getTakeRegionColor");
    const getTakeRegionGroup = requireHelper(helpers, "getTakeRegionGroup");
    const getTakeShortName = requireHelper(helpers, "getTakeShortName");
    const getTakeSourceOffset = requireHelper(helpers, "getTakeSourceOffset");
    const getTakeTitle = requireHelper(helpers, "getTakeTitle");
    const getTakeVisibleDuration = requireHelper(helpers, "getTakeVisibleDuration");
    const getTimelineEndPosition = requireHelper(helpers, "getTimelineEndPosition");
    const getTimelineCursorPosition = requireHelper(helpers, "getTimelineCursorPosition");
    const makeTimelineGridLines = requireHelper(helpers, "makeTimelineGridLines");
    const makeTimelineTicks = requireHelper(helpers, "makeTimelineTicks");
    const normalizeMarkers = requireHelper(helpers, "normalizeMarkers");
    const renderTimelineCursor = requireHelper(helpers, "renderTimelineCursor");
    const renderRegionGroupOptions = requireHelper(helpers, "renderRegionGroupOptions");
    const timelinePercent = requireHelper(helpers, "timelinePercent");
    const updateTimelineGridMeta = requireHelper(helpers, "updateTimelineGridMeta");

    function renderTimeline() {
      if (!els.timelineRegions) {
        return;
      }

      const timelineEnd = getTimelineEndPosition();
      const beatDuration = els.beatAudio.src && Number.isFinite(els.beatAudio.duration) ? els.beatAudio.duration : 0;
      const takes = getAllTakes();
      const markers = normalizeMarkers(state.markers);
      state.markers = markers;
      els.timelineLength.textContent = formatDuration(timelineEnd);

      els.timelineRuler.innerHTML = makeTimelineTicks(timelineEnd)
        .map(
          (tick) => `
        <span class="timeline-tick" style="left: ${timelinePercent(tick, timelineEnd)}%">
          <span>${formatDuration(tick)}</span>
        </span>
      `,
        )
        .join("");

      els.timelineGrid.innerHTML = makeTimelineGridLines(timelineEnd)
        .map(
          (line) => `
        <span class="timeline-grid-line ${line.isBar ? "bar" : "beat"}" style="left: ${timelinePercent(line.time, timelineEnd)}%">
          ${line.label ? `<span>${line.label}</span>` : ""}
        </span>
      `,
        )
        .join("");
      updateTimelineGridMeta();

      els.timelineMarkers.innerHTML = markers
        .map(
          (marker) => `
        <span class="timeline-marker" style="left: ${timelinePercent(marker.time, timelineEnd)}%">
          <span title="${escapeHtml(marker.comment || marker.type)}">${escapeHtml(marker.type)}</span>
        </span>
      `,
        )
        .join("");

      els.timelineRegions.innerHTML = renderBeatRegion(beatDuration, timelineEnd) + renderTakeRegions(takes, timelineEnd);
      renderTimelineCursor(timelineEnd, getTimelineCursorPosition());
      renderTimelineMarkerSummary(markers);
      renderRegionList(takes);
      bindRegionListActions();
    }

    function renderBeatRegion(beatDuration, timelineEnd) {
      return beatDuration
        ? `
      <div class="timeline-region beat-region" style="left: 0%; width: ${timelinePercent(beatDuration, timelineEnd)}%; --track-color: var(--lime);">
        <strong>${escapeHtml(state.beatFileName || "Beat")}</strong>
      </div>
    `
        : "";
    }

    function renderTakeRegions(takes, timelineEnd) {
      return takes
        .map((take, index) => {
          const start = take.startTime || 0;
          const width = Math.max(1.2, timelinePercent(take.duration || 0.2, timelineEnd));
          const left = timelinePercent(start, timelineEnd);
          const regionColor = getTakeRegionColor(take);
          return `
        <div class="timeline-region take-region" style="left: ${left}%; width: ${width}%; --row-index: ${index}; --track-color: ${regionColor};">
          <strong>${escapeHtml(getTakeShortName(take))}</strong>
          <small>${escapeHtml(getRegionGroupLabel(getTakeRegionGroup(take)))}</small>
        </div>
      `;
        })
        .join("");
    }

    function renderRegionList(takes) {
      els.regionList.innerHTML = takes.length
        ? takes
          .map(
            (take, index) => `
          <div class="region-row">
            <header>
              <strong>${escapeHtml(getTakeTitle(take, index))}</strong>
              <div class="region-header-actions">
                <small>${escapeHtml(take.trackName)}</small>
                <button class="mini-button" type="button" data-duplicate-region="${take.id}">Copy</button>
                <button class="mini-button danger" type="button" data-delete-region="${take.id}">Del</button>
              </div>
            </header>
            <input class="region-name-input" type="text" value="${escapeHtml(getTakeTitle(take, index))}" data-region-name="${take.id}" />
            <label class="region-color-control">
              Color
              <span>
                <i style="--region-color: ${getTakeRegionColor(take)};"></i>
                <input type="color" value="${getTakeRegionColor(take)}" data-region-color="${take.id}" />
              </span>
            </label>
            <label class="region-group-control">
              Group
              <select data-region-group="${take.id}">
                ${renderRegionGroupOptions(getTakeRegionGroup(take))}
              </select>
            </label>
            <div class="region-actions">
              <button class="mini-button" type="button" data-nudge-region="${take.id}" data-delta="-0.1">-0.1</button>
              <input type="number" min="0" step="0.1" value="${formatTimelineInputTime(take.startTime || 0)}" data-region-start="${take.id}" />
              <button class="mini-button" type="button" data-nudge-region="${take.id}" data-delta="0.1">+0.1</button>
            </div>
            <div class="region-controls region-trim-controls">
              <label>
                Source
                <input type="number" min="0" step="0.05" value="${getTakeSourceOffset(take).toFixed(2)}" data-region-source-offset="${take.id}" />
              </label>
              <label>
                Length
                <input type="number" min="0.05" step="0.05" value="${getTakeVisibleDuration(take).toFixed(2)}" data-region-duration="${take.id}" />
              </label>
            </div>
            <div class="region-controls">
              <label>
                Gain
                <input type="number" min="0" max="3" step="0.05" value="${getTakeClipGain(take).toFixed(2)}" data-region-gain="${take.id}" />
              </label>
              <label>
                In
                <input type="number" min="0" step="0.05" value="${getTakeFadeIn(take).toFixed(2)}" data-region-fade-in="${take.id}" />
              </label>
              <label>
                Out
                <input type="number" min="0" step="0.05" value="${getTakeFadeOut(take).toFixed(2)}" data-region-fade-out="${take.id}" />
              </label>
            </div>
          </div>
        `,
          )
          .join("")
        : `<span class="empty-takes">No regions</span>`;
    }

    function bindRegionListActions() {
      els.regionList.querySelectorAll("[data-region-start]").forEach((input) => {
        input.addEventListener("change", () => actions.setRegionStart(input.dataset.regionStart, input.value));
      });
      els.regionList.querySelectorAll("[data-region-name]").forEach((input) => {
        input.addEventListener("change", () => actions.setRegionName(input.dataset.regionName, input.value));
      });
      els.regionList.querySelectorAll("[data-region-gain]").forEach((input) => {
        input.addEventListener("change", () => actions.setRegionClipGain(input.dataset.regionGain, input.value));
      });
      els.regionList.querySelectorAll("[data-region-color]").forEach((input) => {
        input.addEventListener("change", () => actions.setRegionColor(input.dataset.regionColor, input.value));
      });
      els.regionList.querySelectorAll("[data-region-group]").forEach((select) => {
        select.addEventListener("change", () => actions.setRegionGroup(select.dataset.regionGroup, select.value));
      });
      els.regionList.querySelectorAll("[data-region-source-offset]").forEach((input) => {
        input.addEventListener("change", () => actions.setRegionSourceOffset(input.dataset.regionSourceOffset, input.value));
      });
      els.regionList.querySelectorAll("[data-region-duration]").forEach((input) => {
        input.addEventListener("change", () => actions.setRegionDuration(input.dataset.regionDuration, input.value));
      });
      els.regionList.querySelectorAll("[data-region-fade-in]").forEach((input) => {
        input.addEventListener("change", () => actions.setRegionFade(input.dataset.regionFadeIn, "in", input.value));
      });
      els.regionList.querySelectorAll("[data-region-fade-out]").forEach((input) => {
        input.addEventListener("change", () => actions.setRegionFade(input.dataset.regionFadeOut, "out", input.value));
      });
      els.regionList.querySelectorAll("[data-nudge-region]").forEach((button) => {
        button.addEventListener("click", () => actions.nudgeRegionStart(button.dataset.nudgeRegion, Number(button.dataset.delta)));
      });
      els.regionList.querySelectorAll("[data-duplicate-region]").forEach((button) => {
        button.addEventListener("click", () => actions.duplicateTimelineRegion(button.dataset.duplicateRegion));
      });
      els.regionList.querySelectorAll("[data-delete-region]").forEach((button) => {
        button.addEventListener("click", () => actions.deleteTake(button.dataset.deleteRegion));
      });
    }

    function renderTimelineMarkerSummary(markers = normalizeMarkers(state.markers)) {
      if (!els.markerList) {
        return;
      }

      els.markerList.innerHTML = markers.length
        ? markers
          .map((marker) => {
            const lyricLineCount = getLyricLineCount(marker.lyrics);
            const lyricMeta = lyricLineCount ? ` / ${lyricLineCount} lines` : "";
            const commentMeta = marker.comment ? " / note" : "";
            return `
          <div class="marker-row">
            <header>
              <strong>${escapeHtml(marker.type)}</strong>
              <button class="mini-button danger" type="button" data-delete-marker="${marker.id}">Del</button>
            </header>
            <small>${formatDuration(marker.time)}${lyricMeta}${commentMeta}</small>
            <textarea class="marker-comment-input" spellcheck="false" data-marker-comment="${marker.id}" placeholder="Marker comment...">${escapeHtml(marker.comment)}</textarea>
          </div>
        `;
          })
          .join("")
        : `<span class="empty-takes">No markers</span>`;

      els.markerList.querySelectorAll("[data-delete-marker]").forEach((button) => {
        button.addEventListener("click", () => actions.deleteTimelineMarker(button.dataset.deleteMarker));
      });
      els.markerList.querySelectorAll("[data-marker-comment]").forEach((textarea) => {
        textarea.addEventListener("focus", () => {
          textarea.dataset.historyRecorded = "0";
        });
        textarea.addEventListener("input", () => actions.updateMarkerComment(textarea.dataset.markerComment, textarea.value, textarea));
        textarea.addEventListener("blur", () => {
          textarea.dataset.historyRecorded = "0";
        });
      });
    }

    return {
      renderTimeline,
      renderTimelineMarkerSummary,
    };
  }

  window.PunchLabTimelinePanel = {
    createTimelinePanel,
  };
})();
