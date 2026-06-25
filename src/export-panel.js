(() => {
  function requireValue(deps, name) {
    const value = deps[name];
    if (!value) {
      throw new Error(`PunchLab export panel dependency missing: ${name}`);
    }
    return value;
  }

  function requireHelper(deps, name) {
    const helper = deps[name];
    if (typeof helper !== "function") {
      throw new Error(`PunchLab export panel helper missing: ${name}`);
    }
    return helper;
  }

  function createExportPanel(deps = {}) {
    const els = requireValue(deps, "els");
    const state = requireValue(deps, "state");
    const actions = requireValue(deps, "actions");
    const helpers = deps.helpers || {};
    const escapeHtml = requireHelper(helpers, "escapeHtml");
    const formatDb = requireHelper(helpers, "formatDb");
    const formatGainDb = requireHelper(helpers, "formatGainDb");
    const formatLufs = requireHelper(helpers, "formatLufs");
    const getAudibleCompTakes = requireHelper(helpers, "getAudibleCompTakes");
    const getAudibleTakes = requireHelper(helpers, "getAudibleTakes");
    const getExportBitDepth = requireHelper(helpers, "getExportBitDepth");
    const getExportMetadata = requireHelper(helpers, "getExportMetadata");
    const getMixSourceSignature = requireHelper(helpers, "getMixSourceSignature");
    const getStemExportGroups = requireHelper(helpers, "getStemExportGroups");
    const canExportCompressedAudio = requireHelper(helpers, "canExportCompressedAudio");

    function renderExportPanel() {
      if (!els.exportList) {
        return;
      }

      const metadata = getExportMetadata();
      const compressedReady = canExportCompressedAudio();
      const rows = [
        { label: "Full mix", count: getAudibleTakes().length + (state.beatArrayBuffer ? 1 : 0), unit: "source" },
        { label: "Track stems", count: getStemExportGroups().length, unit: "source" },
        { label: "Beat stem", count: state.beatArrayBuffer ? 1 : 0, unit: "source" },
        { label: "Vocal stem", count: getAudibleTakes().length, unit: "source" },
        { label: "Comp vocal", count: getAudibleCompTakes().length, unit: "source" },
        { label: "Dry vocals", count: getAudibleTakes().filter((take) => !take.processed).length, unit: "source" },
        { label: "Tuned vocals", count: getAudibleTakes().filter((take) => take.processed).length, unit: "source" },
        { label: "Metadata", count: [metadata.artist, metadata.title, metadata.bpm, metadata.key].filter(Boolean).length, unit: "field" },
        { label: "WAV depth", count: `${getExportBitDepth()}-bit`, unit: "" },
        { label: "Loudness target", count: els.exportLoudnessNormalizeInput.checked ? `-14 LUFS ${formatGainDb(state.lastExportLoudnessGain)}` : "Off", unit: "" },
        { label: "Normalize", count: els.exportNormalizeInput.checked ? `On ${formatGainDb(state.lastExportNormalizeGain)}` : "Off", unit: "" },
        { label: "Compressed export", count: getCompressedExportStatus(), unit: "" },
      ];
      const jobs = state.exportQueue.slice(-8).reverse();
      const hasFinishedExports = state.exportQueue.some((job) => job.status === "done" || job.status === "failed");

      els.exportList.innerHTML = `
    <div class="export-section-heading">Sources</div>
    ${renderSourceRows(rows)}
    <div class="export-section-heading">Loudness</div>
    ${renderLoudnessReport()}
    <div class="export-section-heading export-queue-heading">
      <span>Queue</span>
      ${hasFinishedExports ? `<button class="mini-button" type="button" data-clear-finished-exports>Clear finished</button>` : ""}
    </div>
    ${renderQueueRows(jobs, compressedReady)}
  `;

      bindExportPanelActions();
    }

    function renderSourceRows(rows) {
      return rows
        .map(
          (row) => `
        <div class="export-row">
          <strong>${row.label}</strong>
          <small>${formatExportRowCount(row)}</small>
        </div>
      `,
        )
        .join("");
    }

    function renderQueueRows(jobs, compressedReady) {
      return jobs.length
        ? jobs
          .map(
            (job) => `
          <div class="export-row export-job-row ${job.status}">
            <div>
              <strong>${escapeHtml(job.label)}</strong>
              <small>${escapeHtml(formatExportJobDetail(job))}</small>
            </div>
            <div class="export-job-actions">
              <span>${getExportJobStatusLabel(job.status)}</span>
              ${job.previewUrl ? `<button class="mini-button" type="button" data-preview-export="${job.id}">Preview</button>` : ""}
              ${job.status === "done" && job.previewBlob ? `<button class="mini-button" type="button" data-download-export="${job.id}">Download</button>` : ""}
              ${job.status === "done" && job.previewBlob && compressedReady ? `<button class="mini-button" type="button" data-compress-export="${job.id}" data-compress-format="mp3">MP3</button>` : ""}
              ${job.status === "done" && job.previewBlob && compressedReady ? `<button class="mini-button" type="button" data-compress-export="${job.id}" data-compress-format="m4a">M4A</button>` : ""}
              ${job.status === "failed" ? `<button class="mini-button" type="button" data-retry-export="${job.id}">Retry</button>` : ""}
              ${job.status === "done" || job.status === "failed" ? `<button class="mini-button danger" type="button" data-remove-export="${job.id}">Remove</button>` : ""}
            </div>
          </div>
        `,
          )
          .join("")
        : `<span class="empty-takes">No export jobs yet</span>`;
    }

    function renderLoudnessReport() {
      if (state.isAnalyzingLoudness) {
        return `<span class="empty-takes">Analyzing full mix...</span>`;
      }

      const report = state.loudnessReport;
      if (!report) {
        return `<span class="empty-takes">No loudness analysis yet</span>`;
      }

      const stale = report.sourceSignature !== getMixSourceSignature();
      const clippingClass = report.clippingSamples > 0 ? " warning" : "";
      const clipRisk = getClippingRisk(report, stale);
      return `
    <div class="loudness-grid">
      <div class="export-row${stale ? " warning" : ""}">
        <strong>Integrated</strong>
        <small>${formatLufs(report.integratedLufs)}${stale ? " / stale" : ""}</small>
      </div>
      <div class="export-row">
        <strong>True peak</strong>
        <small>${formatDb(report.truePeakDbfs ?? report.peakDbfs)} dBTP / sample ${formatDb(report.peakDbfs)}</small>
      </div>
      <div class="export-row">
        <strong>Target gain</strong>
        <small>${formatDb(report.recommendedGainDb)} dB to -14 LUFS</small>
      </div>
      <div class="export-row${clippingClass}">
        <strong>Clipping</strong>
        <small>${report.clippingSamples} samples</small>
      </div>
      <div class="export-row${clipRisk.warning ? " warning" : ""}">
        <strong>Clip risk</strong>
        <small>${escapeHtml(clipRisk.label)}</small>
      </div>
    </div>
  `;
    }

    function bindExportPanelActions() {
      els.exportList.querySelectorAll("[data-preview-export]").forEach((button) => {
        button.addEventListener("click", () => actions.playExportPreview(button.dataset.previewExport));
      });
      els.exportList.querySelectorAll("[data-download-export]").forEach((button) => {
        button.addEventListener("click", () => actions.downloadExportJob(button.dataset.downloadExport));
      });
      els.exportList.querySelectorAll("[data-compress-export]").forEach((button) => {
        button.addEventListener("click", () => actions.exportCompressedJob(button.dataset.compressExport, button.dataset.compressFormat));
      });
      els.exportList.querySelectorAll("[data-retry-export]").forEach((button) => {
        button.addEventListener("click", () => actions.retryExportJob(button.dataset.retryExport));
      });
      els.exportList.querySelectorAll("[data-remove-export]").forEach((button) => {
        button.addEventListener("click", () => actions.removeExportJob(button.dataset.removeExport));
      });
      els.exportList.querySelector("[data-clear-finished-exports]")?.addEventListener("click", actions.clearFinishedExportJobs);
    }

    function getClippingRisk(report, stale = false) {
      return window.PunchLabExportPlan.getClippingRisk(report, stale, { formatDb });
    }

    function formatExportRowCount(row) {
      return window.PunchLabExportPlan.formatExportRowCount(row);
    }

    function getCompressedExportStatus() {
      return window.PunchLabExportPlan.getCompressedExportStatus(canExportCompressedAudio());
    }

    function getExportJobStatusLabel(status) {
      return window.PunchLabExportPlan.getExportJobStatusLabel(status);
    }

    function formatExportJobDetail(job = {}) {
      return window.PunchLabExportPlan.formatExportJobDetail(job, getExportJobStatusLabel(job.status));
    }

    return {
      renderExportPanel,
    };
  }

  window.PunchLabExportPanel = {
    createExportPanel,
  };
})();
