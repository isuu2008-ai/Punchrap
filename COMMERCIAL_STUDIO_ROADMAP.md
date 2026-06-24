# PunchLab 상용급 스튜디오 로드맵

이 문서는 PunchLab을 단순한 브라우저 녹음 장난감이 아니라, 실제로 쓸 수 있는 랩 녹음 스튜디오로 키우기 위한 체크리스트입니다.

현재 PunchLab은 브라우저 기반 프로토타입입니다. 이미 녹음, 여러 트랙, take 관리, pitch 분석, frame-level 튠 렌더, formant-aware pitch shifting 기본형, 보컬 체인, 전체 믹스 export, A/B 비교, batch render, minor/chromatic/custom 튠 모드, manual pitch lane, timeline undo/redo, render/export queue, take comping 기본형, comp lane editing, WAV export metadata, export preview, project zip export asset 포함형, waveform recording view, export peak normalize, K-weighted LUFS/true peak analysis 기본형까지 들어가 있습니다. 지금 단계에서는 브라우저로 계속 빠르게 기능을 검증하는 것이 맞습니다.

현재 추가 완료:

- DSP 코드를 `src/dsp.js`로 분리
- WAV 인코딩/다운로드 유틸을 `src/audio.js`로 분리
- Offline mix render 엔진을 `src/mix.js`로 분리
- 프로젝트 저장/불러오기 계층을 `src/project.js`로 분리
- `.punchlab.json` 로컬 프로젝트 저장/복원
- processed take `v1`, `v2` 버전 관리
- processed take 버전/체인 정보 저장 포맷 포함
- Timeline 탭 추가
- marker 추가/삭제
- take region start time 이동/nudge
- marker와 region start time 프로젝트 저장/복원
- region 이름 변경
- clip gain, fade in/out 설정
- clip gain/fade mix playback/export 반영
- Export 탭 추가
- track stem export
- dry vocal export
- tuned vocal export
- IndexedDB autosave
- Recover 버튼으로 autosave 복원
- Storage Layer `src/storage.js` 분리
- BPM 기반 metronome toggle
- recording/session playback 중 metronome tick
- Keyboard shortcuts: Space 재생, R 녹음, S 정지, M metronome, 1-8 탭 이동
- 입력칸 포커스 중 shortcut 비활성화
- Recording latency compensation
- 새 take 저장 시 latency ms만큼 start time 자동 보정
- latency 설정 프로젝트 저장/복원
- Input monitoring toggle
- 마이크 신호를 monitor gain node를 통해 destination으로 라우팅
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
- Export metadata 기본형
- Artist/Title 입력 프로젝트 저장/복원
- WAV RIFF INFO chunk에 title, artist, BPM, key, software 기록
- Export preview 기본형
- 완료된 export queue job의 마지막 WAV를 Preview 버튼으로 재생
- Project zip export asset 포함형
- `.punchlab.json`, manifest, README, beat asset, take audio asset을 `.punchlab.zip`에 저장
- Waveform recording view
- 녹음 중 waveform peak trail 표시
- take별 waveform thumbnail 저장/복원
- Export peak normalize 기본형
- WAV export 직전 sample peak를 -1 dBFS 목표로 보정
- LUFS loudness analysis 기본형
- Export 탭에서 full mix LUFS 근사치, peak, clipping count, -14 LUFS target gain 표시
- True peak/K-weighted loudness refinement 기본형
- K-weighting 근사 필터와 4x linear true peak estimate 적용
- Formant-aware pitch shifting 기본형
- Pitch correction 방향/크기에 따라 body/focus formant filter를 보정

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
- 랩, 노래, 허스키한 목소리, 작은 목소리 대응
- transient 보존
- formant-aware pitch shifting
- vibrato 유지/제거
- note transition smoothing
- scale editor
- custom scale 기본형
- chromatic mode
- MIDI target note
- manual pitch lane 기본형
- de-esser
- noise gate
- compressor 세부 조절
- EQ band 조절
- saturation
- delay send
- reverb send
- limiter
- preset 저장/불러오기
- loudness analyze 기본형
- loudness normalize 기본형
- true peak limiter

여기서부터 Antares 같은 상용 플러그인의 일부 영역에 가까워지기 시작합니다. 다만 상용급 플러그인은 알고리즘, 저지연성, 안정성, DAW 호환성까지 요구하기 때문에 훨씬 큰 작업입니다.

## 4단계: 녹음 워크플로우 완성

목표는 “한 곡 작업을 처음부터 끝까지 끊김 없이 할 수 있는 것”입니다.

필요한 기능:

- loop recording
- take lane
- playlist comping 기본형
- best take 조합
- region grouping
- track folder
- hook stack, adlib stack
- keyboard shortcuts
- metronome
- count-in 고도화
- latency compensation
- input monitoring
- 녹음 지연 보정
- 녹음 중 waveform 표시 기본형
- clip gain
- region color
- session notes
- project backup

이 단계에서 중요한 기준은 “녹음한 것을 잃어버리지 않는 것”입니다.

## 5단계: 믹싱과 export 품질

목표는 “작업물을 밖으로 꺼냈을 때 예측 가능한 결과가 나오는 것”입니다.

필요한 기능:

- track stem export
- vocal stem export
- beat stem export
- dry vocal export
- tuned vocal export
- full mix export
- 16-bit WAV
- 24-bit WAV
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
8. Audio Engine Layer 추가 분리
9. EQ/compressor/delay/reverb/limiter 세부 컨트롤
10. desktop wrapper
11. native audio engine
12. VST3/AU plugin

현재는 1-8번의 기본선과 timeline undo/redo, render/export queue, custom scale editor, take comping, comp lane editing, export metadata, export preview, project zip export asset 포함형, waveform recording view, export peak normalize, K-weighted LUFS/true peak analysis 기본형, offline mix render 모듈 분리, formant-aware pitch shifting 기본형이 들어온 상태입니다. 다음으로는 Audio Engine Layer 추가 분리, EQ/compressor/delay/reverb/limiter 세부 컨트롤, desktop wrapper 준비가 중요합니다.
