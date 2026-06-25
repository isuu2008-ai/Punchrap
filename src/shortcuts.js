(() => {
  function isTypingTarget(target) {
    const tag = target?.tagName?.toLowerCase();
    return tag === "input" || tag === "select" || tag === "textarea" || Boolean(target?.isContentEditable);
  }

  function getShortcutTabIndex(code = "", maxTabs = 8) {
    if (!/^Digit[1-8]$/.test(code)) {
      return -1;
    }

    const index = Number(code.replace("Digit", "")) - 1;
    return index >= 0 && index < maxTabs ? index : -1;
  }

  function createGlobalShortcutHandler({ state, els, actions } = {}) {
    return function handleGlobalShortcut(event) {
      const isTyping = isTypingTarget(event.target) || isTypingTarget(document.activeElement);
      if ((event.ctrlKey || event.metaKey) && !event.altKey && !isTyping && state.activeView === "timeline") {
        if (event.code === "KeyZ" && event.shiftKey) {
          event.preventDefault();
          actions.redoTimelineEdit();
          return;
        }

        if (event.code === "KeyZ") {
          event.preventDefault();
          actions.undoTimelineEdit();
          return;
        }

        if (event.code === "KeyY") {
          event.preventDefault();
          actions.redoTimelineEdit();
          return;
        }
      }

      if (event.ctrlKey || event.metaKey || event.altKey || isTyping) {
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        actions.toggleSessionPlayback();
        return;
      }

      if (event.code === "KeyR") {
        event.preventDefault();
        actions.toggleRecord();
        return;
      }

      if (event.code === "KeyS") {
        event.preventDefault();
        actions.stopAll();
        return;
      }

      if (event.code === "KeyM") {
        event.preventDefault();
        actions.toggleMetronome();
        return;
      }

      const tabIndex = getShortcutTabIndex(event.code, els.viewTabs.length);
      if (tabIndex >= 0) {
        const tab = Array.from(els.viewTabs)[tabIndex];
        if (tab) {
          event.preventDefault();
          actions.setActiveView(tab.dataset.view);
        }
      }
    };
  }

  window.PunchLabShortcuts = {
    createGlobalShortcutHandler,
    getShortcutTabIndex,
    isTypingTarget,
  };
})();
