# PunchLab

PunchLab is a local rap booth prototype. It runs in the browser, captures a
microphone, records takes into rap-focused tracks, and keeps the project small
enough to grow into a vocal studio.

## Run

```powershell
& "C:\Users\admin\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" .\server.mjs
```

Then open `http://localhost:4173`.

## Current MVP

- Beat upload and playback
- Microphone permission and live input meter
- Count-in
- Main, Double, Adlib L, Adlib R, and Hook tracks
- Take recording and download
- Rap vocal chain preset UI
- Pitch analysis against the selected minor key or chromatic mode
- Frame-level pitch correction and offline vocal chain render to a new processed WAV take
- Retune speed, humanize, and formant controls for rendered vocal takes
- A/B comparison between raw and tuned takes
- Batch render for the current track or all raw vocal takes
- Processed take version labels for repeated renders from the same source take
- Project save/open as a local `.punchlab.json` bundle
- Separated DSP, audio utility, and project storage modules under `src/`
- Timeline view with marker management and take region start/nudge controls
- Region rename, clip gain, and fade in/out controls persisted in project files
- Timeline undo/redo for marker and region edits
- Export tab for track stems, dry vocals, and tuned vocals
- Export queue with sequential job status for mix, stems, dry vocals, and tuned vocals
- IndexedDB autosave with project recovery
- BPM-based metronome toggle for recording and session playback
- Global shortcuts for transport, metronome, stop, and tab switching outside text inputs
- Recording latency compensation in milliseconds, applied to new take placement
- Input monitoring toggle through the Web Audio mic chain
- Custom vocal preset saving and project restore
- Vocal gate and de-ess controls in the offline render chain
- Chromatic pitch-correction mode for rap-style hard tune without key locking
- Manual pitch lane edits for analyzed vocal frames, persisted in project files
- Custom scale editor with 12 pitch-class toggles

## Planning

See [COMMERCIAL_STUDIO_ROADMAP.md](./COMMERCIAL_STUDIO_ROADMAP.md) for the commercial studio checklist and native-app transition criteria.

## Next DSP Steps

- Custom scale editing
- Formant-aware pitch shifting
- Better EQ, compressor, delay, reverb, and limiter controls
- Take comping
