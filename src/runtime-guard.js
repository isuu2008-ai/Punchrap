(() => {
  function bindGlobalErrorHandlers({ getStatusElement = () => null } = {}) {
    window.addEventListener("error", (event) => {
      reportRuntimeError(event.error || event.message, getStatusElement);
    });
    window.addEventListener("unhandledrejection", (event) => {
      reportRuntimeError(event.reason || "Unhandled promise rejection", getStatusElement);
    });
  }

  function reportRuntimeError(error, getStatusElement) {
    const statusElement = getStatusElement();
    if (statusElement) {
      statusElement.textContent = "App error";
    }
    console.error(error);
  }

  window.PunchLabRuntimeGuard = {
    bindGlobalErrorHandlers,
  };
})();
