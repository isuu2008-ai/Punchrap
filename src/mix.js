(() => {
  async function renderMixBuffer({ sampleRate = 48000, beatBuffer = null, takes = [] }) {
    const endPosition = Math.max(
      beatBuffer?.duration || 0,
      ...takes.map((take) => (take.startTime || 0) + (take.buffer?.duration || take.duration || 0)),
      0.1,
    );
    const frameCount = Math.ceil(endPosition * sampleRate);
    const context = new OfflineAudioContext(2, frameCount, sampleRate);

    if (beatBuffer) {
      scheduleBuffer(context, {
        buffer: beatBuffer,
        startTime: 0,
        volume: 1,
        pan: 0,
      });
    }

    takes.forEach((take) => {
      scheduleBuffer(context, take);
    });

    return context.startRendering();
  }

  function scheduleBuffer(context, sourceSpec) {
    if (!sourceSpec?.buffer) {
      return;
    }

    const source = context.createBufferSource();
    const gain = context.createGain();
    const panner = context.createStereoPanner ? context.createStereoPanner() : null;
    const startTime = Math.max(0, Number(sourceSpec.startTime) || 0);
    const volume = Math.max(0, Number(sourceSpec.volume ?? 1));
    const pan = Math.max(-1, Math.min(1, Number(sourceSpec.pan) || 0));

    source.buffer = sourceSpec.buffer;
    applyGainAutomation(gain.gain, {
      volume: volume * Math.max(0, Number(sourceSpec.clipGain ?? 1)),
      fadeIn: Math.max(0, Number(sourceSpec.fadeIn) || 0),
      fadeOut: Math.max(0, Number(sourceSpec.fadeOut) || 0),
      duration: Math.max(0, Number(sourceSpec.duration || sourceSpec.buffer.duration || 0)),
      startAt: startTime,
    });
    source.connect(gain);

    if (panner) {
      panner.pan.value = pan;
      gain.connect(panner).connect(context.destination);
    } else {
      gain.connect(context.destination);
    }

    source.start(startTime);
  }

  function applyGainAutomation(audioParam, { volume, fadeIn, fadeOut, duration, startAt }) {
    const safeDuration = Math.max(0, duration);
    const safeFadeIn = Math.min(Math.max(0, fadeIn), safeDuration / 2);
    const safeFadeOut = Math.min(Math.max(0, fadeOut), safeDuration / 2);
    const endAt = startAt + safeDuration;
    const fadeOutStart = Math.max(startAt, endAt - safeFadeOut);

    audioParam.cancelScheduledValues(startAt);
    audioParam.setValueAtTime(safeFadeIn > 0 ? 0 : volume, startAt);
    if (safeFadeIn > 0) {
      audioParam.linearRampToValueAtTime(volume, startAt + safeFadeIn);
    }
    if (safeFadeOut > 0) {
      audioParam.setValueAtTime(volume, fadeOutStart);
      audioParam.linearRampToValueAtTime(0, endAt);
    }
  }

  window.PunchLabMix = {
    renderMixBuffer,
  };
})();
