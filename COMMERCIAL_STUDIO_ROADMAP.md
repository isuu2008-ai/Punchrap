# PunchLab 상용급 스튜디오 로드맵

이 문서는 PunchLab을 단순한 브라우저 녹음 장난감이 아니라, 실제로 쓸 수 있는 랩 녹음 스튜디오로 키우기 위한 체크리스트입니다.

현재 PunchLab은 브라우저 기반 프로토타입입니다. 이미 녹음, 여러 트랙, take 관리, pitch 분석, frame-level 튠 렌더, formant-aware pitch shifting 기본형, vibrato preserve/remove 기본형, 보컬 체인 세부 컨트롤 1차, EQ/limiter 세부 컨트롤 1차, delay/reverb 세부 컨트롤 1차, 전체 믹스/vocal stem export, A/B 비교, batch render, minor/chromatic/custom 튠 모드, manual pitch lane, timeline undo/redo, render/export queue, take comping 기본형, comp lane editing, WAV export metadata, export preview, project zip export asset 포함형, File System Access 기반 프로젝트 저장/열기 fallback, waveform recording view, export peak normalize, K-weighted LUFS/true peak analysis 기본형, true-peak ceiling limiter 기본형까지 들어가 있습니다. 지금 단계에서는 브라우저로 계속 빠르게 기능을 검증하는 것이 맞습니다.

현재 추가 완료:

