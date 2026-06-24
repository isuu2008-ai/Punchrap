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

`package.json` also exposes `npm start`, `npm run check`, and `npm run desktop:check` for environments with npm installed.

## Current MVP

- Beat upload and playback
- Microphone permission and live input meter
- Audio input device selector with project persistence
- Playback output device selector when the browser supports sink routing
- Native output device handoff through optional `setOutputDevice`
- Desktop readiness reports native and browser output routing support
- Count-in
- Main, Double, Adlib L, Adlib R, and Hook tracks
- Take recording and download
- Record-screen latest/recent take review playback
- Record-screen latest take handoff into the Vocal workspace
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
- Desktop wrapper manifest for shell size, permission, bridge, and handoff-stage planning
- Desktop wrapper contract check for shell, permission, bridge, plugin, and handoff-stage requirements
- Desktop contract check verifies HTML manifest meta tags and host contract file paths
- Desktop contract check verifies native output routing permission and `setOutputDevice` alignment
- Native project save/open handoff through optional `saveProjectFile` and `openProjectFile`
- Desktop readiness reports native project file open/save handoff availability
- Desktop readiness exposes wrapper handoff-stage progress for browser, desktop, native engine, and plugin host
- Plugin host manifest separates VST3/AU scan, chain role, and automation contract planning
- Native engine adapter exposes plugin-host scanning through `scanPluginHosts`
- Desktop readiness reports plugin-host scan method availability separately from plugin-host capability
- Topbar plugin scan chip calls native `scanPluginHosts` when available and shows scan count
- Project zip manifests include sanitized plugin-host scan summary metadata
- Desktop readiness checks required audio engine capabilities before native handoff
- Desktop readiness reports native latency statistics and buffer-size control availability
- Native bridge exposes optional latency statistics and buffer-size control through the engine adapter
- Project settings persist a native buffer-size preference and apply it through `setBufferSize` when available
- Record setup includes a compact native buffer-size selector for future desktop low-latency tuning
- Desktop readiness includes the selected native buffer-size preference for runtime diagnostics
- Platform can refresh native latency stats and expose runtime round-trip latency in desktop readiness
- Engine status tooltip shows the selected native buffer size alongside desktop readiness
- Engine status tooltip shows runtime native round-trip latency when available
- Project zip manifests include native audio driver, buffer, and latency environment summaries
- Project zip README documents the native audio environment summary for extracted archives
- Project zip preview shows native audio driver, buffer, and latency context in the header
- Desktop contract check enforces native audio engine sample-rate, buffer-size, and latency targets
- Desktop readiness exposes native audio engine performance contract status at runtime
- Engine status tooltip includes native audio engine readiness detail without adding another visible panel
- Timeline view with marker management and take region start/nudge controls
- BPM-based timeline grid with optional beat/bar snap for markers and region starts
- Region rename, color, clip gain, and fade in/out controls persisted in project files
- Region grouping tags for verse, hook, adlib, intro, bridge, and outro
- Track folder headers for lead, adlib, and hook stacks with group mute/solo
- Timeline undo/redo for marker and region edits
- Export tab for track stems, beat stem, vocal stem, dry vocals, and tuned vocals
- Export panel reports native MP3/M4A handoff readiness through compressed-audio capability
- Native engine adapter exposes compressed audio export handoff through `exportCompressedAudio`
- Desktop readiness separates compressed export method availability from compressed-audio capability
- Export queue with sequential job status for mix, stems, beat stem, vocal stem, dry vocals, and tuned vocals
- Export queue retry, remove, and clear-finished controls
- WAV export metadata for artist, title, BPM, key, and software
- Export preview playback and re-download from completed queue jobs
- Project zip export containing the `.punchlab.json` bundle, manifest, README, beat asset, and take audio assets
- Project zip manifests include WAV depth, normalize, loudness target, and recent analysis settings
- Read-only `preview.html` inside project zip archives for extracted browser timeline playback review
- Recording waveform capture with saved take waveform thumbnails
- Export peak normalization to -1 dBFS
- Optional export loudness normalization to -14 LUFS
- True-peak ceiling protection on vocal renders and WAV exports
- 16-bit or 24-bit WAV export depth selection
- Export loudness analysis with K-weighted LUFS estimate, true peak estimate, clipping count, clip-risk status, and -14 LUFS target gain
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
