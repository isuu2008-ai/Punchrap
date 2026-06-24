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

  window.PunchLabAudio = {
    downloadBlob,
    encodeWav,
  };
})();