- DSP 코드를 `src/dsp.js`로 분리
- WAV 인코딩/다운로드 유틸을 `src/audio.js`로 분리
- Offline mix render 엔진을 `src/mix.js`로 분리
- Vocal render/analyze 엔진을 `src/vocal.js`로 분리
- Swappable audio engine interface `src/engine.js` 추가
- Native bridge contract `src/native-bridge.js` 추가
- Engine contract `src/engine-contract.js` 추가
- native bridge required methods와 Web Audio/native capability 기본값을 한 곳에서 공유
- Audio engine status 1차
- 현재 Web Audio fallback인지 future native engine인지 상단 상태칩으로 표시
- 프로젝트 저장/불러오기 계층을 `src/project.js`로 분리
- `package.json` start/check script 추가
- `scripts/check.mjs` smoke check 추가
- PWA manifest/icon/service worker 추가
- Platform bootstrap `src/platform.js` 추가
- Desktop wrapper integration 1차
- `desktop-host-manifest.json`과 `src/desktop.js`로 native wrapper 계약/준비 상태를 분리
- Desktop engine capability readiness 1차
- native 전환 전 필수 audio engine capability 누락 여부를 readiness check로 표시
- Compressed export handoff readiness 1차
- MP3/M4A는 native compressedAudioExport capability가 켜질 때 Export 패널에서 준비 상태 표시
- Compressed export adapter 1차
- native exportCompressedAudio를 PunchLabEngine API로 노출하고 fixture 응답을 추가
- Compressed export queue action 1차
- 완료된 WAV export job에서 native compressedAudioExport capability가 준비된 경우 MP3/M4A handoff 실행
- Compressed export method readiness 1차
- exportCompressedAudio method 지원 여부와 compressedAudioExport capability 상태를 desktop readiness에서 분리 표시
- Native latency/buffer readiness 1차
- getLatencyStats와 setBufferSize 지원 여부를 desktop readiness에서 분리 표시
- getLatencyStats와 setBufferSize를 optional native method로 분리하고 engine adapter에서 호출 가능하게 연결
- Native buffer size project setting 1차
- 프로젝트 설정에 native buffer size 선호값을 저장하고 복원 시 setBufferSize native handoff로 적용
- Native buffer size control 1차
- Record 화면의 Session 설정에 compact native buffer size selector를 추가하고 변경 시 setBufferSize handoff를 시도
- Native buffer size readiness payload 1차
- 선택한 native buffer size 선호값을 platform preferences와 desktop readiness payload에 노출
- Native buffer size tooltip 1차
- engine status tooltip에 현재 선택한 native buffer size를 표시
- Native latency stats refresh 1차
- getLatencyStats 결과를 platform latencyStats와 desktop readiness runtimeRoundTripLatencyMs로 노출
- Native latency tooltip 1차
- engine status tooltip에 runtime round-trip latency를 표시
- Native audio zip manifest summary 1차
- project zip manifest에 native audio driver, buffer, latency 환경 요약을 포함
- Desktop readiness environment snapshot 1차
- project bundle과 zip manifest에 wrapper/native/plugin handoff readiness snapshot을 저장
- Native audio zip README note 1차
- project zip README에 nativeAudio 환경 요약 포함 사실을 명시
- Native audio zip preview summary 1차
- project zip preview header에 native audio driver, buffer, latency 요약을 표시
- Native audio zip preview sample rate 1차
- project zip preview header에 native audio sample rate를 함께 표시
- Desktop readiness zip preview summary 1차
- project zip preview header에 desktop/native/plugin readiness snapshot 요약을 표시
- Compressed export readiness snapshot 1차
- project bundle과 zip preview의 desktop readiness snapshot에 compressed export handoff readiness를 보존
- Desktop handoff zip preview stage list 1차
- project zip preview에 browser, wrapper, native audio, plugin host handoff stage 상태 목록을 표시
- Native audio project bundle summary 1차
- `.punchlab.json` project bundle에 native audio 환경 요약을 저장
- Native audio project environment restore 1차
- project load/autosave 경로에서 native audio 환경 요약을 보존
- Native buffer environment fallback 1차
- settings.nativeBufferSize가 없는 project load에서 environment.nativeAudio.preferredBufferSize를 fallback으로 복원
- Native latency environment fallback 1차
- runtime latency가 없을 때 loaded project environment의 round-trip latency를 engine status에 fallback 표시
- Native sample-rate tooltip 1차
- runtime stats 또는 loaded project environment의 sample rate를 engine status tooltip에 표시
- Native audio record summary 1차
- Record Session 패널에 driver, buffer, latency, sample rate compact summary를 표시
- Native latency manual refresh 1차
- Record Session 패널에서 getLatencyStats를 수동 갱신해 latency/sample rate runtime 상태를 다시 표시
- Native latency freshness timestamp 1차
- platform/readiness/project/preview 경로에 latency stats 갱신 시각을 보존하고 표시
- Native adapter 1차
- `src/native-adapter.js`가 native host bridge를 swappable engine interface로 연결
- Desktop wrapper manifest 1차
- Tauri/Electron wrapper에 필요한 shell, 권한, bridge, handoff stage 계약을 `desktop-wrapper-manifest.json`으로 분리
- Tauri shell config scaffold 1차
- `src-tauri/tauri.conf.json`에 PunchLab app id, dev server, main window, bundle resource 계약을 추가
- Tauri Rust/Cargo scaffold 1차
- `src-tauri/Cargo.toml`, `src-tauri/build.rs`, `src-tauri/src/main.rs`, `src-tauri/src/lib.rs`로 Tauri desktop shell entry를 추가
- Tauri invoke bridge adapter 1차
- `src/tauri-bridge.js`가 `window.__TAURI__.core.invoke`의 status command를 probe하고 partial `__PUNCHLAB_NATIVE__` host를 설치하되 full native engine은 `nativeBridgeReady`로 gate
- Tauri native introspection commands 1차
- Rust Tauri shell에 `get_capabilities`, `get_devices` command를 추가하되 render/monitoring 미구현 상태에서는 `nativeBridgeReady=false`를 유지
- Tauri required native command stubs 1차
- Rust Tauri shell에 `render_mix`, `render_vocal`, `start_input_monitor`, `stop_input_monitor` command stub을 추가하되 `unsupported=true`와 `nativeBridgeReady=false`로 full native engine 전환을 차단
- Tauri project file handoff commands 1차
- Rust Tauri shell에 `open_project_file`, `save_project_file` command를 추가하고 `.punchlab.json`을 data URL 기반으로 JS project loader와 연결
- Tauri latency/buffer shell commands 1차
- Rust Tauri shell에 `get_latency_stats`, `set_buffer_size` command를 추가하고 native audio engine 미준비 상태에서는 latency 값을 null로 유지
- Tauri output-device shell command 1차
- Rust Tauri shell에 `set_output_device` command를 추가하되 native audio engine 미준비 상태에서는 `unsupported=true`를 반환
- Tauri compressed-export shell command 1차
- Rust Tauri shell에 `export_compressed_audio` command를 추가하되 native MP3/M4A encoder 미준비 상태에서는 `unsupported=true`를 반환
- Tauri plugin-scan shell command 1차
- Rust Tauri shell에 `scan_plugin_hosts` command를 추가하되 real plugin host 미준비 상태에서는 빈 VST3/AU scan 결과와 `plugin_host_ready=false`를 반환
- Tauri main capability scaffold 1차
- `src-tauri/capabilities/main.json`에 main window, core/dialog/fs 기본 permission 계약을 추가
- Tauri desktop npm scripts 1차
- `package.json`에 `desktop:dev`, `desktop:build`, `tauri:dev`, `tauri:build`와 `@tauri-apps/cli` devDependency를 추가
- Tauri desktop doctor 1차
- `scripts/desktop-doctor.mjs`로 Node/npm/Rust/Cargo와 Tauri shell config 준비 상태를 확인
- Desktop package tooling contract check 1차
- `desktop-package-manifest.json`과 `scripts/check-desktop-contract.mjs`에서 Tauri CLI/scripts/verification command 정합성을 검증
- Tauri dev server command fix 1차
- `beforeDevCommand`를 project root 기준 `node server.mjs`로 고정하고 contract/doctor에서 검증
- Desktop wrapper contract check 1차
- shell size, local-first permission, native bridge, plugin host, handoff stage 조건을 `scripts/check-desktop-contract.mjs`에서 검증
- Tauri shell contract check 1차
- Tauri config의 schema/app id/dev server/window/bundle resource 정합성을 `scripts/check-desktop-contract.mjs`에서 검증
- Tauri Rust scaffold contract check 1차
- Cargo package/lib, build.rs, main.rs, lib.rs plugin 초기화 계약을 `scripts/check-desktop-contract.mjs`에서 검증
- Tauri invoke bridge contract check 1차
- `withGlobalTauri`, `get_punchlab_bridge_status`, planned native method, fallback safety gate를 contract check에서 검증
- Tauri native introspection contract check 1차
- `getCapabilities/getDevices` 구현 목록과 native audio activation gate가 분리되어 있는지 검증
- Partial native host contract check 1차
- `nativeHostAvailable`과 full native engine `available`을 분리해 project file handoff가 native audio 완성 전에도 동작하도록 검증
- Native bridge hard gate 1차
- partial native host에 required method stub이 추가되어도 `nativeBridgeReady=false`면 full native engine이 활성화되지 않도록 shared bridge에서 hard gate
- Tauri latency/buffer shell contract check 1차
- shell-level buffer preference와 native audio latency readiness가 분리되어 있는지 검증
- Latency readiness split 1차
- `getLatencyStats/setBufferSize` method availability와 실제 measured latency stats readiness를 desktop readiness에서 분리
- Output routing readiness split 1차
- `setOutputDevice` method availability와 실제 `audioOutputRouting` capability readiness를 desktop readiness에서 분리
- Compressed export readiness split 보강
- `exportCompressedAudio` method availability와 실제 `compressedAudioExport` capability readiness를 desktop readiness에서 분리
- Plugin scan readiness split 보강
- `scanPluginHosts` method availability와 실제 `pluginHost` capability readiness를 desktop readiness에서 분리
- Tauri capability contract check 1차
- `tauri.conf.json` security.capabilities, capability permissions, package/wrapper manifest 정합성을 검증
- Tauri file association scaffold 1차
- `.punchlab.json`, `.punchlab.zip` file association을 Tauri bundle config와 desktop manifests에 등록
- Desktop file association contract check 1차
- file association extension, MIME type, exported type identifier 정합성을 contract check에서 검증
- Desktop manifest reference check 1차
- index.html meta manifest 참조와 desktop-host contract file path 존재 여부를 contract check에서 검증
- Output routing contract check 1차
- `audioOutputRouting` permission과 `setOutputDevice` optional native method의 정합성을 desktop contract check에서 검증
- Native audio engine performance contract 1차
- desktop host manifest에 44.1/48kHz, 64/128/256 buffer, 10ms 이하 round-trip latency, exclusive audio thread 조건을 명시하고 contract check에서 검증
- Native audio engine readiness payload 1차
- desktop readiness가 native audio engine 성능 계약 충족 여부와 fixture capability를 runtime payload로 노출
- Native audio readiness tooltip 1차
- engine status tooltip에 native audio engine 성능 계약 detail을 노출해 별도 화면 추가 없이 전환 기준을 확인 가능하게 함
- Native buffer-size policy split 1차
- native buffer size 정규화를 `src/desktop.js`로 단일화하고 app settings/project restore에서 재사용
- Native project file handoff 1차
- saveProjectFile/openProjectFile optional native method를 Platform API와 project save/open 경로에 연결
- Project file handoff readiness 1차
- openProjectFile/saveProjectFile 지원 여부를 desktop readiness에서 browser fallback과 분리 표시
- Desktop wrapper readiness 1차
- browser, desktop wrapper, native audio engine, plugin host handoff stage를 readiness 결과와 engine status title에 노출
- Plugin host manifest 1차
- VST3/AU scan method, chain role, automation source, pluginHost capability 계약을 `plugin-host-manifest.json`으로 분리
- Plugin scan adapter 1차
- native `scanPluginHosts`를 PunchLabEngine API로 노출하고 fixture에서 빈 스캔 결과를 반환
- Plugin scan readiness 1차
- scanPluginHosts 지원 여부와 pluginHost capability 상태를 desktop readiness에서 분리 표시
- Plugin scan status chip 1차
- topbar에서 scanPluginHosts 사용 가능 여부와 최근 scan count를 작은 상태 칩으로 표시
- Plugin scan freshness summary 1차
- topbar tooltip과 project zip preview에 plugin scan format/count/scannedAt 요약을 표시
- Plugin host zip preview detail 1차
- project zip preview에 plugin host scan 상태, format, count, freshness, source detail 섹션을 표시
- Plugin scan manifest summary 1차
- project zip manifest에 plugin scan 가능 여부, scan 시각, format, count를 경로 없이 요약 저장
- Native fixture mode 1차
- `?nativeFixture=1`로 native adapter/engine 선택 경로를 브라우저에서 검증
- Native fixture visibility 1차
- desktop readiness, Record Session summary, project/zip preview에서 native fixture 모드를 명시 표시
- Native fixture preference 1차
- `?nativeFixture=1`은 fixture mode를 저장하고 `?nativeFixture=0`은 저장된 fixture mode를 해제
- Vocal chain parameter manifest 1차
- `src/chain-params.js`에 automation/native/plugin 파라미터 ID, 범위, 기본값을 분리
- Chain automation state 1차
- processed take `chainSnapshot`에 plugin-style automation parameter state 저장
- Zip automation manifest 1차
- project zip `manifest.json`에 processed take automation state 요약 포함
- Zip automation schema manifest 1차
- project zip `manifest.json`에 vocal chain automation parameter schema snapshot 포함
- Zip automation schema preview 1차
- project zip `preview.html`에 vocal chain automation parameter schema 섹션 표시
- Zip take automation value summary 1차
- project zip `preview.html`의 take 카드에서 schema label/unit 기반 주요 automation 값을 표시
- Zip processed lineage manifest 1차
- project zip `manifest.json`과 `preview.html`에 processed take source/version/preset/tune 정보 표시
- Zip processed lineage preview detail 1차
- project zip `preview.html` take 카드에 preset, tune, key/scale mode lineage 표시
- Zip take timeline metadata preview 1차
- project zip `preview.html` take 카드에 latency compensation, trim, fade metadata 표시
- Zip take region metadata preview 1차
- project zip `preview.html` take 카드에 region group/color metadata 표시
- Zip preset manifest/preview 1차
- project zip `manifest.json`과 `preview.html`에 vocal chain preset summary 표시
- Zip lyrics/notes preview 1차
- project zip `manifest.json`과 `preview.html`에 scratch lyrics, marker lyrics, session notes 표시
- Zip session settings preview 1차
- project zip `manifest.json`과 `preview.html`에 tempo, key, tuning mode, punch, loop, snap 설정 표시
- Project zip policy module 1차
- project zip manifest skeleton과 archive README 정책을 `src/project-zip.js`로 분리
- Project zip preview policy module 1차
- project zip preview의 take 정렬, playback data, style, player script 정책을 `src/project-zip.js`로 분리
- Project zip section formatter split 1차
- project zip preview의 automation schema, session, preset row formatter를 `src/project-zip.js`로 분리
- Project zip secondary formatter split 1차
- project zip preview의 plugin host, notes, desktop handoff row formatter를 `src/project-zip.js`로 분리
- Project zip header formatter split 1차
- project zip preview header의 export, plugin scan, native audio, desktop readiness summary formatter를 `src/project-zip.js`로 분리
- Export mastering module split 1차
- WAV export 직전 loudness normalize, peak normalize, true-peak ceiling finalize 로직을 `src/export-mastering.js`로 분리
- Export plan module split 1차
- export filename, stem group, compressed format, queue detail planning을 `src/export-plan.js`로 분리
- Export single group plan split 1차
- beat/vocal/comp/dry/tuned 단일 WAV export group 계획을 `src/export-plan.js`로 분리
- Export queue display policy split 1차
- export row count, queue status label, job detail 표시 정책을 `src/export-plan.js`로 분리
- Export loudness/status policy split 1차
- loudness clipping risk와 compressed export readiness 문구를 `src/export-plan.js`로 분리
- Export WAV option policy split 1차
- WAV bit-depth 정규화와 encode option 생성을 `src/export-plan.js`로 분리
- Audible export source alignment 1차
- comp/dry/tuned export count, button state, render 대상이 audible track routing을 따르도록 정렬
- Timeline policy module split 1차
- snap mode, beat/bar snap, nudge, marker normalization 계산을 `src/timeline.js`로 분리
- Timeline grid policy split 1차
- tick/grid line/percent mapping 계산을 `src/timeline.js`로 분리
- Timeline region trim policy split 1차
- source offset, visible duration, clip gain, fade, color 정규화를 `src/timeline.js`로 분리
- Timeline region group policy split 1차
- Verse/Hook/Adlib/Intro/Bridge/Outro group 정의와 기본 group 판정을 `src/timeline.js`로 분리
- Timeline input policy split 1차
- region input time formatting과 timeline number 비교 허용 오차를 `src/timeline.js`로 분리
- Timeline snapshot policy split 1차
- undo/redo snapshot 생성과 take snapshot restore 정규화를 `src/timeline.js`로 분리
- Take policy module split 1차
- take 생성시각 정렬, comp order 정렬, processed version 계산을 `src/takes.js`로 분리
- Take comp order policy split 1차
- best take의 comp 투입 순서, comp lane 이동, comp order 정규화를 `src/takes.js`로 분리
- Take metadata policy split 1차
- take 파일명, title, short name, latency tag 생성을 `src/takes.js`로 분리
- Take batch copy policy split 1차
- batch render scope별 ready/empty 안내 문구 생성을 `src/takes.js`로 분리
- Take batch target policy split 1차
- batch render scope별 target 선별과 이미 렌더된 chain duplicate guard를 `src/takes.js`로 분리
- Preset policy module split 1차
- preset 정규화, custom preset snapshot, compressor 기본값 계산을 `src/presets.js`로 분리
- Track policy module split 1차
- track folder membership, 기본 이름, solo/mute audibility, output volume 계산을 `src/tracks.js`로 분리
- Pitch policy module split 1차
- scale 정규화, manual target overlay, pitch lane sampling, note label, correction summary를 `src/pitch.js`로 분리
- Device recording MIME policy split 1차
- recording MIME 선택을 `src/devices.js`로 분리하고 mic constraints/output routing 경계와 함께 검증
- Storage backup display policy split 1차
- rolling backup history label 생성을 `src/storage.js`로 분리
- Shortcut policy module split 1차
- global shortcut 입력 가드와 숫자 탭 이동 index 계산을 `src/shortcuts.js`로 분리
- Format utility module split 1차
- duration, gain/dB, LUFS, pan, percent, semitone, HTML escape 표시 포맷을 `src/format.js`로 분리
- Native display formatter split 1차
- native latency, sample rate, freshness timestamp 표시 포맷을 `src/format.js`로 분리
- Project zip asset/timeline formatter split 1차
- project zip preview의 beat section, marker rows, comp lane rows를 `src/project-zip.js`로 분리
- Project zip take card formatter split 1차
- project zip preview의 take audio card formatter와 automation/region/latency summary를 `src/project-zip.js`로 분리
- Project zip preview shell split 1차
- project zip `preview.html` 전체 shell 조립을 `src/project-zip.js`로 분리하고 app controller는 archive context만 전달
- Zip preset Gate/De-ess preview 1차
- project zip preset manifest/preview와 render preset snapshot에 Gate/De-ess 값을 보존
- Project zip archive asset policy split 1차
- project zip file map, asset path reservation, beat/take manifest entry builder를 `src/project-zip.js`로 분리
- Project zip marker manifest split 1차
- project zip marker manifest entry와 lyric line count 계산을 `src/project-zip.js`로 분리
- Project zip metadata file writer split 1차
- project zip `preview.html`, `manifest.json`, `README.txt` final write 정책을 `src/project-zip.js`로 분리
- Recording quick take handoff 1차
- 녹음 화면 최근 take 리스트에서 바로 듣기와 Vocal 탭 전송 제공
- Desktop package manifest 1차
- Tauri 우선 wrapper, native 전환 gate, core 재작성 금지 boundary를 manifest/check로 고정
- `.punchlab.json` 로컬 프로젝트 저장/복원
- processed take `v1`, `v2` 버전 관리
- processed take 버전/체인 정보 저장 포맷 포함
- Vocal render version history 1차
- Vocal 화면에서 같은 source take의 tuned version 목록을 선택/재생
- Timeline 탭 추가
- marker 추가/삭제
- take region start time 이동/nudge
- marker와 region start time 프로젝트 저장/복원
- region 이름 변경
- clip gain, fade in/out 설정
- clip gain/fade mix playback/export 반영
- Export 탭 추가
- track stem export
- beat stem export
- vocal stem export
- dry vocal export
- tuned vocal export
- IndexedDB autosave
- Recover 버튼으로 autosave 복원
- Rolling project backup 기본형
- IndexedDB에 최근 project backup 5개를 보관하고 Recover가 autosave 실패 시 최신 backup을 fallback으로 복원
- Version history 1차
- 상단 History select에서 최근 rolling backup을 골라 특정 버전으로 복원
- Storage Layer `src/storage.js` 분리
- Device Layer `src/devices.js` 분리
- 브라우저 input/output 장치 목록, mic constraints, playback sink routing을 UI 밖 모듈로 분리
- Native output routing handoff 1차
- setOutputDevice optional native method를 Platform API와 playback output 변경 경로에 연결
- Output routing readiness 1차
- setOutputDevice native 지원 여부와 browser sink routing 지원 여부를 desktop readiness에서 분리 표시
- Output routing restore 1차
- project load 이후 저장된 playback output routing을 즉시 재적용
- BPM 기반 metronome toggle
- recording/session playback 중 metronome tick
- Count-in 고도화 1차
- 1/2/4 bar count-in과 녹음 시작 전 cancel 처리
- Keyboard shortcuts: Space 재생, R 녹음, S 정지, M metronome, 1-8 탭 이동
- 입력칸 포커스 중 shortcut 비활성화
- Recording latency compensation
- 새 take 저장 시 latency ms만큼 start time 자동 보정
- latency 설정 프로젝트 저장/복원
- Latency metadata visibility 1차
- take subtitle, record review, zip manifest에 적용된 latency ms 표시/보존
- Input monitoring toggle
- 마이크 신호를 monitor gain node를 통해 destination으로 라우팅
- Native monitor handoff 1차
- active engine이 realtimeNativeMonitoring을 지원하면 같은 monitor 버튼이 native startInputMonitor/stopInputMonitor로 라우팅되고, 미지원 시 Web Audio monitor로 fallback
- Native monitor readiness split 1차
- startInputMonitor/stopInputMonitor method availability와 realtimeNativeMonitoring capability readiness를 desktop readiness에서 분리
- Audio input device selector 1차
- 브라우저에서 audioinput 장치를 선택하고 project bundle/autosave에 저장
- Playback output device selector 1차
- 지원 브라우저에서 beat/take/export preview와 AudioContext 출력 장치를 선택하고 project bundle/autosave에 저장
- Custom vocal preset 저장
- 저장한 preset 프로젝트 저장/복원
- Vocal gate slider
- Vocal de-ess slider
- Gate/De-ess 값 custom preset과 render chain에 반영
- Chromatic tune mode
- Minor key lock / Chromatic 튠 모드 프로젝트 저장/복원
- Manual pitch lane
- 프레임별 target note +/- 수정
- Manual pitch target 프로젝트 저장/복원
- Timeline undo/redo
- Marker 추가/삭제 undo/redo
- Region start/name/gain/fade undo/redo
- Render/export queue
- Export job queued/running/done/failed 상태 표시
- Mix/stem/dry/tuned export 순차 실행
- Export queue recovery 1차
- failed job retry, done/failed remove, clear finished controls
- Export queue redownload 1차
- 완료된 export queue job의 마지막 preview WAV를 다시 다운로드
- Batch scope 고도화 1차
- comp lane raw takes와 best raw takes에 현재 체인을 batch render
- Batch target preview 1차
- Vocal batch render 실행 전 대상 raw take 리스트 표시
- Batch duplicate guard 1차
- 같은 preset/tune chain으로 이미 렌더된 raw take는 batch 대상에서 제외하는 옵션 제공
- Custom preset delete 1차
- 저장한 custom vocal preset 삭제와 built-in preset 보호
- Custom preset update 1차
- 선택한 custom vocal preset을 현재 chain 설정으로 갱신
- Custom scale editor
- 12 pitch-class toggle로 target scale 편집
- Custom scale 프로젝트 저장/복원
- Take comping 기본형
- take별 Comp 선택/해제
- 선택한 comp take만 순서대로 Play comp 재생
- Comp 선택 프로젝트 저장/복원
- Comp lane editing 기본형
- Comp 탭 추가
- take pool에서 comp lane으로 add/remove
- comp lane 순서 up/down 편집
- comp order 프로젝트 저장/복원
- Best take marking 1차
- 마음에 드는 take를 Best로 표시하고 Comp 탭에서 best take만 한 번에 comp lane에 추가
- Best 상태를 project bundle과 zip manifest에 저장
- Export metadata 기본형
- Artist/Title 입력 프로젝트 저장/복원
- WAV RIFF INFO chunk에 title, artist, BPM, key, software 기록
- Export settings manifest 1차
- project zip `manifest.json`에 WAV depth, normalize, loudness target, 최근 분석 상태 저장
- Export history manifest 1차
- project bundle과 zip `manifest.json`/`preview.html`에 최근 완료/실패 export queue 요약 저장
- Export preview 기본형
- 완료된 export queue job의 마지막 WAV를 Preview 버튼으로 재생
- Export redownload 기본형
- 완료된 export queue job의 마지막 WAV를 Download 버튼으로 재다운로드
- Project zip export asset 포함형
- `.punchlab.json`, manifest, README, beat asset, take audio asset을 `.punchlab.zip`에 저장
- Read-only mix preview 1차
- project zip에 `preview.html`을 포함해 압축 해제 후 beat/take/marker/comp 정보를 읽기 전용으로 검토하고 timeline playback 실행
- File System Access 파일 계층 1차
- 지원 브라우저에서는 Save/Open 버튼이 OS 파일 선택창을 사용하고, 미지원 환경에서는 기존 download/input으로 fallback
- Project templates 1차
- Trap, drill, rage hook, clean hook 세션 템플릿으로 BPM/key/track mix/marker/preset 빠른 세팅
- Lyrics marker linking 1차
- Timeline marker별 가사 섹션과 scratch pad를 project bundle에 저장/복원
- Marker comment 1차
- Timeline marker별 코멘트를 저장하고 autosave/project bundle/undo-redo에 반영
- Session notes 1차
- 녹음/믹스 메모를 project bundle과 autosave에 저장/복원
- Timeline region duplicate/delete 1차
- Region row에서 take copy/delete를 직접 실행하고 timeline/take/export 상태를 즉시 갱신
- Take rename 1차
- Takes 탭에서 take 이름을 직접 바꾸고 project bundle/autosave/timeline 표시까지 함께 반영
- Region grouping 1차
- Verse/Hook/Adlib/Intro/Bridge/Outro region group을 take별로 저장하고 Timeline 표시/undo/project bundle에 반영
- Track rename 1차
- Track 이름 변경 시 기존 take 라벨, arm strip, timeline/export 표시까지 같이 갱신
- Track folder 1차
- Lead/Adlib/Hook stack 폴더 header, 접기/펼치기, 그룹 mute/solo를 Record 화면 track list에 반영
- BPM grid/snap 1차
- Timeline에 BPM 기반 beat/bar grid를 그리고 marker/region start를 beat 또는 bar 단위로 snap
- Region trim 1차
- Source offset과 visible length로 비파괴 자르기를 저장하고 playback/export에 동일하게 반영
- Region color 1차
- Timeline region 색상을 take별로 지정하고 project bundle, zip manifest, undo/redo에 반영
- Waveform recording view
- 녹음 중 waveform peak trail 표시
- take별 waveform thumbnail 저장/복원
- Export peak normalize 기본형
- WAV export 직전 sample peak를 -1 dBFS 목표로 보정
- LUFS loudness analysis 기본형
- Export 탭에서 full mix LUFS 근사치, peak, clipping count, -14 LUFS target gain 표시
- Clipping warning 1차
- Export 탭에서 stale 분석, clipped samples, true peak ceiling 근접 상태를 Clip risk로 표시
- True peak/K-weighted loudness refinement 기본형
- K-weighting 근사 필터와 4x linear true peak estimate 적용
- True-peak ceiling limiter 기본형
- 보컬 렌더와 WAV export 결과를 4x true peak estimate 기준 ceiling 이하로 안전 감쇄
- 24-bit WAV export 선택
- Export 탭에서 16-bit/24-bit WAV bit depth를 고르고 프로젝트 저장/복원에 반영
- Formant-aware pitch shifting 기본형
- Pitch correction 방향/크기에 따라 body/focus formant filter를 보정
- Vocal chain controls 1차
- Compressor, space, width slider를 렌더 설정/custom preset/project bundle에 반영
- EQ/limiter controls 1차
- Low/Mid/Air EQ와 limiter ceiling slider를 렌더 설정/custom preset/project bundle에 반영
- Delay/reverb controls 1차
- Delay, reverb slider를 렌더 설정/custom preset/project bundle에 반영

