(() => {
  function supportsFileSystemAccess() {
    return typeof window.showSaveFilePicker === "function" && typeof window.showOpenFilePicker === "function";
  }

  async function saveBlob(blob, suggestedName, pickerOptions = {}) {
    if (typeof window.showSaveFilePicker === "function") {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName,
          ...pickerOptions,
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return { canceled: false, method: "file-system", handle };
      } catch (error) {
        if (error?.name === "AbortError") {
          return { canceled: true, method: "file-system" };
        }
        console.warn("PunchLab file picker save failed; falling back to download.", error);
      }
    }

    downloadBlob(blob, suggestedName);
    return { canceled: false, method: "download" };
  }

  async function openProjectFile(fallbackInput = null) {
    if (typeof window.showOpenFilePicker === "function") {
      try {
        const [handle] = await window.showOpenFilePicker({
          multiple: false,
          types: [
            {
              description: "PunchLab project",
              accept: {
                "application/json": [".json", ".punchlab.json"],
              },
            },
          ],
        });
        return { canceled: false, method: "file-system", file: await handle.getFile(), handle };
      } catch (error) {
        if (error?.name === "AbortError") {
          return { canceled: true, method: "file-system" };
        }
        console.warn("PunchLab file picker open failed; falling back to file input.", error);
      }
    }

    fallbackInput?.click();
    return { canceled: false, method: "input" };
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  window.PunchLabFiles = {
    openProjectFile,
    saveBlob,
    supportsFileSystemAccess,
  };
})();
