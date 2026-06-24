(() => {
  const DB_NAME = "punchlab";
  const DB_VERSION = 1;
  const STORE_NAME = "autosave";
  const AUTOSAVE_KEY = "latest";

  async function saveAutosave(bundle) {
    const db = await openDb();
    await requestToPromise(db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).put(bundle, AUTOSAVE_KEY));
    db.close();
  }

  async function loadAutosave() {
    const db = await openDb();
    const bundle = await requestToPromise(db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(AUTOSAVE_KEY));
    db.close();
    return bundle || null;
  }

  async function hasAutosave() {
    return Boolean(await loadAutosave());
  }

  async function clearAutosave() {
    const db = await openDb();
    await requestToPromise(db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).delete(AUTOSAVE_KEY));
    db.close();
  }

  function openDb() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.addEventListener("upgradeneeded", () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      });
      request.addEventListener("success", () => resolve(request.result));
      request.addEventListener("error", () => reject(request.error));
    });
  }

  function requestToPromise(request) {
    return new Promise((resolve, reject) => {
      request.addEventListener("success", () => resolve(request.result));
      request.addEventListener("error", () => reject(request.error));
    });
  }

  window.PunchLabStorage = {
    clearAutosave,
    hasAutosave,
    loadAutosave,
    saveAutosave,
  };
})();