## 결론부터

나중에 네이티브 앱으로 넘어간다고 해서 처음부터 전부 다시 짤 필요는 없습니다.

다만 지금부터 구조를 잘 나눠야 합니다. UI, 프로젝트 데이터, DSP 엔진, 파일 저장 로직을 분리해두면 나중에 브라우저 UI를 유지한 채로 핵심 오디오 엔진만 WebAssembly, Rust, C++, Tauri, Electron, VST3 쪽으로 옮길 수 있습니다.

처음부터 다시 짜야 하는 경우는 보통 다음과 같습니다.

- UI와 DSP 코드가 한 파일에 심하게 섞인 경우
- take, track, preset, project 구조가 명확하지 않은 경우
- 오디오 처리 코드가 브라우저 DOM에 직접 의존하는 경우
- 저장 포맷 없이 메모리 상태만 믿고 만든 경우
- 기능을 급하게 붙이느라 렌더, 재생, export 경로가 전부 따로 노는 경우

PunchLab은 아직 작기 때문에 지금부터 분리하면 다시 짤 가능성을 크게 줄일 수 있습니다.

## 1단계: 지금 목표, 쓸만한 데모 스튜디오

목표는 “무료 랩 녹음 스튜디오 MVP”입니다.

체크리스트:

- 비트 업로드
- 마이크 녹음
- Main, Double, Adlib L, Adlib R, Hook 트랙
- take 저장, 재생, 삭제, 다운로드
- punch-in, loop 녹음
- track별 mute, solo, volume, pan
- take 순서 재생
- 전체 믹스 WAV export
- 보컬 프리셋
- pitch 분석
- frame-level 튠 렌더
- Retune Speed, Humanize, Formant 조절
- raw/tuned A/B 비교
- 현재 트랙 batch render
- 전체 raw vocal batch render

