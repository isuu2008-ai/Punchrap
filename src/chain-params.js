(() => {
  const PARAMETERS = [
    makeParam("retuneSpeed", "Retune Speed", "tune", 0, 100, 1, 88, "%"),
    makeParam("humanize", "Humanize", "tune", 0, 100, 1, 10, "%"),
    makeParam("vibrato", "Vibrato Preserve", "tune", 0, 100, 1, 42, "%"),
    makeParam("formant", "Formant", "tune", -50, 50, 1, 0, "st"),
    makeParam("gate", "Gate", "dynamics", 0, 100, 1, 0, "%"),
    makeParam("deEss", "De-ess", "dynamics", 0, 100, 1, 0, "%"),
    makeParam("comp", "Compressor", "dynamics", 0, 100, 1, 72, "%"),
    makeParam("compThreshold", "Compressor Threshold", "dynamics", -48, -6, 1, -31, "dB"),
    makeParam("compRatio", "Compressor Ratio", "dynamics", 1.5, 12, 0.5, 8.5, ":1"),
    makeParam("compAttack", "Compressor Attack", "dynamics", 1, 30, 1, 4, "ms"),
    makeParam("compRelease", "Compressor Release", "dynamics", 40, 320, 10, 130, "ms"),
    makeParam("saturation", "Saturation", "color", 0, 100, 1, 38, "%"),
    makeParam("space", "Space", "space", 0, 100, 1, 18, "%"),
    makeParam("delay", "Delay", "space", 0, 100, 1, 18, "%"),
    makeParam("reverb", "Reverb", "space", 0, 100, 1, 12, "%"),
    makeParam("width", "Width", "space", 0, 100, 1, 42, "%"),
    makeParam("lowEq", "Low EQ", "tone", -12, 12, 0.5, 0, "dB"),
    makeParam("midEq", "Mid EQ", "tone", -12, 12, 0.5, 0, "dB"),
    makeParam("airEq", "Air EQ", "tone", -12, 12, 0.5, 0, "dB"),
    makeParam("limiterCeiling", "Limiter Ceiling", "output", -8, 0, 0.5, -3, "dB"),
  ];

  const PARAMETER_MAP = new Map(PARAMETERS.map((parameter) => [parameter.id, parameter]));

  function makeParam(id, label, group, min, max, step, defaultValue, unit) {
    return {
      automationId: `punchlab.${id}`,
      defaultValue,
      group,
      id,
      label,
      max,
      min,
      step,
      unit,
    };
  }

  function getParameters() {
    return PARAMETERS.map(cloneParameter);
  }

  function getParameter(id) {
    const parameter = PARAMETER_MAP.get(id);
    return parameter ? cloneParameter(parameter) : null;
  }

  function coerceSettings(settings = {}) {
    return PARAMETERS.reduce((output, parameter) => {
      output[parameter.id] = coerceParameterValue(parameter.id, settings[parameter.id]);
      return output;
    }, {});
  }

  function coerceParameterValue(id, value) {
    const parameter = PARAMETER_MAP.get(id);
    if (!parameter) {
      return Number(value) || 0;
    }

    const numeric = Number.isFinite(Number(value)) ? Number(value) : parameter.defaultValue;
    const clamped = Math.max(parameter.min, Math.min(parameter.max, numeric));
    return Math.round(clamped / parameter.step) * parameter.step;
  }

  function getAutomationManifest() {
    return {
      version: 1,
      parameters: getParameters(),
    };
  }

  function createAutomationState(settings = {}, metadata = {}) {
    const coercedSettings = coerceSettings(settings);
    return {
      metadata: { ...metadata },
      parameters: PARAMETERS.map((parameter) => ({
        automationId: parameter.automationId,
        id: parameter.id,
        value: coercedSettings[parameter.id],
      })),
      version: 1,
    };
  }

  function cloneParameter(parameter) {
    return { ...parameter };
  }

  window.PunchLabChainParams = {
    coerceParameterValue,
    coerceSettings,
    createAutomationState,
    getAutomationManifest,
    getParameter,
    getParameters,
  };
})();
