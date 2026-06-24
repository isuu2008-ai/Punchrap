# PunchLab

PunchLab is a local rap booth prototype. It runs in the browser, captures a
microphone, records takes into rap-focused tracks, and keeps the project small
enough to grow into a vocal studio.

## Run

```powershell
node .\server.mjs
```

Then open `http://localhost:4173`.

## Check

```powershell
node .\scripts\check.mjs
```

`package.json` also exposes `npm start` and `npm run check` for environments with npm installed.

## Current MVP

- Beat upload and playback
- Microphone permission and live input meter
- Audio input device selector with project persistence
- Playback output device selector when the browser supports sink routing
- Count-in
- Main, Double, Adlib L, Adlib R, and Hook tracks
- Take recording and download
- Record-screen latest/recent take review playback
- Rap vocal chain preset UI
- Vocal chain parameter manifest for automation/native/plugin mapping
- Processed take chain snapshots include plugin-style automation parameter state
- Project zip manifests include processed-take source, version, preset, tune, and automation summaries
- Vocal screen render-version history for source take retunes
- Pitch analysis against the selected minor key or chromatic mode
- Adaptive pitch detection with low-level thresholding, lag refinement, and octave-jump smoothing
- Frame-level pitch correction and offline vocal chain render to a new processed WAV take
- Transient-preserving dry blend for pitch-corrected vocal renders
- Note-transition smoothing for frame-level pitch correction
- Vibrato preserve/remove control for rendered vocal takes
- Retune speed, humanize, and formant controls for rendered vocal takes
- Correction-aware formant compensation for pitch-shifted vocal renders
- User-adjustable compressor, space, and width controls for vocal renders and custom presets
- Advanced compressor threshold, ratio, attack, and release controls for vocal renders
- User-adjustable saturation control for vocal renders and custom presets
- User-adjustable low, mid, air EQ and limiter ceiling controls for vocal renders and custom presets
- User-adjustable delay and reverb controls for vocal renders and custom presets
- A/B comparison between raw and tuned takes
- Batch render for the current track or all raw vocal takes
- Batch render for comp lane raw takes and best raw takes
- Processed take version labels, vocal version history, and zip lineage metadata for repeated renders from the same source take
- Project save/open as a local `.punchlab.json` bundle
- File System Access project save/open when available, with browser download/input fallback
- Separated DSP, audio utility, offline mix render, vocal render engine, swappable audio engine interface, and project storage modules under `src/`
- Device management module for browser input/output device enumeration and sink routing
- Engine contract module for native bridge method requirements and shared driver capability defaults
- Native bridge contract stub for future desktop/native audio integration
- Native adapter stub that maps host bridge methods into the swappable PunchLab engine interface
- Native fixture mode via `?nativeFixture=1` for testing the native adapter path in the browser
- Audio engine status chip showing Web Audio fallback or future native engine activation
- Node package scripts for local start and smoke checks
- PWA manifest, local icon, platform bootstrap, and service worker shell cache for desktop-install preparation
- Desktop host manifest and runtime desktop-readiness diagnostics for future Tauri/Electron/native wrapper integration
- Timeline view with marker management and take region start/nudge controls
- BPM-based timeline grid with optional beat/bar snap for markers and region starts
- Region rename, color, clip gain, and fade in/out controls persisted in project files
- Region grouping tags for verse, hook, adlib, intro, bridge, and outro
- Track folder headers for lead, adlib, and hook stacks with group mute/solo
- Timeline undo/redo for marker and region edits
- Export tab for track stems, beat stem, vocal stem, dry vocals, and tuned vocals
- Export queue with sequential job status for mix, stems, beat stem, vocal stem, dry vocals, and tuned vocals
- Export queue retry, remove, and clear-finished controls
- WAV export metadata for artist, title, BPM, key, and software
- Export preview playback and re-download from completed queue jobs
- Project zip export containing the `.punchlab.json` bundle, manifest, README, beat asset, and take audio assets
- Read-only `preview.html` inside project zip archives for extracted browser timeline playback review
- Recording waveform capture with saved take waveform thumbnails
- Export peak normalization to -1 dBFS
- Optional export loudness normalization to -14 LUFS
- True-peak ceiling protection on vocal renders and WAV exports
- 16-bit or 24-bit WAV export depth selection
- Export loudness analysis with K-weighted LUFS estimate, true peak estimate, clipping count, and -14 LUFS target gain
- IndexedDB autosave with rolling project backups and recovery fallback
- Version history selector for restoring a specific rolling project backup
- BPM-based metronome toggle for recording and session playback
- Cancelable 1, 2, or 4 bar count-in before recording
- Global shortcuts for transport, metronome, stop, and tab switching outside text inputs
- Recording latency compensation in milliseconds, applied to new take placement and shown in take review metadata
- Punch + Loop recording mode that keeps stacking takes until stopped
- Input monitoring toggle through the Web Audio mic chain
- Custom vocal preset saving and project restore
- Vocal gate and de-ess controls in the offline render chain
- Chromatic pitch-correction mode for rap-style hard tune without key locking
- Fixed MIDI target-note mode for robotic hard-tune effects
- Manual pitch lane edits for analyzed vocal frames, persisted in project files
- Custom scale editor with 12 pitch-class toggles
- Take comp selection with a dedicated comp playlist review button
- Dedicated Comp view for comp lane ordering, take-pool add/remove, and persisted comp order
- Best take marking with one-click add of best takes into the comp lane
- Project templates for trap, drill, rage hook, and clean hook sessions
- Marker-linked lyric sections with project-persisted scratch lyrics and session notes
- Timeline marker comments with autosave and undo/redo support
- Timeline region duplicate/delete actions
- Take rename from the Takes tab with project persistence
- Track rename with take label propagation
- Non-destructive region trim controls with playback/export source-offset support

## Planning

See [COMMERCIAL_STUDIO_ROADMAP.md](./COMMERCIAL_STUDIO_ROADMAP.md) for the commercial studio checklist and native-app transition criteria.

## Next DSP Steps

- Desktop wrapper shell integration
- Native audio engine implementation behind the existing bridge/interface contracts
