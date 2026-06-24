(() => {
  function encodeWav(audioBuffer, metadata = null) {
    const channels = Math.min(2, audioBuffer.numberOfChannels);
    const sampleRate = audioBuffer.sampleRate;
    const sampleCount = audioBuffer.length;
    const bytesPerSample = 2;
    const blockAlign = channels * bytesPerSample;
    const dataBytes = sampleCount * blockAlign;
    const infoChunk = makeInfoChunk(metadata);
    const buffer = new ArrayBuffer(44 + dataBytes + infoChunk.length);
    const view = new DataView(buffer);
    const channelData = Array.from({ length: channels }, (_, index) => audioBuffer.getChannelData(index));

    writeString(view, 0, "RIFF");
    view.setUint32(4, buffer.byteLength - 8, true);
    writeString(view, 8, "WAVE");
    writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, "data");
    view.setUint32(40, dataBytes, true);

    let offset = 44;
    for (let i = 0; i < sampleCount; i += 1) {
      for (let channel = 0; channel < channels; channel += 1) {
        const sample = Math.max(-1, Math.min(1, channelData[channel][i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
        offset += bytesPerSample;
      }
    }

    new Uint8Array(buffer).set(infoChunk, offset);
    return new Blob([buffer], { type: "audio/wav" });
  }

  function makeInfoChunk(metadata) {
    const entries = [
      ["INAM", metadata?.title],
      ["IART", metadata?.artist],
      ["IBPM", metadata?.bpm],
      ["IKEY", metadata?.key],
      ["ISFT", metadata?.software || "PunchLab"],
    ].filter(([, value]) => String(value || "").trim());

    if (!entries.length) {
      return new Uint8Array();
    }

    const chunks = entries.map(([id, value]) => makeInfoSubChunk(id, String(value).trim()));
    const payloadSize = 4 + chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const output = new Uint8Array(8 + payloadSize + (payloadSize % 2));
    const view = new DataView(output.buffer);
    writeString(view, 0, "LIST");
    view.setUint32(4, payloadSize, true);
    writeString(view, 8, "INFO");

    let offset = 12;
    chunks.forEach((chunk) => {
      output.set(chunk, offset);
      offset += chunk.length;
    });

    return output;
  }

  function makeInfoSubChunk(id, value) {
    const encoded = new TextEncoder().encode(`${value}\0`);
    const paddedSize = encoded.length + (encoded.length % 2);
    const output = new Uint8Array(8 + paddedSize);
    const view = new DataView(output.buffer);
    writeString(view, 0, id);
    view.setUint32(4, encoded.length, true);
    output.set(encoded, 8);
    return output;
  }

  function writeString(view, offset, text) {
    for (let index = 0; index < text.length; index += 1) {
      view.setUint8(offset + index, text.charCodeAt(index));
    }
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

  function analyzeLoudness(audioBuffer) {
    const channels = Math.min(2, audioBuffer.numberOfChannels);
    const sampleRate = audioBuffer.sampleRate;
    const sampleCount = audioBuffer.length;
    const weightedChannels = getKWeightedChannels(audioBuffer, channels);
    const wholeEnergy = getMeanSquare(weightedChannels, 0, sampleCount);
    const samplePeak = getPeak(audioBuffer, channels);
    const truePeak = getTruePeak(audioBuffer, channels);
    const clippingSamples = countClippingSamples(audioBuffer, channels);
    const blocks = getLoudnessBlocks(weightedChannels, sampleRate);
    const gatedBlocks = getGatedBlocks(blocks);
    const integratedEnergy = mean(gatedBlocks.map((block) => block.energy), wholeEnergy);
    const integratedLufs = energyToLufs(integratedEnergy);
    const peakDbfs = amplitudeToDb(samplePeak);
    const truePeakDbfs = amplitudeToDb(truePeak);
    const rmsDbfs = energyToDb(wholeEnergy);

    return {
      integratedLufs,
      peakDbfs,
      truePeakDbfs,
      rmsDbfs,
      dynamicRange: Number.isFinite(integratedLufs) && Number.isFinite(truePeakDbfs) ? truePeakDbfs - integratedLufs : 0,
      recommendedGainDb: Number.isFinite(integratedLufs) ? -14 - integratedLufs : 0,
      clippingSamples,
      duration: sampleCount / sampleRate,
      sampleRate,
      measuredBlocks: blocks.length,
      gatedBlocks: gatedBlocks.length,
    };
  }

  function getLoudnessBlocks(channelData, sampleRate) {
    const blockSize = Math.max(1, Math.round(sampleRate * 0.4));
    const hopSize = Math.max(1, Math.round(sampleRate * 0.1));
    const sampleCount = channelData[0]?.length || 0;
    const blocks = [];

    for (let start = 0; start < sampleCount; start += hopSize) {
      const end = Math.min(sampleCount, start + blockSize);
      if (end <= start) {
        continue;
      }

      const energy = getMeanSquare(channelData, start, end);
      blocks.push({ energy, lufs: energyToLufs(energy) });
    }

    return blocks;
  }

  function getGatedBlocks(blocks) {
    const absoluteGated = blocks.filter((block) => block.lufs > -70);
    if (!absoluteGated.length) {
      return [];
    }

    const ungatedLufs = energyToLufs(mean(absoluteGated.map((block) => block.energy)));
    const gate = Math.max(-70, ungatedLufs - 10);
    return absoluteGated.filter((block) => block.lufs > gate);
  }

  function getMeanSquare(channelData, start, end) {
    let sum = 0;
    let count = 0;
    for (let channel = 0; channel < channelData.length; channel += 1) {
      const data = channelData[channel];
      for (let index = start; index < end; index += 1) {
        sum += data[index] * data[index];
        count += 1;
      }
    }
    return count ? sum / count : 0;
  }

  function getKWeightedChannels(audioBuffer, channels) {
    const highPass = makeHighPassCoefficients(audioBuffer.sampleRate, 60, 0.5);
    const highShelf = makeHighShelfCoefficients(audioBuffer.sampleRate, 1500, 4, 0.707);
    return Array.from({ length: channels }, (_, channel) => {
      const input = audioBuffer.getChannelData(channel);
      return applyBiquad(applyBiquad(input, highPass), highShelf);
    });
  }

  function makeHighPassCoefficients(sampleRate, frequency, q) {
    const omega = (2 * Math.PI * frequency) / sampleRate;
    const cos = Math.cos(omega);
    const alpha = Math.sin(omega) / (2 * q);
    const b0 = (1 + cos) / 2;
    const b1 = -(1 + cos);
    const b2 = (1 + cos) / 2;
    const a0 = 1 + alpha;
    const a1 = -2 * cos;
    const a2 = 1 - alpha;
    return normalizeBiquad({ b0, b1, b2, a0, a1, a2 });
  }

  function makeHighShelfCoefficients(sampleRate, frequency, gainDb, q) {
    const amplitude = Math.pow(10, gainDb / 40);
    const omega = (2 * Math.PI * frequency) / sampleRate;
    const cos = Math.cos(omega);
    const alpha = Math.sin(omega) / (2 * q);
    const sqrtA = Math.sqrt(amplitude);
    const b0 = amplitude * ((amplitude + 1) + (amplitude - 1) * cos + 2 * sqrtA * alpha);
    const b1 = -2 * amplitude * ((amplitude - 1) + (amplitude + 1) * cos);
    const b2 = amplitude * ((amplitude + 1) + (amplitude - 1) * cos - 2 * sqrtA * alpha);
    const a0 = (amplitude + 1) - (amplitude - 1) * cos + 2 * sqrtA * alpha;
    const a1 = 2 * ((amplitude - 1) - (amplitude + 1) * cos);
    const a2 = (amplitude + 1) - (amplitude - 1) * cos - 2 * sqrtA * alpha;
    return normalizeBiquad({ b0, b1, b2, a0, a1, a2 });
  }

  function normalizeBiquad(coefficients) {
    return {
      b0: coefficients.b0 / coefficients.a0,
      b1: coefficients.b1 / coefficients.a0,
      b2: coefficients.b2 / coefficients.a0,
      a1: coefficients.a1 / coefficients.a0,
      a2: coefficients.a2 / coefficients.a0,
    };
  }

  function applyBiquad(input, coefficients) {
    const output = new Float32Array(input.length);
    let x1 = 0;
    let x2 = 0;
    let y1 = 0;
    let y2 = 0;

    for (let index = 0; index < input.length; index += 1) {
      const x0 = input[index];
      const y0 = coefficients.b0 * x0 + coefficients.b1 * x1 + coefficients.b2 * x2 - coefficients.a1 * y1 - coefficients.a2 * y2;
      output[index] = y0;
      x2 = x1;
      x1 = x0;
      y2 = y1;
      y1 = y0;
    }

    return output;
  }

  function getPeak(audioBuffer, channels) {
    let peak = 0;
    for (let channel = 0; channel < channels; channel += 1) {
      const data = audioBuffer.getChannelData(channel);
      for (let index = 0; index < data.length; index += 1) {
        peak = Math.max(peak, Math.abs(data[index]));
      }
    }
    return peak;
  }

  function getTruePeak(audioBuffer, channels) {
    let peak = 0;
    for (let channel = 0; channel < channels; channel += 1) {
      const data = audioBuffer.getChannelData(channel);
      if (!data.length) {
        continue;
      }

      peak = Math.max(peak, Math.abs(data[0]));
      for (let index = 1; index < data.length; index += 1) {
        const previous = data[index - 1];
        const current = data[index];
        peak = Math.max(peak, Math.abs(current));
        for (let step = 1; step < 4; step += 1) {
          const t = step / 4;
          peak = Math.max(peak, Math.abs(previous + (current - previous) * t));
        }
      }
    }
    return peak;
  }

  function countClippingSamples(audioBuffer, channels) {
    let count = 0;
    for (let channel = 0; channel < channels; channel += 1) {
      const data = audioBuffer.getChannelData(channel);
      for (let index = 0; index < data.length; index += 1) {
        if (Math.abs(data[index]) >= 0.999) {
          count += 1;
        }
      }
    }
    return count;
  }

  function mean(values, fallback = 0) {
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : fallback;
  }

  function energyToLufs(energy) {
    return energy > 0 ? -0.691 + 10 * Math.log10(energy) : Number.NEGATIVE_INFINITY;
  }

  function energyToDb(energy) {
    return energy > 0 ? 10 * Math.log10(energy) : Number.NEGATIVE_INFINITY;
  }

  function amplitudeToDb(amplitude) {
    return amplitude > 0 ? 20 * Math.log10(amplitude) : Number.NEGATIVE_INFINITY;
  }

  window.PunchLabAudio = {
    analyzeLoudness,
    downloadBlob,
    encodeWav,
  };
})();
