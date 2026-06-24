(() => {
  const templates = [
    {
      id: "trap-demo",
      name: "Trap Demo",
      intent: "hard tune",
      bpm: 140,
      countIn: "1",
      key: "C minor",
      scaleMode: "minor",
      selectedPresetId: "trap-hard",
      armedTrackId: "main",
      recordLatencyMs: 70,
      markers: [
        { id: "tpl-trap-intro", type: "Intro", time: 0 },
        { id: "tpl-trap-verse", type: "Verse", time: 16 },
        { id: "tpl-trap-hook", type: "Hook", time: 48 },
        { id: "tpl-trap-outro", type: "Outro", time: 64 },
      ],
      tracks: {
        main: { volume: 0.9, pan: 0, muted: false, solo: false },
        double: { volume: 0.7, pan: 0, muted: false, solo: false },
        "adlib-l": { volume: 0.62, pan: -0.48, muted: false, solo: false },
        "adlib-r": { volume: 0.62, pan: 0.48, muted: false, solo: false },
        hook: { volume: 0.82, pan: 0, muted: false, solo: false },
      },
    },
    {
      id: "drill-dark",
      name: "Drill Dark",
      intent: "dark doubles",
      bpm: 142,
      countIn: "1",
      key: "F minor",
      scaleMode: "minor",
      selectedPresetId: "drill-dark",
      armedTrackId: "main",
      recordLatencyMs: 80,
      markers: [
        { id: "tpl-drill-intro", type: "Intro", time: 0 },
        { id: "tpl-drill-verse-a", type: "Verse", time: 8 },
        { id: "tpl-drill-hook", type: "Hook", time: 40 },
        { id: "tpl-drill-verse-b", type: "Verse", time: 56 },
      ],
      tracks: {
        main: { volume: 0.88, pan: 0, muted: false, solo: false },
        double: { volume: 0.64, pan: -0.08, muted: false, solo: false },
        "adlib-l": { volume: 0.58, pan: -0.55, muted: false, solo: false },
        "adlib-r": { volume: 0.58, pan: 0.55, muted: false, solo: false },
        hook: { volume: 0.76, pan: 0, muted: false, solo: false },
      },
    },
    {
      id: "rage-wide",
      name: "Rage Wide",
      intent: "wide hook",
      bpm: 150,
      countIn: "1",
      key: "A minor",
      scaleMode: "chromatic",
      selectedPresetId: "rage-wide",
      armedTrackId: "hook",
      recordLatencyMs: 60,
      markers: [
        { id: "tpl-rage-intro", type: "Intro", time: 0 },
        { id: "tpl-rage-hook-a", type: "Hook", time: 8 },
        { id: "tpl-rage-verse", type: "Verse", time: 24 },
        { id: "tpl-rage-hook-b", type: "Hook", time: 56 },
      ],
      tracks: {
        main: { volume: 0.84, pan: 0, muted: false, solo: false },
        double: { volume: 0.78, pan: 0, muted: false, solo: false },
        "adlib-l": { volume: 0.7, pan: -0.65, muted: false, solo: false },
        "adlib-r": { volume: 0.7, pan: 0.65, muted: false, solo: false },
        hook: { volume: 0.9, pan: 0, muted: false, solo: false },
      },
    },
    {
      id: "hook-demo",
      name: "Hook Demo",
      intent: "clean stack",
      bpm: 128,
      countIn: "2",
      key: "G# minor",
      scaleMode: "minor",
      selectedPresetId: "radio-hook",
      armedTrackId: "hook",
      recordLatencyMs: 70,
      markers: [
        { id: "tpl-hook-intro", type: "Intro", time: 0 },
        { id: "tpl-hook-hook-a", type: "Hook", time: 8 },
        { id: "tpl-hook-verse", type: "Verse", time: 24 },
        { id: "tpl-hook-hook-b", type: "Hook", time: 56 },
      ],
      tracks: {
        main: { volume: 0.78, pan: 0, muted: false, solo: false },
        double: { volume: 0.72, pan: 0, muted: false, solo: false },
        "adlib-l": { volume: 0.54, pan: -0.42, muted: false, solo: false },
        "adlib-r": { volume: 0.54, pan: 0.42, muted: false, solo: false },
        hook: { volume: 0.92, pan: 0, muted: false, solo: false },
      },
    },
  ];

  function cloneTemplate(template) {
    return JSON.parse(JSON.stringify(template));
  }

  function getTemplate(id) {
    const template = templates.find((item) => item.id === id) || templates[0];
    return cloneTemplate(template);
  }

  function listTemplates() {
    return templates.map(cloneTemplate);
  }

  window.PunchLabTemplates = {
    getTemplate,
    listTemplates,
  };
})();
