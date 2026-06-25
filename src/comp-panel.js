(() => {
  function requireValue(deps, name) {
    const value = deps[name];
    if (!value) {
      throw new Error(`PunchLab comp panel dependency missing: ${name}`);
    }
    return value;
  }

  function requireFunction(deps, name, type = "dependency") {
    const value = deps[name];
    if (typeof value !== "function") {
      throw new Error(`PunchLab comp panel ${type} missing: ${name}`);
    }
    return value;
  }

  function createCompPanel(deps = {}) {
    const els = requireValue(deps, "els");
    const state = requireValue(deps, "state");
    const actions = deps.actions || {};
    const helpers = deps.helpers || {};
    const addCompTake = requireFunction(actions, "addCompTake", "action");
    const moveCompTake = requireFunction(actions, "moveCompTake", "action");
    const removeCompTake = requireFunction(actions, "removeCompTake", "action");
    const escapeHtml = requireFunction(helpers, "escapeHtml", "helper");
    const getAllTakes = requireFunction(helpers, "getAllTakes", "helper");
    const getCompTakes = requireFunction(helpers, "getCompTakes", "helper");
    const getTakeSubtitle = requireFunction(helpers, "getTakeSubtitle", "helper");
    const getTakeTitle = requireFunction(helpers, "getTakeTitle", "helper");
    const renderCompPoolRow = requireFunction(helpers, "renderCompPoolRow", "helper");
    const renderTakeWaveform = requireFunction(helpers, "renderTakeWaveform", "helper");

    function renderCompView() {
      if (!els.compLaneList || !els.compPoolList) {
        return;
      }

      const compTakes = getCompTakes();
      const poolTakes = getAllTakes().filter((take) => !take.compSelected);
      const bestPoolCount = poolTakes.filter((take) => take.bestTake).length;
      els.compLaneMeta.textContent = `${compTakes.length} take${compTakes.length === 1 ? "" : "s"}`;
      els.compPoolMeta.textContent = `${poolTakes.length} available`;
      els.compPlayButton.disabled = !state.isQueuePlaying && compTakes.length === 0;
      els.compClearButton.disabled = compTakes.length === 0;
      els.compBestButton.disabled = bestPoolCount === 0;
      els.compPlayButton.classList.toggle("queue-active", state.isQueuePlaying && state.queueMode === "comp");
      els.compPlayButton.querySelector(".button-label").textContent =
        state.isQueuePlaying && state.queueMode === "comp" ? "Stop comp" : "Play comp";

      els.compLaneList.innerHTML = compTakes.length
        ? compTakes
          .map((take, index) => renderCompLaneRow(take, index, compTakes.length))
          .join("")
        : `<span class="empty-takes">Select takes from the pool or Takes tab.</span>`;

      els.compPoolList.innerHTML = poolTakes.length
        ? poolTakes.map((take, index) => renderCompPoolRow(take, index)).join("")
        : `<span class="empty-takes">No unselected takes.</span>`;

      bindCompActions();
    }

    function renderCompLaneRow(take, index, total) {
      const isPlaying = take.id === state.currentTakeId || state.sessionPlayingTakeIds.has(take.id);
      return `
    <div class="comp-row ${isPlaying ? "active" : ""}">
      <div class="comp-order">${index + 1}</div>
      <div class="comp-row-main">
        <strong>${escapeHtml(getTakeTitle(take, index))}</strong>
        ${take.bestTake ? `<span class="take-badge">Best</span>` : ""}
        <small>${escapeHtml(getTakeSubtitle(take))}</small>
        ${renderTakeWaveform(take)}
      </div>
      <div class="comp-row-actions">
        <button class="mini-button" type="button" data-comp-move="${take.id}" data-delta="-1" ${index === 0 ? "disabled" : ""}>Up</button>
        <button class="mini-button" type="button" data-comp-move="${take.id}" data-delta="1" ${index === total - 1 ? "disabled" : ""}>Down</button>
        <button class="mini-button danger" type="button" data-comp-remove="${take.id}">Remove</button>
      </div>
    </div>
  `;
    }

    function bindCompActions() {
      els.compLaneList.querySelectorAll("[data-comp-move]").forEach((button) => {
        button.addEventListener("click", () => moveCompTake(button.dataset.compMove, Number(button.dataset.delta)));
      });
      els.compLaneList.querySelectorAll("[data-comp-remove]").forEach((button) => {
        button.addEventListener("click", () => removeCompTake(button.dataset.compRemove));
      });
      els.compPoolList.querySelectorAll("[data-comp-add]").forEach((button) => {
        button.addEventListener("click", () => addCompTake(button.dataset.compAdd));
      });
    }

    return {
      renderCompView,
    };
  }

  window.PunchLabCompPanel = {
    createCompPanel,
  };
})();