이 단계는 “실제로 녹음하고, 튠하고, 대충 믹스해서 결과물을 뽑을 수 있나”를 검증하는 단계입니다.

## 2단계: 진짜 브라우저 스튜디오

목표는 “새로고침해도 작업이 날아가지 않고, 한 곡 작업을 끝낼 수 있는 브라우저 DAW 느낌”입니다.

필요한 기능:

- 프로젝트 저장/불러오기
- 로컬 파일 기반 project bundle
- beat, take, processed take asset 관리
- timeline 화면
- region 이동, 자르기, 복사, 삭제
- fade in/out
- take 이름 변경
- track 이름 변경
- undo/redo 기본형
- autosave
- crash recovery
- BPM grid
- marker: intro, verse, hook, bridge, outro
- lyrics와 timeline marker 연결
- stem export
- dry vocal export
- tuned vocal export
- full mix export
- project template: trap, drill, rage, hook demo

이 단계까지 오면 “웹에서 돌아가는 가벼운 녹음 스튜디오”로 충분히 말할 수 있습니다.

## 3단계: 보컬 엔진 고도화

목표는 “오토튠 느낌이 진짜로 쓸만하게 들리는 것”입니다.

현재는 frame-level pitch correction입니다. 다음은 더 정교한 DSP가 필요합니다.

