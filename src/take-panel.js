(() => {
  function requireValue(deps, name) {
    const value = deps[name];
    if (!value) {
      throw new Error(`PunchLab take panel dependency missing: ${name}`);
    }
    return value;
  }

  function requireFunction(deps, name, type = "dependency") {
    const value = deps[name];
    if (typeof value !== "function") {
      throw new Error(`PunchLab take panel ${type} missing: ${name}`);
    }
    return value;
  }

  function createTakePanel(deps = {}) {
    const els = requireValue(deps, "els");
    const state = requireValue(deps, "state");
    const actions = deps.actions || {};
    const helpers = deps.helpers || {};
    const deleteTake = requireFunction(actions, "deleteTake", "action");
    const downloadTakeWav = requireFunction(actions, "downloadTakeWav", "action");
    const playTake = requireFunction(actions, "playTake", "action");
    const renderCompView = requireFunction(actions, "renderCompView", "action");
    const renderExportPanel = requireFunction(actions, "renderExportPanel", "action");
    const renderTimeline = requireFunction(actions, "renderTimeline", "action");
    const renderVocalPanel = requireFunction(actions, "renderVocalPanel", "action");
    const sendTakeToVocal = requireFunction(actions, "sendTakeToVocal", "action");
    const setTakeName = requireFunction(actions, "setTakeName", "action");
    const toggleBestTake = requireFunction(actions, "toggleBestTake", "action");
    const toggleCompTake = requireFunction(actions, "toggleCompTake", "action");
    const updateExportButtons = requireFunction(actions, "updateExportButtons", "action");
    const updateQueueButton = requireFunction(actions, "updateQueueButton", "action");
    const escapeHtml = requireFunction(helpers, "escapeHtml", "helper");
    const findTake = requireFunction(helpers, "findTake", "helper");
    const formatDuration = requireFunction(helpers, "formatDuration", "helper");
    const getAllTakes = requireFunction(helpers, "getAllTakes", "helper");
    const getTakeShortName = requireFunction(helpers, "getTakeShortName", "helper");
    const getTakeSubtitle = requireFunction(helpers, "getTakeSubtitle", "helper");
    const getTakeTitle = requireFunction(helpers, "getTakeTitle", "helper");
    const makeTakeFilename = requireFunction(helpers, "makeTakeFilename", "helper");
    const renderTakeWaveform = requireFunction(helpers, "renderTakeWaveform", "helper");

    function renderTakes() {
      const allTakes = getAllTakes();
      els.takesList.innerHTML = allTakes.length
        ? allTakes.map(renderTakeRow).join("")
        : `<span class="empty-takes">No takes yet</span>`;

      bindTakeListActions();
      updateQueueButton();
      updateExportButtons();
      renderQuickTakeReview(allTakes);
      renderCompView();
      renderVocalPanel();
      renderTimeline();
      renderExportPanel();
    }

    function renderTakeRow(take, index) {
      const isPlaying = take.id === state.currentTakeId || state.sessionPlayingTakeIds.has(take.id);
      return `
        <div class="take-item">
          <div class="take-main">
            <strong>${escapeHtml(getTakeTitle(take, index))}</strong>
            <small>${getTakeSubtitle(take)}</small>
            <input class="take-name-input" type="text" value="${escapeHtml(getTakeTitle(take, index))}" data-take-name="${take.id}" aria-label="Take name" maxlength="48" />
            ${renderTakeWaveform(take)}
          </div>
          <div class="take-controls">
            <button class="mini-button ${isPlaying ? "active" : ""}" type="button" data-play-take="${take.id}">
              ${isPlaying ? "Pause" : "Play"}
            </button>
            <button class="mini-button ${take.compSelected ? "active" : ""}" type="button" data-comp-take="${take.id}">
              Comp
            </button>
            <button class="mini-button ${take.bestTake ? "active" : ""}" type="button" data-best-take="${take.id}">
              Best
            </button>
            <button class="mini-button" type="button" data-download-take="${take.id}" title="Download WAV">Download WAV</button>
            <a href="${take.url}" download="${makeTakeFilename(take)}">Save</a>
            <button class="mini-button danger" type="button" data-delete-take="${take.id}">Del</button>
          </div>
        </div>
      `;
    }

    function bindTakeListActions() {
      els.takesList.querySelectorAll("[data-play-take]").forEach((button) => {
        button.addEventListener("click", () => playTake(button.dataset.playTake));
      });

      els.takesList.querySelectorAll("[data-delete-take]").forEach((button) => {
        button.addEventListener("click", () => deleteTake(button.dataset.deleteTake));
      });

      els.takesList.querySelectorAll("[data-comp-take]").forEach((button) => {
        button.addEventListener("click", () => toggleCompTake(button.dataset.compTake));
      });

      els.takesList.querySelectorAll("[data-best-take]").forEach((button) => {
        button.addEventListener("click", () => toggleBestTake(button.dataset.bestTake));
      });

      els.takesList.querySelectorAll("[data-download-take]").forEach((button) => {
        button.addEventListener("click", () => downloadTakeWav(button.dataset.downloadTake));
      });

      els.takesList.querySelectorAll("[data-take-name]").forEach((input) => {
        input.addEventListener("change", () => setTakeName(input.dataset.takeName, input.value, "Take renamed"));
        input.addEventListener("keydown", (event) => {
          if (event.key === "Enter") {
            input.blur();
          }
        });
      });
    }

    function renderQuickTakeReview(allTakes = getAllTakes()) {
      if (!els.quickTakeTitle || !els.quickTakeMeta || !els.playLatestTakeButton || !els.quickTakeList) {
        return;
      }

      const latestTake = state.latestTake || allTakes.at(-1);
      const recentTakes = allTakes.slice(-4).reverse();
      const latestIsPlaying = latestTake && (state.currentTakeId === latestTake.id || state.sessionPlayingTakeIds.has(latestTake.id));

      els.quickTakeTitle.textContent = latestTake ? getTakeShortName(latestTake) : "No take yet";
      els.quickTakeMeta.textContent = latestTake
        ? `${latestTake.trackName} / ${getTakeSubtitle(latestTake)}`
        : "Record a take to review it here.";
      els.playLatestTakeButton.disabled = !latestTake || state.isRecording;
      els.playLatestTakeButton.textContent = latestIsPlaying ? "Pause latest" : "Play latest";
      els.playLatestTakeButton.classList.toggle("active", Boolean(latestIsPlaying));
      if (els.sendLatestToVocalButton) {
        els.sendLatestToVocalButton.disabled = !latestTake || state.isRecording;
      }
      els.quickTakeList.innerHTML = recentTakes.length
        ? recentTakes.map(renderQuickTakeCard).join("")
        : `<span class="empty-takes">Recent takes will appear here</span>`;

      bindQuickTakeActions();
    }

    function renderQuickTakeCard(take) {
      const isPlaying = take.id === state.currentTakeId || state.sessionPlayingTakeIds.has(take.id);
      const disabled = state.isRecording ? "disabled" : "";
      return `
          <article class="quick-take-card">
            <button class="quick-take-button ${isPlaying ? "active" : ""}" type="button" data-quick-play-take="${take.id}" ${disabled}>
              <strong>${escapeHtml(getTakeShortName(take))}</strong>
              <span>${escapeHtml(formatDuration(take.duration))}</span>
            </button>
            <button class="mini-button quick-take-vocal" type="button" data-quick-vocal-take="${take.id}" ${disabled}>Vocal</button>
          </article>
        `;
    }

    function bindQuickTakeActions() {
      els.quickTakeList.querySelectorAll("[data-quick-play-take]").forEach((button) => {
        button.addEventListener("click", () => {
          const take = findTake(button.dataset.quickPlayTake);
          if (take) {
            state.latestTake = take;
          }
          playTake(button.dataset.quickPlayTake);
        });
      });

      els.quickTakeList.querySelectorAll("[data-quick-vocal-take]").forEach((button) => {
        button.addEventListener("click", () => sendTakeToVocal(button.dataset.quickVocalTake));
      });
    }

    return {
      renderQuickTakeReview,
      renderTakes,
    };
  }

  window.PunchLabTakePanel = {
    createTakePanel,
  };
})();
