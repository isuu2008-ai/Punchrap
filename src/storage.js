(() => {
  const DB_NAME = "punchlab";
  const DB_VERSION = 2;
  const STORE_NAME = "autosave";
  const BACKUP_STORE_NAME = "backups";
  const AUTOSAVE_KEY = "latest";
  const MAX_BACKUPS = 5;

  async function saveAutosave(bundle) {
    const db = await openDb();
    await requestToPromise(db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).put(bundle, AUTOSAVE_KEY));
    db.close();
  }

  async function saveBackup(bundle) {
    const db = await openDb();
    try {
      const savedAt = new Date().toISOString();
      const id = `backup-${Date.now()}`;
      await putBackupRecord(db, { id, savedAt, bundle });
      await pruneBackups(db);
    } finally {
      db.close();
    }
  }

  async function loadAutosave() {
    const db = await openDb();
    const bundle = await requestToPromise(db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(AUTOSAVE_KEY));
    db.close();
    return bundle || null;
  }

  async function loadLatestBackup() {
    const db = await openDb();
    const backups = await requestToPromise(db.transaction(BACKUP_STORE_NAME, "readonly").objectStore(BACKUP_STORE_NAME).getAll());
    db.close();
    return backups
      .filter((backup) => backup?.bundle)
      .sort((a, b) => String(b.savedAt || "").localeCompare(String(a.savedAt || "")))[0] || null;
  }

  async function listBackups() {
    const db = await openDb();
    const backups = await requestToPromise(db.transaction(BACKUP_STORE_NAME, "readonly").objectStore(BACKUP_STORE_NAME).getAll());
    db.close();
    return backups
      .filter((backup) => backup?.bundle)
      .sort((a, b) => String(b.savedAt || "").localeCompare(String(a.savedAt || "")))
      .map((backup) => ({
        id: backup.id,
        savedAt: backup.savedAt,
        beatName: backup.bundle?.beat?.fileName || "",
        title: backup.bundle?.settings?.exportMetadata?.title || "",
      }));
  }

  async function loadBackup(id) {
    if (!id) {
      return null;
    }

    const db = await openDb();
    const backup = await requestToPromise(db.transaction(BACKUP_STORE_NAME, "readonly").objectStore(BACKUP_STORE_NAME).get(id));
    db.close();
    return backup?.bundle ? backup : null;
  }

  async function hasAutosave() {
    return Boolean(await loadAutosave());
  }

  async function hasRecovery() {
    return Boolean((await loadAutosave()) || (await loadLatestBackup()));
  }

  function formatBackupHistoryLabel(backup = {}, index = 0, locale = []) {
    const when = backup.savedAt ? new Date(backup.savedAt) : null;
    const fallback = `Backup ${index + 1}`;
    const time = when && !Number.isNaN(when.getTime())
      ? when.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })
      : fallback;
    const name = backup.title || backup.beatName || fallback;
    return `${time} ${name}`;
  }

  async function clearAutosave() {
    const db = await openDb();
    await requestToPromise(db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).delete(AUTOSAVE_KEY));
    db.close();
  }

  async function clearBackups() {
    const db = await openDb();
    await requestToPromise(db.transaction(BACKUP_STORE_NAME, "readwrite").objectStore(BACKUP_STORE_NAME).clear());
    db.close();
  }

  async function clearRecovery() {
    const db = await openDb();
    try {
      const transaction = db.transaction([STORE_NAME, BACKUP_STORE_NAME], "readwrite");
      const transactionDone = transactionToPromise(transaction);
      transaction.objectStore(STORE_NAME).delete(AUTOSAVE_KEY);
      transaction.objectStore(BACKUP_STORE_NAME).clear();
      await transactionDone;
    } finally {
      db.close();
    }
  }

  function openDb() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.addEventListener("upgradeneeded", () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
        if (!db.objectStoreNames.contains(BACKUP_STORE_NAME)) {
          db.createObjectStore(BACKUP_STORE_NAME);
        }
      });
      request.addEventListener("success", () => resolve(request.result));
      request.addEventListener("error", () => reject(request.error));
    });
  }

  async function putBackupRecord(db, backup) {
    const transaction = db.transaction(BACKUP_STORE_NAME, "readwrite");
    const transactionDone = transactionToPromise(transaction);
    transaction.objectStore(BACKUP_STORE_NAME).put(backup, backup.id);
    await transactionDone;
  }

  async function pruneBackups(db) {
    const keysTransaction = db.transaction(BACKUP_STORE_NAME, "readonly");
    const keys = await requestToPromise(keysTransaction.objectStore(BACKUP_STORE_NAME).getAllKeys());
    const staleKeys = keys
      .map((key) => String(key))
      .sort()
      .slice(0, Math.max(0, keys.length - MAX_BACKUPS));

    if (!staleKeys.length) {
      return;
    }

    const transaction = db.transaction(BACKUP_STORE_NAME, "readwrite");
    const transactionDone = transactionToPromise(transaction);
    const store = transaction.objectStore(BACKUP_STORE_NAME);
    staleKeys.forEach((key) => store.delete(key));
    await transactionDone;
  }

  function requestToPromise(request) {
    return new Promise((resolve, reject) => {
      request.addEventListener("success", () => resolve(request.result));
      request.addEventListener("error", () => reject(request.error));
    });
  }

  function transactionToPromise(transaction) {
    return new Promise((resolve, reject) => {
      transaction.addEventListener("complete", () => resolve());
      transaction.addEventListener("abort", () => reject(transaction.error));
      transaction.addEventListener("error", () => reject(transaction.error));
    });
  }

  window.PunchLabStorage = {
    clearAutosave,
    clearBackups,
    clearRecovery,
    formatBackupHistoryLabel,
    hasAutosave,
    hasRecovery,
    loadAutosave,
    loadBackup,
    loadLatestBackup,
    listBackups,
    saveBackup,
    saveAutosave,
  };
})();