필요한 기능:

- 더 안정적인 pitch detection
- adaptive RMS threshold, lag peak refinement, octave jump smoothing 적용
- 랩, 노래, 허스키한 목소리, 작은 목소리 대응
- 작은 소스 레벨 대응용 adaptive voiced-frame threshold 적용
- transient 보존
- pitch render wet/dry blend에 transient preserve mask 적용
- formant-aware pitch shifting
- vibrato 유지/제거
- vibrato preserve/remove slider와 DSP correction smoothing 연결
- note transition smoothing
- frame correction smoothing 기본형을 DSP 렌더에 적용
- scale editor
- custom scale 기본형
- chromatic mode
- MIDI target note
- fixed MIDI target note selector와 pitch plan 연결
- manual pitch lane 기본형
- de-esser
- noise gate
- compressor 세부 조절
- compressor threshold, ratio, attack, release UI와 렌더 체인 연결
- EQ band 조절
- saturation
- saturation amount UI와 프리셋/프로젝트 저장 연결
- delay send
- reverb send
- limiter
- preset 저장/불러오기
- loudness analyze 기본형
- loudness normalize 기본형
- WAV export 직전 실제 렌더 버퍼를 -14 LUFS target으로 선택 보정
- true peak limiter
- 보컬 렌더와 WAV export에 4x true-peak ceiling 보호 적용

