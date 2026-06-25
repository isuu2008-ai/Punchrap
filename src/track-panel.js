(() => {
  function requireValue(deps, name) {
    const value = deps[name];
    if (!value) {
      throw new Error(`PunchLab track panel dependency missing: ${name}`);
    }
    return value;
  }

  function requireHelper(deps, name) {
    const helper = deps[name];
    if (typeof helper !== "function") {
      throw new Error(`PunchLab track panel helper missing: ${name}`);
    }
    return helper;
  }

  function createTrackPanel(deps = {}) {
    const els = requireValue(deps, "els");
    const state = requireValue(deps, "state");
    const tracks = requireValue(deps, "tracks");
    const trackFolders = requireValue(deps, "trackFolders");
    const actions = requireValue(deps, "actions");
    const helpers = deps.helpers || {};
    const escapeHtml = requireHelper(helpers, "escapeHtml");
    const formatDuration = requireHelper(helpers, "formatDuration");
    const formatPan = requireHelper(helpers, "formatPan");
    const formatPercent = requireHelper(helpers, "formatPercent");
    const getTrackFolderTracks = requireHelper(helpers, "getTrackFolderTracks");
    const isTrackAudible = requireHelper(helpers, "isTrackAudible");

    function renderTracks() {
      const folderedTrackIds = window.PunchLabTracks.getFolderedTrackIds(trackFolders);
      const folderSections = trackFolders.map(renderTrackFolder).join("");
      const orphanRows = tracks
        .filter((track) => !folderedTrackIds.has(track.id))
        .map(renderTrackRow)
        .join("");
      els.trackList.innerHTML = folderSections + orphanRows;
      bindTrackListActions();
    }

    function bindTrackListActions() {
      els.trackList.querySelectorAll("[data-folder-toggle]").forEach((button) => {
        button.addEventListener("click", () => actions.toggleTrackFolder(button.dataset.folderToggle));
      });

      els.trackList.querySelectorAll("[data-folder-mute]").forEach((button) => {
        button.addEventListener("click", () => actions.toggleTrackFolderMute(button.dataset.folderMute));
      });

      els.trackList.querySelectorAll("[data-folder-solo]").forEach((button) => {
        button.addEventListener("click", () => actions.toggleTrackFolderSolo(button.dataset.folderSolo));
      });

      els.trackList.querySelectorAll("[data-arm]").forEach((button) => {
        button.addEventListener("click", () => setArmedTrack(button.dataset.arm));
      });

      els.trackList.querySelectorAll("[data-play-take]").forEach((button) => {
        button.addEventListener("click", () => actions.playTake(button.dataset.playTake));
      });

      els.trackList.querySelectorAll("[data-delete-take]").forEach((button) => {
        button.addEventListener("click", () => actions.deleteTake(button.dataset.deleteTake));
      });

      els.trackList.querySelectorAll("[data-track-mute]").forEach((button) => {
        button.addEventListener("click", () => actions.toggleTrackMute(button.dataset.trackMute));
      });

      els.trackList.querySelectorAll("[data-track-solo]").forEach((button) => {
        button.addEventListener("click", () => actions.toggleTrackSolo(button.dataset.trackSolo));
      });

      els.trackList.querySelectorAll("[data-track-volume]").forEach((input) => {
        input.addEventListener("input", () => actions.setTrackVolume(input.dataset.trackVolume, input.value));
      });

      els.trackList.querySelectorAll("[data-track-pan]").forEach((input) => {
        input.addEventListener("input", () => actions.setTrackPan(input.dataset.trackPan, input.value));
      });

      els.trackList.querySelectorAll("[data-track-name]").forEach((input) => {
        input.addEventListener("blur", () => actions.setTrackName(input.dataset.trackName, input.value));
        input.addEventListener("keydown", (event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            input.blur();
          }
        });
      });
    }

    function renderTrackFolder(folder) {
      const folderTracks = getTrackFolderTracks(folder.id);
      const isCollapsed = Boolean(state.trackFolderCollapsed[folder.id]);
      const takeCount = folderTracks.reduce((sum, track) => sum + track.takes.length, 0);
      const allMuted = folderTracks.length > 0 && folderTracks.every((track) => track.muted);
      const anySolo = folderTracks.some((track) => track.solo);
      const rows = isCollapsed ? "" : folderTracks.map(renderTrackRow).join("");

      return `
    <section class="track-folder ${isCollapsed ? "collapsed" : ""}" style="--track-color: ${folder.color}">
      <header class="track-folder-row">
        <button class="track-folder-toggle" type="button" data-folder-toggle="${folder.id}" aria-expanded="${String(!isCollapsed)}">
          ${isCollapsed ? "Show" : "Hide"}
        </button>
        <div class="track-folder-title">
          <span class="track-color"></span>
          <div>
            <strong>${escapeHtml(folder.name)}</strong>
            <small>${folderTracks.length} tracks / ${takeCount} takes</small>
          </div>
        </div>
        <div class="track-folder-actions">
          <button class="track-toggle ${allMuted ? "active" : ""}" type="button" data-folder-mute="${folder.id}" title="Mute ${folder.name}">M</button>
          <button class="track-toggle ${anySolo ? "active" : ""}" type="button" data-folder-solo="${folder.id}" title="Solo ${folder.name}">S</button>
        </div>
      </header>
      ${rows}
    </section>
  `;
    }

    function renderTrackRow(track) {
      const isArmed = track.id === state.armedTrackId;
      const isAudible = isTrackAudible(track);
      const pills = track.takes
        .map((take, index) => {
          const isPlaying = take.id === state.currentTakeId || state.sessionPlayingTakeIds.has(take.id);
          return `
        <div class="take-chip">
          <button class="take-pill ${isPlaying ? "playing" : ""}" type="button" data-play-take="${take.id}">
            ${isPlaying ? "Pause" : "Play"} T${index + 1} ${formatDuration(take.duration)} @${formatDuration(take.startTime || 0)}
          </button>
          <button class="take-delete" type="button" data-delete-take="${take.id}" title="Delete take">Del</button>
        </div>
      `;
        })
        .join("");

      return `
    <div class="track-row ${isArmed ? "armed" : ""} ${isAudible ? "" : "muted"}" style="--track-color: ${track.color}">
      <div class="track-name">
        <span class="track-color"></span>
        <span class="track-name-fields">
          <input class="track-name-input" type="text" value="${escapeHtml(track.name)}" data-track-name="${track.id}" aria-label="${escapeHtml(track.name)} track name" />
          <small>${formatPercent(track.volume)} ${formatPan(track.pan)}</small>
        </span>
      </div>
      <div class="take-strip">${pills || `<span class="eyebrow">No takes</span>`}</div>
      <div class="track-actions">
        <button class="track-toggle ${track.muted ? "active" : ""}" type="button" data-track-mute="${track.id}" title="Mute ${track.name}">M</button>
        <button class="track-toggle ${track.solo ? "active" : ""}" type="button" data-track-solo="${track.id}" title="Solo ${track.name}">S</button>
        <label class="mini-slider">
          <span>Vol</span>
          <input type="range" min="0" max="1" step="0.01" value="${track.volume}" data-track-volume="${track.id}" />
        </label>
        <label class="mini-slider">
          <span>Pan</span>
          <input type="range" min="-1" max="1" step="0.05" value="${track.pan}" data-track-pan="${track.id}" />
        </label>
        <button class="icon-button" type="button" data-arm="${track.id}" title="Arm ${track.name}">
          Arm
        </button>
      </div>
    </div>
  `;
    }

    function renderArmTracks() {
      els.armTrackList.innerHTML = tracks
        .map((track) => {
          const isArmed = track.id === state.armedTrackId;
          return `
        <button class="arm-button ${isArmed ? "active" : ""}" type="button" data-arm-quick="${track.id}" style="--track-color: ${track.color}">
          <span></span>
          ${track.name}
          <small>${track.takes.length}</small>
        </button>
      `;
        })
        .join("");

      els.armTrackList.querySelectorAll("[data-arm-quick]").forEach((button) => {
        button.addEventListener("click", () => setArmedTrack(button.dataset.armQuick));
      });
    }

    function setArmedTrack(trackId) {
      state.armedTrackId = trackId;
      const track = tracks.find((item) => item.id === state.armedTrackId);
      if (track) {
        els.armedTrackName.textContent = track.name;
      }
      renderTracks();
      renderArmTracks();
    }

    return {
      renderArmTracks,
      renderTracks,
    };
  }

  window.PunchLabTrackPanel = {
    createTrackPanel,
  };
})();
