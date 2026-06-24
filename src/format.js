(() => {
  function formatDuration(seconds) {
    const safeSeconds = Math.max(0, seconds || 0);
    const minutes = Math.floor(safeSeconds / 60);
    const secs = Math.floor(safeSeconds % 60);
    const tenths = Math.floor((safeSeconds % 1) * 10);
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${tenths}`;
  }

  function gainToDb(gain) {
    return 20 * Math.log10(Math.max(0.000001, Number(gain) || 0.000001));
  }

  function formatGainDb(gain) {
    const db = gainToDb(gain);
    return `${db >= 0 ? "+" : ""}${db.toFixed(1)} dB`;
  }

  function formatDb(value) {
    if (!Number.isFinite(value)) {
      return "-inf";
    }

    return `${value >= 0 ? "+" : ""}${value.toFixed(1)}`;
  }

  function formatRatio(value) {
    const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;
    return Number.isInteger(safeValue) ? String(safeValue) : safeValue.toFixed(1);
  }

  function formatLufs(value) {
    if (!Number.isFinite(value)) {
      return "-inf LUFS";
    }

    return `${value.toFixed(1)} LUFS`;
  }

  function formatSigned(value) {
    return `${value >= 0 ? "+" : ""}${value}`;
  }

  function formatSemitones(value) {
    const safeValue = Number.isFinite(value) ? value : 0;
    return `${safeValue >= 0 ? "+" : ""}${safeValue.toFixed(1)} st`;
  }

  function formatPercent(value) {
    return `${Math.round(value * 100)}%`;
  }

  function formatPan(value) {
    if (Math.abs(value) < 0.01) {
      return "C";
    }

    return value < 0 ? `L${Math.round(Math.abs(value) * 100)}` : `R${Math.round(value * 100)}`;
  }

  function formatRuntimeLatency(value) {
    const latencyMs = Number(value);
    return Number.isFinite(latencyMs) ? `Latency ${Math.round(latencyMs)} ms` : "";
  }

  function formatDisplaySampleRate(value) {
    const sampleRate = Number(value);
    return Number.isFinite(sampleRate) && sampleRate > 0 ? `${(sampleRate / 1000).toFixed(sampleRate % 1000 ? 1 : 0)} kHz` : "";
  }

  function formatDisplayTimestamp(value) {
    const timestamp = value ? new Date(value) : null;
    return timestamp && !Number.isNaN(timestamp.getTime())
      ? `Updated ${timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
      : "";
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  window.PunchLabFormat = {
    escapeHtml,
    formatDb,
    formatDuration,
    formatGainDb,
    formatLufs,
    formatPan,
    formatPercent,
    formatDisplaySampleRate,
    formatDisplayTimestamp,
    formatRatio,
    formatRuntimeLatency,
    formatSemitones,
    formatSigned,
    gainToDb,
  };
})();