여기서부터 Antares 같은 상용 플러그인의 일부 영역에 가까워지기 시작합니다. 다만 상용급 플러그인은 알고리즘, 저지연성, 안정성, DAW 호환성까지 요구하기 때문에 훨씬 큰 작업입니다.

## 4단계: 녹음 워크플로우 완성

목표는 “한 곡 작업을 처음부터 끝까지 끊김 없이 할 수 있는 것”입니다.

필요한 기능:

- loop recording
- Punch + Loop 조합에서 punch window를 반복 녹음해 take를 계속 누적하는 기본형
- take lane
- playlist comping 기본형
- best take 조합
- region grouping
- Verse/Hook/Adlib/Intro/Bridge/Outro region group 기본형
- track folder
- hook stack, adlib stack
- Lead/Adlib/Hook stack folder 기본형
- keyboard shortcuts
- metronome
- count-in 고도화
- 4 bar count-in 옵션과 cancelable count-in 기본형
- latency compensation
- input monitoring
- 녹음 지연 보정
- 녹음 중 waveform 표시 기본형
- Record-screen take review 1차
- 녹음 화면에서 최신 take와 최근 take를 바로 재생
- 녹음 화면에서 최신 take를 Vocal 작업 화면으로 바로 전달
- clip gain
- region color
- Timeline region color 저장/복원 기본형
- session notes
- Lyrics 탭에서 session notes를 저장/복원하는 기본형
- project backup
- 최근 5개 rolling backup과 recovery fallback 기본형

