(() => {
  function requireValue(deps, name) {
    const value = deps[name];
    if (!value) {
      throw new Error(`PunchLab beat playback dependency missing: ${name}`);
    }
    return value;
  }

  function createBeatPlayback(deps = {}) {
    const state = requireValue(deps, "state");
    const els = requireValue(deps, "els");
    const ensureAudioContext = requireValue(deps, "ensureAudioContext");
    const applyPlaybackOutput = requireValue(deps, "applyPlaybackOutput");
    const scheduleAutosave = requireValue(deps, "scheduleAutosave");
    const formatGainDb = requireValue(deps, "formatGainDb");

    function normalizeBeatGain(value) {
      const gain = Number(value);
      return Number.isFinite(gain) ? Math.max(0.5, Math.min(2.5, gain)) : 1.4;
    }

    function ensureBeatPlaybackChain() {
      if (!state.audioContext || !els.beatAudio || state.beatSourceNode) {
        return;
      }

      state.beatSourceNode = state.audioContext.createMediaElementSource(els.beatAudio);
      state.beatGainNode = state.audioContext.createGain();
      state.beatSourceNode.connect(state.beatGainNode).connect(state.audioContext.destination);
    }

    async function prepareBeatPlayback() {
      await ensureAudioContext();
      ensureBeatPlaybackChain();
      updateBeatGain(false);
      await applyPlaybackOutput(els.beatAudio);
    }

    async function playBeatAudio() {
      await prepareBeatPlayback();
      await els.beatAudio.play();
    }

    function updateBeatGain(shouldAutosave = true) {
      state.beatGain = normalizeBeatGain(els.beatGainSlider?.value ?? state.beatGain);
      if (els.beatGainSlider) {
        els.beatGainSlider.value = String(state.beatGain);
      }
      if (els.beatGainText) {
        els.beatGainText.textContent = formatGainDb(state.beatGain);
      }

      if (state.beatGainNode && state.audioContext) {
        state.beatGainNode.gain.setTargetAtTime(state.beatGain, state.audioContext.currentTime, 0.01);
        els.beatAudio.volume = 1;
      } else {
        els.beatAudio.volume = Math.min(1, state.beatGain);
      }

      if (shouldAutosave) {
        scheduleAutosave();
      }
    }

    return {
      normalizeBeatGain,
      prepareBeatPlayback,
      playBeatAudio,
      updateBeatGain,
    };
  }

  window.PunchLabBeatPlayback = {
    createBeatPlayback,
  };
})();
