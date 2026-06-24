(() => {
  const MIC_AUDIO_CONSTRAINTS = {
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false,
  };
  const RECORDING_MIME_TYPES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", ""];

  function canEnumerateDevices() {
    return Boolean(navigator.mediaDevices?.enumerateDevices);
  }

  async function listAudioDevices(kind) {
    if (!canEnumerateDevices()) {
      return [];
    }

    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices
      .filter((device) => device.kind === kind)
      .map((device, index) => ({
        id: device.deviceId,
        label: device.label || `${kind === "audioinput" ? "Input" : "Output"} ${index + 1}`,
        kind: device.kind,
      }));
  }

  function getMicConstraints(deviceId = "") {
    const audio = { ...MIC_AUDIO_CONSTRAINTS };
    if (deviceId) {
      audio.deviceId = { exact: deviceId };
    }
    return { audio };
  }

  function getBestMimeType(types = RECORDING_MIME_TYPES, isTypeSupported = null) {
    const supportsType = typeof isTypeSupported === "function"
      ? isTypeSupported
      : (type) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type);
    return (Array.isArray(types) ? types : RECORDING_MIME_TYPES)
      .find((type) => !type || supportsType(type)) || "";
  }

  function canSetMediaOutput() {
    return typeof HTMLMediaElement !== "undefined" && "setSinkId" in HTMLMediaElement.prototype;
  }

  function canSetAudioContextOutput() {
    return typeof AudioContext !== "undefined" && "setSinkId" in AudioContext.prototype;
  }

  async function setMediaOutput(mediaElement, deviceId = "") {
    if (!mediaElement || typeof mediaElement.setSinkId !== "function") {
      return false;
    }

    await mediaElement.setSinkId(deviceId || "");
    return true;
  }

  async function setAudioContextOutput(audioContext, deviceId = "") {
    if (!audioContext || typeof audioContext.setSinkId !== "function") {
      return false;
    }

    await audioContext.setSinkId(deviceId || "");
    return true;
  }

  window.PunchLabDevices = {
    canEnumerateDevices,
    canSetAudioContextOutput,
    canSetMediaOutput,
    getBestMimeType,
    getMicConstraints,
    listAudioDevices,
    setAudioContextOutput,
    setMediaOutput,
  };
})();
