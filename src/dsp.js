(() => {
  const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const MINOR_SCALE = [0, 2, 3, 5, 7, 8, 10];

  async function renderVocalBuffer(sourceBuffer, preset, pitchPlan = null, tuneSettings = {}) {
    const sampleRate = sourceBuffer.sampleRate;
    const tailSeconds = Math.min(1.4, 0.18 + preset.space / 120);
    const frameCount = Math.ceil((sourceBuffer.duration + tailSeconds) * sampleRate);
    const context = new OfflineAudioContext(2, frameCount, sampleRate);
    const source = context.createBufferSource();
    const highPass = context.createBiquadFilter();
    const presence = context.createBiquadFilter();
    const air = context.createBiquadFilter();
    const compressor = context.createDynamicsCompressor();
    const saturation = context.createWaveShaper();
    const dryGain = context.createGain();
    const limiter = context.createDynamicsCompressor();

    const compAmount = preset.comp / 100;
    const retuneAmount = (tuneSettings.retuneSpeed || 0) / 100;
    const humanizeAmount = (tuneSettings.humanize || 0) / 100;
    const formantAmount = (tuneSettings.formant || 0) / 50;
    const spaceAmount = preset.space / 100;
    const widthAmount = preset.width / 100;
    const tunedBuffer = createTunedBuffer(context, sourceBuffer, pitchPlan, retuneAmount, humanizeAmount);

    source.buffer = tunedBuffer;
    highPass.type = "highpass";
    highPass.frequency.value = 70 + retuneAmount * 55;
    highPass.Q.value = 0.7;

    presence.type = "peaking";
    presence.frequency.value = 2600;
    presence.Q.value = 0.9;
    presence.gain.value = 1.5 + retuneAmount * 3;

    air.type = "highshelf";
    air.frequency.value = 7800;
    air.gain.value = 1 + widthAmount * 4 + Math.max(0, formantAmount) * 2;

    const formantBody = context.createBiquadFilter();
    const formantFocus = context.createBiquadFilter();
    formantBody.type = "peaking";
    formantBody.frequency.value = 460;
    formantBody.Q.value = 0.85;
    formantBody.gain.value = -formantAmount * 3.2;
    formantFocus.type = "peaking";
    formantFocus.frequency.value = 2200;
    formantFocus.Q.value = 1.05;
    formantFocus.gain.value = formantAmount * 4.2;

    compressor.threshold.value = -18 - compAmount * 18;
    compressor.knee.value = 14 - compAmount * 8;
    compressor.ratio.value = 2.5 + compAmount * 8;
    compressor.attack.value = 0.004;
    compressor.release.value = 0.08 + (1 - compAmount) * 0.18;

    saturation.curve = makeSaturationCurve(0.18 + retuneAmount * 0.58);
    saturation.oversample = "4x";

    dryGain.gain.value = 0.82;
    limiter.threshold.value = -3;
    limiter.knee.value = 0;
    limiter.ratio.value = 20;
    limiter.attack.value = 0.002;
    limiter.release.value = 0.08;

    source
      .connect(highPass)
      .connect(presence)
      .connect(air)
      .connect(formantBody)
      .connect(formantFocus)
      .connect(compressor)
      .connect(saturation);
    saturation.connect(dryGain).connect(limiter);
    connectDelayTap(context, saturation, limiter, 0.085, -0.42 - widthAmount * 0.38, spaceAmount * 0.16);
    connectDelayTap(context, saturation, limiter, 0.128, 0.42 + widthAmount * 0.38, spaceAmount * 0.14);
    limiter.connect(context.destination);

    source.start(0);
    return context.startRendering();
  }

  function createTunedBuffer(context, sourceBuffer, pitchPlan, amount, humanize) {
    const frames = pitchPlan?.frames || [];
    if (!frames.length || amount < 0.04) {
      return sourceBuffer;
    }

    const channelCount = sourceBuffer.numberOfChannels;
    const output = context.createBuffer(channelCount, sourceBuffer.length, sourceBuffer.sampleRate);
    const frameSize = 2048;
    const wet = clamp(0.32 + amount * 0.66 - humanize * 0.24, 0.12, 0.98);
    const usableFrames = frames.filter((frame) => Math.abs(frame.correctionSemitones) > 0.04);

    if (!usableFrames.length) {
      return sourceBuffer;
    }

    for (let channel = 0; channel < channelCount; channel += 1) {
      const input = sourceBuffer.getChannelData(channel);
      const outputData = output.getChannelData(channel);
      const tunedSum = new Float32Array(input.length);
      const weight = new Float32Array(input.length);

      outputData.set(input);
      usableFrames.forEach((frame) => {
        const deadband = humanize * 0.18;
        const frameCorrection = Math.abs(frame.correctionSemitones) < deadband ? 0 : frame.correctionSemitones;
        const confidenceScale = clamp(0.52 + frame.confidence * 0.48 - humanize * 0.18, 0.35, 1);
        const correction = clamp(frameCorrection, -4, 4) * amount * (1 - humanize * 0.58) * confidenceScale;
        const pitchRatio = Math.pow(2, correction / 12);
        const start = Math.max(0, Math.min(input.length - frameSize, Math.round(frame.start)));
        const center = (frameSize - 1) / 2;

        for (let index = 0; index < frameSize; index += 1) {
          const outputIndex = start + index;
          const sourcePosition = start + center + (index - center) * pitchRatio;
          const windowValue = hannWindow(index, frameSize);
          tunedSum[outputIndex] += sampleLinear(input, sourcePosition) * windowValue;
          weight[outputIndex] += windowValue;
        }
      });

      for (let index = 0; index < outputData.length; index += 1) {
        if (weight[index] <= 0.001) {
          continue;
        }

        const tuned = tunedSum[index] / weight[index];
        outputData[index] = input[index] * (1 - wet) + tuned * wet;
      }
    }

    return output;
  }

  function analyzePitchBuffer(audioBuffer) {
    const mono = getMonoChannel(audioBuffer);
    const sampleRate = audioBuffer.sampleRate;
    const frameSize = 2048;
    const hopSize = 1024;
    const minLag = Math.floor(sampleRate / 620);
    const maxLag = Math.floor(sampleRate / 70);
    const pitches = [];
    const frames = [];
    const noteClassCounts = Array.from({ length: 12 }, () => 0);
    let voicedFrames = 0;
    let totalConfidence = 0;

    for (let start = 0; start + frameSize + maxLag < mono.length; start += hopSize) {
      const rms = getFrameRms(mono, start, frameSize);
      if (rms < 0.012) {
        continue;
      }

      const result = detectFramePitch(mono, start, frameSize, minLag, maxLag, sampleRate);
      if (!result || result.confidence < 0.58) {
        continue;
      }

      const midi = frequencyToMidi(result.frequency);
      if (!Number.isFinite(midi)) {
        continue;
      }

      pitches.push({ midi, confidence: result.confidence, weight: rms * result.confidence });
      frames.push({
        start,
        midi,
        confidence: result.confidence,
        rms,
      });
      noteClassCounts[positiveModulo(Math.round(midi), 12)] += 1;
      voicedFrames += 1;
      totalConfidence += result.confidence;
    }

    if (!pitches.length) {
      return {
        detectedMidi: null,
        detectedHz: null,
        confidence: 0,
        voicedFrames: 0,
        frames: [],
        noteClassCounts,
      };
    }

    const detectedMidi = getWeightedMedian(pitches);
    return {
      detectedMidi,
      detectedHz: midiToFrequency(detectedMidi),
      confidence: totalConfidence / voicedFrames,
      voicedFrames,
      frames,
      noteClassCounts,
    };
  }

  function getPitchPlan(analysis, keyValue = "C minor") {
    if (!analysis || analysis.detectedMidi === null) {
      return {
        detectedLabel: "--",
        targetLabel: "--",
        correctionLabel: "--",
        keyFitLabel: "--",
        correctionSemitones: 0,
        frames: [],
      };
    }

    const key = parseKey(keyValue);
    const targetMidi = getNearestScaleMidi(analysis.detectedMidi, key.root);
    const correctionSemitones = targetMidi - analysis.detectedMidi;
    const scaleFit = getScaleFit(analysis.noteClassCounts, key.root);
    const frames = (analysis.frames || []).map((frame) => {
      const frameTargetMidi = getNearestScaleMidi(frame.midi, key.root);
      return {
        ...frame,
        targetMidi: frameTargetMidi,
        correctionSemitones: frameTargetMidi - frame.midi,
      };
    });

    return {
      detectedLabel: formatMidiNote(analysis.detectedMidi),
      targetLabel: formatMidiNote(targetMidi),
      correctionLabel: `${correctionSemitones >= 0 ? "+" : ""}${correctionSemitones.toFixed(1)} st`,
      keyFitLabel: `${Math.round(scaleFit * 100)}%`,
      correctionSemitones,
      targetMidi,
      detectedMidi: analysis.detectedMidi,
      frames,
    };
  }

  function connectDelayTap(context, source, destination, delayTime, pan, gainValue) {
    if (gainValue <= 0.001) {
      return;
    }

    const delay = context.createDelay(1);
    const gain = context.createGain();
    const panner = context.createStereoPanner ? context.createStereoPanner() : null;

    delay.delayTime.value = delayTime;
    gain.gain.value = gainValue;
    source.connect(delay).connect(gain);
    if (panner) {
      panner.pan.value = pan;
      gain.connect(panner).connect(destination);
    } else {
      gain.connect(destination);
    }
  }

  function makeSaturationCurve(amount) {
    const samples = 2048;
    const curve = new Float32Array(samples);
    const drive = 1 + amount * 12;

    for (let index = 0; index < samples; index += 1) {
      const x = (index * 2) / samples - 1;
      curve[index] = Math.tanh(x * drive) / Math.tanh(drive);
    }

    return curve;
  }

  function sampleLinear(input, position) {
    if (position <= 0) {
      return input[0];
    }

    if (position >= input.length - 1) {
      return input[input.length - 1];
    }

    const left = Math.floor(position);
    const right = left + 1;
    const mix = position - left;
    return input[left] * (1 - mix) + input[right] * mix;
  }

  function hannWindow(index, size) {
    return 0.5 - 0.5 * Math.cos((2 * Math.PI * index) / (size - 1));
  }

  function getMonoChannel(audioBuffer) {
    const length = audioBuffer.length;
    const mono = new Float32Array(length);
    const channels = audioBuffer.numberOfChannels;

    for (let channel = 0; channel < channels; channel += 1) {
      const data = audioBuffer.getChannelData(channel);
      for (let index = 0; index < length; index += 1) {
        mono[index] += data[index] / channels;
      }
    }

    return mono;
  }

  function getFrameRms(data, start, size) {
    let sum = 0;
    for (let index = 0; index < size; index += 1) {
      const sample = data[start + index];
      sum += sample * sample;
    }

    return Math.sqrt(sum / size);
  }

  function detectFramePitch(data, start, size, minLag, maxLag, sampleRate) {
    let bestLag = 0;
    let bestCorrelation = 0;

    for (let lag = minLag; lag <= maxLag; lag += 1) {
      let sum = 0;
      let sumA = 0;
      let sumB = 0;

      for (let index = 0; index < size; index += 1) {
        const a = data[start + index];
        const b = data[start + index + lag];
        sum += a * b;
        sumA += a * a;
        sumB += b * b;
      }

      const correlation = sum / Math.sqrt(sumA * sumB || 1);
      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestLag = lag;
      }
    }

    if (!bestLag) {
      return null;
    }

    return {
      frequency: sampleRate / bestLag,
      confidence: bestCorrelation,
    };
  }

  function parseKey(value) {
    const rootName = value.split(" ")[0];
    return { root: NOTE_NAMES.indexOf(rootName) >= 0 ? NOTE_NAMES.indexOf(rootName) : 0 };
  }

  function getNearestScaleMidi(midi, root) {
    const rounded = Math.round(midi);
    let best = rounded;
    let bestDistance = Infinity;

    for (let candidate = rounded - 12; candidate <= rounded + 12; candidate += 1) {
      if (!isScalePitchClass(candidate, root)) {
        continue;
      }

      const distance = Math.abs(candidate - midi);
      if (distance < bestDistance) {
        best = candidate;
        bestDistance = distance;
      }
    }

    return best;
  }

  function isScalePitchClass(midi, root) {
    return MINOR_SCALE.includes(positiveModulo(midi - root, 12));
  }

  function getScaleFit(noteClassCounts, root) {
    const total = noteClassCounts.reduce((sum, count) => sum + count, 0);
    if (!total) {
      return 0;
    }

    const inScale = noteClassCounts.reduce(
      (sum, count, noteClass) => sum + (isScalePitchClass(noteClass, root) ? count : 0),
      0,
    );
    return inScale / total;
  }

  function frequencyToMidi(frequency) {
    return 69 + 12 * Math.log2(frequency / 440);
  }

  function midiToFrequency(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function formatMidiNote(midi) {
    const rounded = Math.round(midi);
    const note = NOTE_NAMES[positiveModulo(rounded, 12)];
    const octave = Math.floor(rounded / 12) - 1;
    return `${note}${octave}`;
  }

  function getWeightedMedian(pitches) {
    const sorted = [...pitches].sort((a, b) => a.midi - b.midi);
    const totalWeight = sorted.reduce((sum, item) => sum + item.weight, 0);
    let running = 0;

    for (const item of sorted) {
      running += item.weight;
      if (running >= totalWeight / 2) {
        return item.midi;
      }
    }

    return sorted.at(-1).midi;
  }

  function positiveModulo(value, divisor) {
    return ((value % divisor) + divisor) % divisor;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  window.PunchLabDSP = {
    NOTE_NAMES,
    MINOR_SCALE,
    analyzePitchBuffer,
    clamp,
    createTunedBuffer,
    formatMidiNote,
    frequencyToMidi,
    getPitchPlan,
    midiToFrequency,
    positiveModulo,
    renderVocalBuffer,
  };
})();