이 단계에서 중요한 기준은 “녹음한 것을 잃어버리지 않는 것”입니다.

## 5단계: 믹싱과 export 품질

목표는 “작업물을 밖으로 꺼냈을 때 예측 가능한 결과가 나오는 것”입니다.

필요한 기능:

- track stem export
- vocal stem export
- beat stem export
- Export 탭에서 beat stem을 별도 queue job으로 출력
- dry vocal export
- tuned vocal export
- full mix export
- 16-bit WAV
- 24-bit WAV
- Export 탭 bit depth 선택으로 16-bit/24-bit WAV 출력
- MP3
- M4A
- loudness target
- limiter ceiling
- clipping warning
- export preview 기본형
- render/export queue 기본형
- export metadata 기본형: artist, title, BPM, key

상용급에서는 export가 조용히 깨지거나, clipping이 나거나, 길이가 틀어지면 안 됩니다.

## 6단계: 협업과 배포

목표는 “다른 사람에게 프로젝트나 결과물을 넘길 수 있는 것”입니다.

필요한 기능:

- project bundle zip asset 포함형
- 모든 오디오 파일 포함한 zip export 기본형 완료
- read-only mix preview
- 버전 히스토리
- comment marker
- cloud sync는 나중
- 계정 시스템도 나중

중요한 순서:

1. 로컬 작업 안정화
2. project bundle 안정화
3. export 안정화
4. 그 다음 cloud

계정, 클라우드, 공유 기능을 너무 빨리 붙이면 핵심 녹음 기능보다 복잡도가 먼저 터집니다.

## 언제까지 브라우저로 가도 되나

아래 조건이면 브라우저로 계속 가도 됩니다.

- 녹음 후 offline render 중심이다
- 실시간 오토튠 모니터링이 필수는 아니다
- 빠르게 UI와 워크플로우를 바꾸는 중이다
- 무료 웹 스튜디오로 검증하는 단계다
- 파일 저장과 프로젝트 구조가 아직 바뀌는 중이다
- DAW 플러그인 연동이 아직 필요 없다

