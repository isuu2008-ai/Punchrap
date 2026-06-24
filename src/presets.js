(() => {
  function makeDefaultCustomPresetId() {
    const randomId = globalThis.crypto?.randomUUID?.();
    if (randomId) {
      return `custom-${randomId}`;
    }

    return `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function getDefaultCompThreshold(comp) {
    const amount = Math.min(1, Math.max(0, Number(comp) || 0) / 100);
    return Math.round(-18 - amount * 18);
  }

  function getDefaultCompRatio(comp) {
    const amount = Math.min(1, Math.max(0, Number(comp) || 0) / 100);
    return Math.round((2.5 + amount * 8) * 2) / 2;
  }

  function getDefaultCompRelease(comp) {
    const amount = Math.min(1, Math.max(0, Number(comp) || 0) / 100);
    return Math.round((80 + (1 - amount) * 180) / 10) * 10;
  }

  function getTuneSettingsForPreset(preset = {}) {
    return {
      retuneSpeed: preset.retune,
      humanize: preset.humanize,
      vibrato: preset.vibrato,
      formant: preset.formant,
      gate: preset.gate,
      deEss: preset.deEss,
      comp: preset.comp,
      compThreshold: preset.compThreshold,
      compRatio: preset.compRatio,
      saturation: preset.saturation,
      space: preset.space,
      delay: preset.delay,
      reverb: preset.reverb,
      width: preset.width,
      lowEq: preset.lowEq,
      midEq: preset.midEq,
      airEq: preset.airEq,
      limiterCeiling: preset.limiterCeiling,
    };
  }

  function createCustomPresetSnapshot({ id, name, tuneSettings = {} } = {}) {
    return {
      id,
      name,
      retune: tuneSettings.retuneSpeed,
      humanize: tuneSettings.humanize,
      vibrato: tuneSettings.vibrato,
      formant: tuneSettings.formant,
      gate: tuneSettings.gate,
      deEss: tuneSettings.deEss,
      comp: tuneSettings.comp,
      compThreshold: tuneSettings.compThreshold,
      compRatio: tuneSettings.compRatio,
      compAttack: tuneSettings.compAttack,
      compRelease: tuneSettings.compRelease,
      saturation: tuneSettings.saturation,
      space: tuneSettings.space,
      delay: tuneSettings.delay,
      reverb: tuneSettings.reverb,
      width: tuneSettings.width,
      lowEq: tuneSettings.lowEq,
      midEq: tuneSettings.midEq,
      airEq: tuneSettings.airEq,
      limiterCeiling: tuneSettings.limiterCeiling,
      custom: true,
    };
  }

  function normalizePreset(preset = {}, { createId = makeDefaultCustomPresetId } = {}) {
    const comp = Number(preset.comp ?? 60);
    return {
      id: preset.id || createId(),
      name: preset.name || "Custom",
      retune: Number(preset.retune ?? 50),
      humanize: Number(preset.humanize ?? 25),
      vibrato: Number(preset.vibrato ?? 55),
      formant: Number(preset.formant ?? 0),
      gate: Number(preset.gate ?? 0),
      deEss: Number(preset.deEss ?? 0),
      comp,
      compThreshold: Number(preset.compThreshold ?? getDefaultCompThreshold(comp)),
      compRatio: Number(preset.compRatio ?? getDefaultCompRatio(comp)),
      compAttack: Number(preset.compAttack ?? 4),
      compRelease: Number(preset.compRelease ?? getDefaultCompRelease(comp)),
      saturation: Number(preset.saturation ?? 35),
      space: Number(preset.space ?? 12),
      delay: Number(preset.delay ?? preset.space ?? 12),
      reverb: Number(preset.reverb ?? Math.round(Number(preset.space ?? 12) * 0.65)),
      width: Number(preset.width ?? 24),
      lowEq: Number(preset.lowEq ?? 0),
      midEq: Number(preset.midEq ?? 0),
      airEq: Number(preset.airEq ?? 0),
      limiterCeiling: Number(preset.limiterCeiling ?? -3),
      custom: Boolean(preset.custom),
    };
  }

  window.PunchLabPresets = {
    createCustomPresetSnapshot,
    getDefaultCompRatio,
    getDefaultCompRelease,
    getDefaultCompThreshold,
    getTuneSettingsForPreset,
    normalizePreset,
  };
})();
