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
- Project zip manifests include the vocal chain automation parameter schema snapshot
- Project zip preview includes a vocal chain automation schema section for archived parameter review
- Project zip preview uses the automation schema to summarize processed take chain values
- Project zip preview shows processed take preset, tune, source, version, and key lineage
- Project zip preview shows take latency compensation, source trim, and fade metadata
- Project zip manifests include processed-take source, version, preset, tune, and automation summaries
- Vocal screen render-version history for source take retunes
- Vocal render-version history supports separate select, audition, best, save, and delete actions
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
- Vocal batch render panel previews target raw takes before rendering
- Vocal batch render can skip raw takes already rendered with the same preset/tune chain
- Processed take version labels, vocal version history, and zip lineage metadata for repeated renders from the same source take
- Project save/open as a local `.punchlab.json` bundle
- File System Access project save/open when available, with browser download/input fallback
- Separated DSP, audio utility, offline mix render, vocal render engine, swappable audio engine interface, and project storage modules under `src/`
- Device management module for browser input/output device enumeration and sink routing
- Engine contract module for native bridge method requirements and shared driver capability defaults
- Native bridge contract stub for future desktop/native audio integration
- Native adapter stub that maps host bridge methods into the swappable PunchLab engine interface
- Native fixture mode via `?nativeFixture=1` for testing the native adapter path in the browser
- Native fixture mode persists from `?nativeFixture=1` and can be cleared with `?nativeFixture=0`
- Native fixture mode is explicitly identified in desktop readiness, record setup, and project zip summaries
- Audio engine status chip showing Web Audio fallback or future native engine activation
- Node package scripts for local start and smoke checks
- PWA manifest, local icon, platform bootstrap, and service worker shell cache for desktop-install preparation
- Desktop host manifest and runtime desktop-readiness diagnostics for future Tauri/Electron/native wrapper integration
- Desktop wrapper manifest for shell size, permission, bridge, and handoff-stage planning
- Tauri shell config scaffold at `src-tauri/tauri.conf.json` for the first desktop wrapper boundary
- Tauri Rust/Cargo scaffold at `src-tauri/Cargo.toml`, `src-tauri/src/main.rs`, and `src-tauri/src/lib.rs`
- Tauri invoke bridge adapter at `src/tauri-bridge.js` for the future native host handoff
- Tauri shell command scaffold for native `getCapabilities` and `getDevices`
- Tauri native render/monitor command stubs for `renderMix`, `renderVocal`, `startInputMonitor`, and `stopInputMonitor`, kept unsupported behind `nativeBridgeReady`
- Tauri native project open/save handoff commands for `.punchlab.json`
- Tauri native latency/buffer preference commands for `getLatencyStats` and `setBufferSize`
- Tauri native output-device handoff command for `setOutputDevice`, kept unsupported until the native audio engine can route audio
- Tauri compressed-export handoff command for `exportCompressedAudio`, kept unsupported until a native MP3/M4A encoder exists
- Tauri plugin-scan handoff command for `scanPluginHosts`, returning an empty VST3/AU scan until a real plugin host exists
- Tauri main-window capability scaffold at `src-tauri/capabilities/main.json`
- Desktop wrapper contract check for shell, permission, bridge, plugin, and handoff-stage requirements
- Desktop contract check validates the Tauri app id, dev server, main window, and bundled manifest resources
- Desktop contract check validates the Tauri Rust entry, library, build script, and dialog/fs plugin initialization
- Desktop contract check validates the Tauri global invoke bridge and `nativeBridgeReady` gate
- Desktop contract check validates that native render/monitoring stays gated while only capabilities/devices commands exist
- Desktop contract check validates partial native host file handoff separately from full native audio readiness
- Native bridge keeps full engine activation hard-gated on `nativeBridgeReady` while partial native host commands remain callable
- Desktop contract check validates Tauri shell buffer preference handoff while native audio latency remains gated
- Desktop readiness separates latency method availability from measured native latency readiness
- Desktop readiness separates native output-routing method availability from audioOutputRouting capability readiness
- Desktop readiness preserves project file open/save handoff state and browser fallback context
- Desktop readiness separates compressed export method availability from compressedAudioExport capability readiness
- Desktop readiness separates plugin scan method availability from pluginHost capability readiness
- Desktop contract check validates selected Tauri capabilities and local-only main-window permissions
- Desktop contract check verifies HTML manifest meta tags and host contract file paths
- Tauri file associations register `.punchlab.json` projects and `.punchlab.zip` archives as PunchLab-owned editor types
- Desktop contract check validates file association extensions, MIME types, and exported type identifiers
- Desktop contract check verifies native output routing permission and `setOutputDevice` alignment
- Native project save/open handoff through optional `saveProjectFile` and `openProjectFile`
- Desktop readiness reports native project file open/save handoff availability
- Tauri project/archive save dialogs choose JSON or ZIP filters from the native file payload
- Desktop readiness exposes wrapper handoff-stage progress for browser, desktop, native engine, and plugin host
- Plugin host manifest separates VST3/AU scan, chain role, and automation contract planning
- Native engine adapter exposes plugin-host scanning through `scanPluginHosts`
- Desktop readiness reports plugin-host scan method availability separately from plugin-host capability
- Topbar plugin scan chip calls native `scanPluginHosts` when available and shows scan count
- Topbar and project zip previews show plugin scan formats and scan freshness when available
- Project zip preview includes a plugin-host detail section for scan status, formats, count, freshness, and source
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
- `.punchlab.json` project bundles include native audio environment summaries
- Project bundles and zip manifests preserve desktop readiness snapshots for wrapper/native/plugin handoff context
- Project load and autosave preserve native audio environment summaries
- Project load restores native buffer-size preference from saved environment fallback when settings are missing
- Engine status latency display falls back to loaded project native audio environment when runtime stats are missing
- Engine status tooltip shows runtime or loaded-project sample rate when available
- Project zip README documents the native audio environment summary for extracted archives
- Project zip preview shows native audio driver, buffer, and latency context in the header
- Project zip preview includes native audio sample-rate context when available
- Project zip preview shows desktop readiness snapshot context for native audio and plugin handoff review
- Project zip desktop readiness snapshot includes compressed export handoff readiness
- Project zip preview lists desktop handoff stages for wrapper, native audio, and plugin host review
- Desktop contract check enforces native audio engine sample-rate, buffer-size, and latency targets
- Desktop readiness exposes native audio engine performance contract status at runtime
- Engine status tooltip includes native audio engine readiness detail without adding another visible panel
- Record setup includes a compact native audio runtime summary for driver, buffer, latency, and sample rate
- Record setup can manually refresh native latency/sample-rate stats when a desktop host supports it
- Native audio summaries preserve and display latency stat freshness timestamps when available
- Timeline view with marker management and take region start/nudge controls
- BPM-based timeline grid with optional beat/bar snap for markers and region starts
- Region rename, color, clip gain, and fade in/out controls persisted in project files
- Region grouping tags for verse, hook, adlib, intro, bridge, and outro
- Track folder headers for lead, adlib, and hook stacks with group mute/solo
- Timeline undo/redo for marker and region edits
- Export tab for track stems, beat stem, vocal stem, dry vocals, and tuned vocals
- Export panel reports native MP3/M4A handoff readiness through compressed-audio capability
- Completed export queue jobs expose MP3/M4A native compressed handoff actions when compressed-audio capability is ready
- Native engine adapter exposes compressed audio export handoff through `exportCompressedAudio`
- Desktop readiness separates compressed export method availability from compressed-audio capability
- Desktop package manifest defines the Tauri-first wrapper, native migration gate, and no-rewrite core boundary
- Project zip manifest and README policy live in `src/project-zip.js` instead of the app UI controller
- Project zip preview sort, playback data, style, and player boilerplate live in `src/project-zip.js`
- Project zip preview automation schema, session, and preset rows are formatted in `src/project-zip.js`
- Project zip preview plugin-host, notes, and desktop-handoff rows are formatted in `src/project-zip.js`
- Project zip preview header summaries for export, plugin scan, native audio, and desktop readiness are formatted in `src/project-zip.js`
- Export mastering finalize logic for loudness normalize, peak normalize, and true-peak ceiling lives in `src/export-mastering.js`
- Export filename, stem group, compressed-format, and job-detail planning lives in `src/export-plan.js`
- Project zip preview beat, marker, and comp rows are formatted in `src/project-zip.js`
- Project zip preview take cards and their processed-chain summaries are formatted in `src/project-zip.js`
- Project zip preview HTML shell is rendered by `src/project-zip.js`; `app.js` only passes archive context
- Project zip archive file map, asset path reservation, and beat/take manifest entries are built by `src/project-zip.js`
- Project zip marker manifest entries and lyric line counts are built by `src/project-zip.js`
- Project zip metadata files (`preview.html`, `manifest.json`, `README.txt`) are finalized by `src/project-zip.js`
- Export queue with sequential job status for mix, stems, beat stem, vocal stem, dry vocals, and tuned vocals
- Export queue retry, remove, and clear-finished controls
- WAV export metadata for artist, title, BPM, key, and software
- Export preview playback and re-download from completed queue jobs
- Project zip export containing the `.punchlab.json` bundle, manifest, README, beat asset, and take audio assets
- Project zip manifests include WAV depth, normalize, loudness target, and recent analysis settings
- Project bundles and zip manifests include sanitized recent export queue history
- Project zip manifests and preview include vocal chain preset summaries
- Project zip manifests and preview include scratch lyrics, marker lyrics, and session notes
- Project zip manifests and preview include session settings for tempo, tuning mode, punch, loop, and snap
- Read-only `preview.html` inside project zip archives for extracted browser timeline playback review
- Project zip preview take cards show region group/color, latency, trim, fade, and processed-chain context
- Record view recent-take review supports immediate audition and per-take Vocal handoff
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
- Input monitoring can hand off to native `startInputMonitor`/`stopInputMonitor` when the active engine supports realtime native monitoring
- Desktop readiness separates native input-monitor method availability from realtimeNativeMonitoring capability readiness
- Custom vocal preset saving and project restore
- Selected custom vocal presets can be updated from the current chain settings
- Custom vocal preset deletion while built-in presets stay protected
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