브라우저의 장점:

- 개발 속도가 빠름
- 설치가 필요 없음
- UI 실험이 쉬움
- Web Audio로 offline render 가능
- MVP 검증에 좋음
- 배포가 쉬움

지금 PunchLab은 이 구간에 있습니다.

## 언제 네이티브 앱으로 넘어가야 하나

아래 조건 중 2개 이상이 진짜로 필요해지면 네이티브 전환을 검토해야 합니다.

- 실시간 튠 모니터링이 필요하다
- 왕복 latency 10ms 이하가 중요하다
- Windows ASIO 제어가 필요하다
- macOS CoreAudio 세부 제어가 필요하다
- 오디오 인터페이스 input/output routing이 필요하다
- buffer size 설정이 필요하다
- VST3/AU 플러그인을 지원해야 한다
- PunchLab 자체를 VST3/AU로 만들고 싶다
- 대형 프로젝트에서 브라우저 메모리 한계가 온다
- 렌더 속도와 안정성 때문에 native thread/SIMD가 필요하다
- local file system 권한 UX가 불편해진다
- 백그라운드 렌더와 UI 반응성을 완전히 분리해야 한다

이 조건들이 오기 전에는 브라우저가 더 효율적입니다.

## 네이티브로 갈 때 다시 짜야 하나

전부 다시 짤 필요는 없습니다. 대신 단계적으로 옮겨야 합니다.

권장 전환 순서:

1. 지금 브라우저 앱에서 워크플로우를 완성한다.
2. track, take, preset, project 데이터 구조를 명확히 한다.
3. DSP 코드를 UI 코드에서 분리한다.
4. project save/load 포맷을 만든다.
5. pitch/tune/vocal chain 엔진을 별도 모듈로 뺀다.
6. 그 모듈을 WebAssembly, Rust, C++ 중 하나로 옮긴다.
7. UI는 일단 그대로 두고 DSP만 교체한다.
8. 이후 Tauri나 Electron으로 데스크톱 앱을 만든다.
9. 실시간 모니터링이 필요해지면 native audio engine을 붙인다.
10. 마지막에 VST3/AU 플러그인을 만든다.

즉, 가장 좋은 전략은 “브라우저 앱을 버리고 새로 시작”이 아니라 “핵심 엔진을 점점 분리해서 옮기기”입니다.

## 앞으로 코드 구조를 어떻게 해야 하나

처음부터 다시 짜지 않으려면 아래 구조로 분리해야 합니다.

### UI Layer

- 버튼
- 화면 탭
- 슬라이더
- timeline
- waveform
- modal

UI는 오디오 처리 알고리즘을 직접 알면 안 됩니다.

### Project Layer

- project
- track
- take
- region
- preset
- chain settings
- export settings

이 계층은 저장/불러오기에 그대로 쓰입니다.

### Audio Engine Layer

- playback
- recording
- offline render
- mix export
- stem export

브라우저에서는 Web Audio로 구현하고, 나중에는 native audio engine으로 교체할 수 있어야 합니다.

### DSP Layer

- pitch detection
- pitch correction
- formant
- EQ
- compressor
- gate
- de-esser
- reverb
- delay
- limiter

가장 먼저 독립시켜야 하는 계층입니다.

### Storage Layer

- project save/load
- audio asset 관리
- project bundle export
- autosave

상용급으로 가려면 이 계층이 반드시 필요합니다.

## 플러그인은 언제 만들까

VST3/AU 플러그인은 마지막에 가는 것이 맞습니다.

플러그인 제작 전에 필요한 조건:

- pitch engine이 충분히 좋다
- latency가 낮다
- preset 저장이 안정적이다
- automation parameter 구조가 있다
- native DSP 엔진이 있다
- DAW 테스트가 가능하다

테스트해야 할 DAW:

- FL Studio
- Ableton Live
- Logic Pro
- Reaper
- Studio One

플러그인은 “있어보이는 기능”이지만, 너무 빨리 만들면 유지보수 비용이 큽니다.

## 상용급이라고 부를 수 있는 기준

아래가 가능하면 상용급 스튜디오의 기본선에 가까워집니다.

- 앱을 연다.
- 비트를 넣는다.
- verse와 hook을 녹음한다.
- 여러 take를 고른다.
- 모든 보컬에 튠과 체인을 건다.
- raw/tuned를 A/B 비교한다.
- track level을 맞춘다.
- 전체 믹스를 export한다.
- stem도 export한다.
- 앱을 닫는다.
- 다시 열었을 때 프로젝트가 그대로 복구된다.

이게 PunchLab의 첫 번째 상용급 기준입니다.

## 가장 현실적인 다음 작업 순서

1. Batch render 안정화
2. processed take 버전 관리
3. project save/load
4. timeline region 편집
5. stem export
6. latency compensation
7. pitch engine 개선
8. desktop wrapper shell integration
9. native audio engine implementation
10. VST3/AU plugin

현재는 1-8번의 기본선과 timeline undo/redo, render/export queue, custom scale editor, take comping, comp lane editing, export metadata, export preview, project zip export asset 포함형, waveform recording view, export peak normalize, K-weighted LUFS/true peak analysis 기본형, offline mix/vocal render 모듈 분리, swappable audio engine interface, native bridge contract, formant-aware pitch shifting 기본형, vocal chain controls 1차, EQ/limiter controls 1차, delay/reverb controls 1차, desktop wrapper 준비용 start/check/PWA shell이 들어온 상태입니다. 다음으로는 desktop wrapper shell integration, native audio engine implementation, VST3/AU plugin 준비가 중요합니다.
