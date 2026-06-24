(() => {
  const README_MANIFEST_LINES = Object.freeze([
    "manifest.json lists extracted audio assets for backup, transfer, and manual inspection.",
    "manifest.json includes session settings for tempo, key, tuning mode, punch, loop, and snap review.",
    "manifest.json includes exportSettings for WAV depth, normalize, loudness target, and recent analysis context.",
    "manifest.json includes automationManifest for plugin-style vocal chain parameter interpretation.",
    "manifest.json includes nativeAudio for driver, buffer, and latency environment context.",
    "manifest.json includes desktopReadiness for wrapper, native audio, and plugin host handoff context.",
    "manifest.json includes presets for vocal chain backup and transfer review.",
    "manifest.json includes notes and marker lyrics for read-only archive review.",
  ]);

  function createProjectZipManifest({
    projectFilename = "session.punchlab.json",
    session = {},
    exportSettings = {},
    pluginHost = {},
    automationManifest = {},
    nativeAudio = {},
    desktopReadiness = {},
    presets = [],
    notes = {},
  } = {}) {
    return {
      app: "PunchLab",
      exportedAt: new Date().toISOString(),
      project: projectFilename,
      preview: "preview.html",
      session,
      exportSettings,
      pluginHost,
      automationManifest,
      nativeAudio,
      desktopReadiness,
      presets: Array.isArray(presets) ? presets : [],
      notes,
      beat: null,
      markers: [],
      takes: [],
    };
  }

  function buildProjectZipReadme(projectFilename = "session.punchlab.json") {
    return [
      "PunchLab project archive",
      "",
      `${projectFilename} is the full PunchLab project bundle used by the current web app.`,
      "preview.html is a read-only browser preview for quick review after extracting the zip.",
      ...README_MANIFEST_LINES,
      "Processed takes include automationState when a chain snapshot is available.",
      "assets/beat contains the loaded beat when available.",
      "assets/takes contains recorded and processed take audio files.",
    ].join("\n");
  }

  function sortProjectZipPreviewTakes(manifest = {}) {
    return [...(Array.isArray(manifest.takes) ? manifest.takes : [])].sort(
      (left, right) => (left.startTime || 0) - (right.startTime || 0) || String(left.trackName).localeCompare(String(right.trackName)),
    );
  }

  function sortProjectZipPreviewCompTakes(takes = []) {
    return [...(Array.isArray(takes) ? takes : [])]
      .filter((take) => take.compSelected)
      .sort((left, right) => (left.compOrder || 0) - (right.compOrder || 0));
  }

  function buildProjectZipPreviewPlaybackData(manifest = {}, takes = sortProjectZipPreviewTakes(manifest)) {
    return {
      beat: manifest.beat ? { path: manifest.beat.path } : null,
      takes: (Array.isArray(takes) ? takes : [])
        .filter((take) => Number(take.volume) > 0)
        .map((take) => ({
          path: take.path,
          startTime: take.startTime || 0,
          sourceOffset: take.sourceOffset || 0,
          duration: take.duration || 0,
          volume: Math.min(1, Math.max(0, Number(take.volume || 0) * Number(take.clipGain || 1))),
          pan: Math.max(-1, Math.min(1, Number(take.pan || 0))),
        })),
    };
  }

  function escapeScriptJson(value) {
    return String(value ?? "")
      .replace(/</g, "\\u003c")
      .replace(/>/g, "\\u003e")
      .replace(/&/g, "\\u0026")
      .replace(/\u2028/g, "\\u2028")
      .replace(/\u2029/g, "\\u2029");
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatDuration(seconds) {
    const safeSeconds = Math.max(0, seconds || 0);
    const minutes = Math.floor(safeSeconds / 60);
    const secs = Math.floor(safeSeconds % 60);
    const tenths = Math.floor((safeSeconds % 1) * 10);
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${tenths}`;
  }

  function formatDb(value) {
    if (!Number.isFinite(value)) {
      return "-inf";
    }

    return `${value >= 0 ? "+" : ""}${value.toFixed(1)}`;
  }

  function formatTimestamp(value) {
    const timestamp = value ? new Date(value) : null;
    return timestamp && !Number.isNaN(timestamp.getTime())
      ? `Updated ${timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
      : "";
  }

  function normalizeTimelineSnapMode(value) {
    return ["off", "beat", "bar"].includes(value) ? value : "off";
  }

  function buildDescriptionListRows(rows = []) {
    return rows
      .map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`)
      .join("");
  }

  function getProjectZipPreviewStyles() {
    return `      :root { color-scheme: dark; --bg: #080a09; --panel: #101511; --line: #273129; --text: #f1f5ef; --muted: #8b978f; --lime: #c8ff4d; --cyan: #41e6d0; }
      * { box-sizing: border-box; }
      body { margin: 0; padding: 24px; color: var(--text); background: var(--bg); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      main { max-width: 1120px; margin: 0 auto; display: grid; gap: 18px; }
      header, section { border: 1px solid var(--line); background: var(--panel); border-radius: 8px; padding: 18px; }
      h1, h2, p { margin: 0; }
      h1 { font-size: 32px; line-height: 1; }
      h2 { margin-bottom: 12px; font-size: 15px; text-transform: uppercase; color: var(--cyan); }
      small, p { color: var(--muted); }
      .meta { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 12px; }
      .meta span, .asset-heading span { border: 1px solid var(--line); border-radius: 6px; padding: 6px 8px; color: var(--lime); font-size: 12px; font-weight: 800; }
      .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 12px; }
      .asset-card { display: grid; gap: 10px; padding: 12px; border: 1px solid var(--line); border-radius: 8px; background: #0b0f0d; }
      .asset-heading { display: flex; align-items: start; justify-content: space-between; gap: 10px; }
      .preview-controls { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-top: 16px; }
      .preview-controls button { min-height: 38px; padding: 0 14px; color: #050706; background: var(--lime); border: 1px solid var(--lime); border-radius: 6px; font-weight: 900; cursor: pointer; }
      .preview-controls button.secondary { color: var(--text); background: #0b0f0d; border-color: var(--line); }
      #previewStatus { color: var(--cyan); font-size: 13px; font-weight: 800; }
      audio { width: 100%; }
      dl { display: grid; grid-template-columns: repeat(auto-fit, minmax(78px, 1fr)); gap: 8px; margin: 0; }
      dt { color: var(--muted); font-size: 10px; text-transform: uppercase; }
      dd { margin: 3px 0 0; font-size: 13px; font-weight: 800; }
      .region-chip { display: inline-flex; align-items: center; gap: 6px; min-width: 0; }
      .region-chip i { width: 10px; height: 10px; border: 1px solid rgba(255,255,255,.28); border-radius: 999px; flex: 0 0 auto; }
      .note-text { max-height: 260px; overflow: auto; margin: 0; white-space: pre-wrap; color: var(--text); font: 13px/1.5 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
      table { width: 100%; border-collapse: collapse; }
      th, td { padding: 8px; border-bottom: 1px solid var(--line); text-align: left; vertical-align: top; }
      th { color: var(--muted); font-size: 11px; text-transform: uppercase; }
      ol { display: grid; gap: 8px; margin: 0; padding: 0; list-style: none; }
      li { display: flex; gap: 8px; align-items: center; }
      li span { width: 28px; height: 28px; display: grid; place-items: center; color: #050706; background: var(--lime); border-radius: 6px; font-weight: 900; }
      code { color: var(--cyan); }`;
  }

  function getProjectZipPreviewPlayerScript() {
    return `      (() => {
        const data = JSON.parse(document.querySelector("#previewData").textContent);
        const status = document.querySelector("#previewStatus");
        let audioContext = null;
        let players = [];
        let timers = [];

        function stopPreview(message = "Stopped") {
          timers.forEach((timer) => clearTimeout(timer));
          timers = [];
          players.forEach((player) => {
            try {
              player.pause?.();
              player.currentTime = 0;
              player.stop?.();
              player.disconnect?.();
            } catch {}
          });
          players = [];
          status.textContent = message;
        }

        async function playPreview() {
          stopPreview("Preparing");
          audioContext ||= new AudioContext();
          if (audioContext.state === "suspended") {
            await audioContext.resume();
          }
          const startedAt = performance.now();
          if (data.beat?.path) {
            const beat = new Audio(data.beat.path);
            beat.volume = 1;
            players.push(beat);
            beat.play().catch(() => {
              status.textContent = "Playback blocked";
            });
          }
          data.takes.forEach((take) => {
            const delayMs = Math.max(0, Number(take.startTime || 0) * 1000);
            const timer = setTimeout(() => {
              const audio = new Audio(take.path);
              audio.currentTime = Math.max(0, Number(take.sourceOffset || 0));
              const source = audioContext.createMediaElementSource(audio);
              const gain = audioContext.createGain();
              gain.gain.value = Math.max(0, Math.min(1, Number(take.volume || 0)));
              const panner = audioContext.createStereoPanner ? audioContext.createStereoPanner() : null;
              source.connect(gain);
              if (panner) {
                panner.pan.value = Math.max(-1, Math.min(1, Number(take.pan || 0)));
                gain.connect(panner).connect(audioContext.destination);
              } else {
                gain.connect(audioContext.destination);
              }
              players.push(audio, source, gain, panner);
              const stopMs = Math.max(50, Number(take.duration || 0) * 1000);
              const stopTimer = setTimeout(() => {
                audio.pause();
                audio.currentTime = 0;
              }, stopMs);
              timers.push(stopTimer);
              audio.play().catch(() => {
                status.textContent = "Playback blocked";
              });
            }, delayMs);
            timers.push(timer);
          });
          status.textContent = "Playing timeline";
          const endAt = Math.max(0, ...data.takes.map((take) => Number(take.startTime || 0) + Number(take.duration || 0))) * 1000 + 300;
          const doneTimer = setTimeout(() => {
            const elapsed = Math.round((performance.now() - startedAt) / 1000);
            stopPreview("Done " + elapsed + "s");
          }, endAt);
          timers.push(doneTimer);
        }

        document.querySelector("#playPreviewButton").addEventListener("click", playPreview);
        document.querySelector("#stopPreviewButton").addEventListener("click", () => stopPreview());
      })();`;
  }

  function buildProjectZipPreviewAutomationSchemaRows(automationManifest = {}) {
    const parameters = Array.isArray(automationManifest.parameters) ? automationManifest.parameters : [];
    if (!parameters.length) {
      return `<article class="asset-card"><strong>No automation schema</strong><small>Processed take parameter values cannot be mapped to controls.</small></article>`;
    }

    return parameters
      .map((parameter) => `
        <article class="asset-card">
          <strong>${escapeHtml(parameter.label || parameter.id)}</strong>
          <small>${escapeHtml(parameter.automationId || parameter.id || "")}</small>
          <dl>
            <div><dt>Group</dt><dd>${escapeHtml(parameter.group || "")}</dd></div>
            <div><dt>Range</dt><dd>${escapeHtml(`${parameter.min} to ${parameter.max}${parameter.unit ? ` ${parameter.unit}` : ""}`)}</dd></div>
            <div><dt>Default</dt><dd>${escapeHtml(String(parameter.defaultValue ?? ""))}</dd></div>
            <div><dt>Step</dt><dd>${escapeHtml(String(parameter.step ?? ""))}</dd></div>
          </dl>
        </article>`)
      .join("");
  }

  function buildProjectZipPreviewSessionRows(sessionManifest = {}) {
    const countIn = Number(sessionManifest.countInBars || 0);
    const recordLatency = Number(sessionManifest.recordLatencyMs || 0);
    const bufferSize = Number(sessionManifest.nativeBufferSize || 0);
    return buildDescriptionListRows([
      ["BPM", String(sessionManifest.bpm || 140)],
      ["Key", sessionManifest.key || "C minor"],
      ["Scale", formatProjectZipPreviewScaleMode(sessionManifest.scaleMode)],
      ["Target", sessionManifest.targetNote || "Scale nearest"],
      ["Count-in", countIn > 0 ? `${countIn} bar${countIn === 1 ? "" : "s"}` : "Off"],
      ["Snap", formatProjectZipPreviewSnapMode(sessionManifest.timelineSnap)],
      ["Armed", sessionManifest.armedTrackName || sessionManifest.armedTrackId || "Main"],
      ["Punch", sessionManifest.punchEnabled ? `${formatDuration(sessionManifest.punchIn)} - ${formatDuration(sessionManifest.punchOut)}` : "Off"],
      ["Loop", sessionManifest.loopEnabled ? "On" : "Off"],
      ["Metronome", sessionManifest.metronomeEnabled ? "On" : "Off"],
      ["Record Latency", recordLatency > 0 ? `${Math.round(recordLatency)} ms` : "None"],
      ["Native Buffer", bufferSize > 0 ? `${bufferSize} samples` : "Default"],
    ]);
  }

  function formatProjectZipPreviewScaleMode(scaleMode) {
    const value = String(scaleMode || "minor");
    return value === "custom" ? "Custom" : value === "chromatic" ? "Chromatic" : "Minor";
  }

  function formatProjectZipPreviewSnapMode(snapMode) {
    const value = normalizeTimelineSnapMode(snapMode || "off");
    return value === "bar" ? "Bar" : value === "beat" ? "Beat" : "Off";
  }

  function buildProjectZipPreviewPresetRows(presetManifest = []) {
    if (!presetManifest.length) {
      return `<article class="asset-card"><strong>No presets</strong><small>The project bundle did not include vocal chain presets.</small></article>`;
    }

    return presetManifest
      .map((preset) => `
        <article class="asset-card">
          <div class="asset-heading">
            <div>
              <strong>${escapeHtml(preset.name || preset.id)}</strong>
              <small>${escapeHtml(preset.tuneSignature || "No tune signature")}</small>
            </div>
            <span>${escapeHtml(preset.selected ? "Selected" : preset.custom ? "Custom" : "Built-in")}</span>
          </div>
          <dl>
            <div><dt>Retune</dt><dd>${escapeHtml(String(preset.retune ?? ""))}</dd></div>
            <div><dt>Humanize</dt><dd>${escapeHtml(String(preset.humanize ?? ""))}</dd></div>
            <div><dt>Comp</dt><dd>${escapeHtml(String(preset.comp ?? ""))}</dd></div>
            <div><dt>Space</dt><dd>${escapeHtml(String(preset.space ?? ""))}</dd></div>
            <div><dt>EQ</dt><dd>${escapeHtml(`${formatDb(Number(preset.lowEq || 0))}/${formatDb(Number(preset.midEq || 0))}/${formatDb(Number(preset.airEq || 0))}`)}</dd></div>
            <div><dt>Limiter</dt><dd>${escapeHtml(formatDb(Number(preset.limiterCeiling ?? -3)))}</dd></div>
          </dl>
        </article>`)
      .join("");
  }

  function buildProjectZipPreviewPluginHostRows(pluginHost = {}) {
    const formats = Array.isArray(pluginHost.formats) && pluginHost.formats.length ? pluginHost.formats.join(", ") : "None";
    const scannedAt = formatTimestamp(pluginHost.scannedAt) || "Not scanned";
    return buildDescriptionListRows([
      ["Scan", pluginHost.scanAvailable ? pluginHost.scanned ? "Scanned" : "Ready" : "Unavailable"],
      ["Formats", formats],
      ["Plugins", String(pluginHost.pluginCount || 0)],
      ["Freshness", scannedAt],
      ["Source", pluginHost.fixture ? "Fixture" : "Native"],
    ]);
  }

  function buildProjectZipPreviewNotesRows(notesManifest = {}, markers = []) {
    const rows = [];
    const scratchLyrics = String(notesManifest.scratchLyrics || "");
    const sessionNotes = String(notesManifest.sessionNotes || "");
    if (scratchLyrics.trim()) {
      rows.push(buildProjectZipPreviewTextCard("Scratch Lyrics", `${notesManifest.scratchLyricLines || getLyricLineCount(scratchLyrics)} lines`, scratchLyrics));
    }
    if (sessionNotes.trim()) {
      rows.push(buildProjectZipPreviewTextCard("Session Notes", `${notesManifest.sessionNoteLines || getLyricLineCount(sessionNotes)} lines`, sessionNotes));
    }

    (Array.isArray(markers) ? markers : [])
      .filter((marker) => String(marker.lyrics || "").trim())
      .forEach((marker) => {
        rows.push(buildProjectZipPreviewTextCard(`${marker.type} Lyrics`, formatDuration(marker.time), marker.lyrics));
      });

    return rows.length
      ? rows.join("")
      : `<article class="asset-card"><strong>No lyrics or notes</strong><small>The project bundle has no scratch lyrics, marker lyrics, or session notes.</small></article>`;
  }

  function getLyricLineCount(value) {
    const text = String(value || "").trim();
    return text ? text.split(/\r?\n/).filter((line) => line.trim()).length : 0;
  }

  function buildProjectZipPreviewTextCard(title, detail, value) {
    return `
      <article class="asset-card">
        <div class="asset-heading">
          <div>
            <strong>${escapeHtml(title)}</strong>
            <small>${escapeHtml(detail)}</small>
          </div>
        </div>
        <pre class="note-text">${escapeHtml(value)}</pre>
      </article>`;
  }

  function buildProjectZipPreviewHandoffRows(desktopReadiness = {}) {
    return Array.isArray(desktopReadiness.handoffStages) && desktopReadiness.handoffStages.length
      ? desktopReadiness.handoffStages
        .map((stage, index) => `<li><span>${index + 1}</span>${escapeHtml(formatProjectZipPreviewHandoffStageName(stage.id))} <small>${escapeHtml(stage.status || "pending")}</small></li>`)
        .join("")
      : `<li>No desktop handoff snapshot.</li>`;
  }

  function formatProjectZipPreviewHandoffStageName(id) {
    return String(id || "stage")
      .split("-")
      .map((part) => part ? `${part.charAt(0).toUpperCase()}${part.slice(1)}` : "")
      .join(" ");
  }

  window.PunchLabProjectZip = {
    README_MANIFEST_LINES,
    createProjectZipManifest,
    buildProjectZipReadme,
    sortProjectZipPreviewTakes,
    sortProjectZipPreviewCompTakes,
    buildProjectZipPreviewPlaybackData,
    escapeScriptJson,
    getProjectZipPreviewStyles,
    getProjectZipPreviewPlayerScript,
    buildProjectZipPreviewAutomationSchemaRows,
    buildProjectZipPreviewSessionRows,
    buildProjectZipPreviewPresetRows,
    buildProjectZipPreviewPluginHostRows,
    buildProjectZipPreviewNotesRows,
    buildProjectZipPreviewHandoffRows,
  };
})();
