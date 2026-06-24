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

  window.PunchLabShortcuts = {
    getShortcutTabIndex,
    isTypingTarget,
  };
})();
