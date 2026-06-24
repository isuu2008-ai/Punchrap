use serde::Serialize;

const PLANNED_NATIVE_METHODS: [&str; 13] = [
    "getCapabilities",
    "getDevices",
    "renderMix",
    "renderVocal",
    "startInputMonitor",
    "stopInputMonitor",
    "getLatencyStats",
    "setOutputDevice",
    "setBufferSize",
    "openProjectFile",
    "saveProjectFile",
    "exportCompressedAudio",
    "scanPluginHosts",
];

const IMPLEMENTED_NATIVE_METHODS: [&str; 2] = ["getCapabilities", "getDevices"];

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct PunchLabBridgeStatus {
    driver_id: &'static str,
    detail: &'static str,
    implemented_methods: Vec<&'static str>,
    native_bridge_ready: bool,
    planned_methods: Vec<&'static str>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct PunchLabCapabilities {
    native_shell: bool,
    native_audio_engine_ready: bool,
    offline_mix_render: bool,
    vocal_render: bool,
    pitch_analysis: bool,
    wav_export: bool,
    loudness_analysis: bool,
    true_peak_limiter: bool,
    compressed_audio_export: bool,
    realtime_native_monitoring: bool,
    plugin_host: bool,
    sample_rates: Vec<u32>,
    buffer_sizes: Vec<u32>,
    preferred_buffer_size: u32,
    round_trip_latency_ms: Option<f32>,
    exclusive_audio_thread: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct PunchLabDevice {
    id: String,
    label: String,
    kind: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct PunchLabDevices {
    audio_input: Vec<PunchLabDevice>,
    audio_output: Vec<PunchLabDevice>,
}

#[tauri::command]
fn get_punchlab_bridge_status() -> PunchLabBridgeStatus {
    PunchLabBridgeStatus {
        driver_id: "tauri-shell",
        detail: "Tauri shell can report capabilities and devices; native audio render and monitoring commands are not active yet.",
        implemented_methods: IMPLEMENTED_NATIVE_METHODS.to_vec(),
        native_bridge_ready: false,
        planned_methods: PLANNED_NATIVE_METHODS.to_vec(),
    }
}

#[tauri::command]
fn get_capabilities() -> PunchLabCapabilities {
    PunchLabCapabilities {
        native_shell: true,
        native_audio_engine_ready: false,
        offline_mix_render: false,
        vocal_render: false,
        pitch_analysis: false,
        wav_export: false,
        loudness_analysis: false,
        true_peak_limiter: false,
        compressed_audio_export: false,
        realtime_native_monitoring: false,
        plugin_host: false,
        sample_rates: vec![44100, 48000],
        buffer_sizes: vec![64, 128, 256, 512, 1024],
        preferred_buffer_size: 128,
        round_trip_latency_ms: None,
        exclusive_audio_thread: false,
    }
}

#[tauri::command]
fn get_devices() -> PunchLabDevices {
    PunchLabDevices {
        audio_input: Vec::new(),
        audio_output: Vec::new(),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            get_punchlab_bridge_status,
            get_capabilities,
            get_devices
        ])
        .run(tauri::generate_context!())
        .expect("error while running PunchLab Tauri shell");
}
