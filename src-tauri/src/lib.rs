use base64::{engine::general_purpose, Engine as _};
use serde::{Deserialize, Serialize};
use std::fs;
use std::sync::Mutex;
use tauri_plugin_dialog::DialogExt;

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

const IMPLEMENTED_NATIVE_METHODS: [&str; 7] = [
    "getCapabilities",
    "getDevices",
    "getLatencyStats",
    "setOutputDevice",
    "setBufferSize",
    "openProjectFile",
    "saveProjectFile",
];

const SUPPORTED_BUFFER_SIZES: [u32; 5] = [64, 128, 256, 512, 1024];
const DEFAULT_BUFFER_SIZE: u32 = 128;
const DEFAULT_SAMPLE_RATE: u32 = 48000;

struct NativeAudioState {
    buffer_size: Mutex<u32>,
    output_device_id: Mutex<String>,
    sample_rate: Mutex<u32>,
}

impl Default for NativeAudioState {
    fn default() -> Self {
        Self {
            buffer_size: Mutex::new(DEFAULT_BUFFER_SIZE),
            output_device_id: Mutex::new(String::new()),
            sample_rate: Mutex::new(DEFAULT_SAMPLE_RATE),
        }
    }
}

impl NativeAudioState {
    fn buffer_size(&self) -> u32 {
        self.buffer_size
            .lock()
            .map(|value| *value)
            .unwrap_or(DEFAULT_BUFFER_SIZE)
    }

    fn sample_rate(&self) -> u32 {
        self.sample_rate
            .lock()
            .map(|value| *value)
            .unwrap_or(DEFAULT_SAMPLE_RATE)
    }

    fn output_device_id(&self) -> String {
        self.output_device_id
            .lock()
            .map(|value| value.clone())
            .unwrap_or_default()
    }

    fn set_buffer_size(&self, buffer_size: u32) {
        if let Ok(mut value) = self.buffer_size.lock() {
            *value = buffer_size;
        }
    }

    fn set_output_device_id(&self, device_id: String) {
        if let Ok(mut value) = self.output_device_id.lock() {
            *value = device_id;
        }
    }
}

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
    audio_output_routing: bool,
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

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct SetBufferSizePayload {
    buffer_size: Option<u32>,
    size: Option<u32>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct SetOutputDevicePayload {
    device_id: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct OutputDeviceResult {
    active: bool,
    device_id: String,
    native_audio_engine_ready: bool,
    supported: bool,
    unsupported: bool,
    source: &'static str,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct PunchLabLatencyStats {
    input_latency_ms: Option<f32>,
    output_latency_ms: Option<f32>,
    round_trip_latency_ms: Option<f32>,
    buffer_size: u32,
    sample_rate: u32,
    native_audio_engine_ready: bool,
    source: &'static str,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct OpenProjectFilePayload {
    #[serde(rename = "type")]
    file_type: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct SaveProjectFilePayload {
    data: String,
    suggested_name: Option<String>,
    #[serde(rename = "type")]
    file_type: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ProjectFileResult {
    canceled: bool,
    bytes: usize,
    data_url: Option<String>,
    file_name: Option<String>,
    path: Option<String>,
    #[serde(rename = "type")]
    file_type: String,
}

#[tauri::command]
fn get_punchlab_bridge_status() -> PunchLabBridgeStatus {
    PunchLabBridgeStatus {
        driver_id: "tauri-shell",
        detail: "Tauri shell can report capabilities, devices, project files, and buffer preferences; native audio render and monitoring commands are not active yet.",
        implemented_methods: IMPLEMENTED_NATIVE_METHODS.to_vec(),
        native_bridge_ready: false,
        planned_methods: PLANNED_NATIVE_METHODS.to_vec(),
    }
}

#[tauri::command]
fn get_capabilities(state: tauri::State<'_, NativeAudioState>) -> PunchLabCapabilities {
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
        audio_output_routing: false,
        realtime_native_monitoring: false,
        plugin_host: false,
        sample_rates: vec![44100, 48000],
        buffer_sizes: SUPPORTED_BUFFER_SIZES.to_vec(),
        preferred_buffer_size: state.buffer_size(),
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

#[tauri::command]
fn get_latency_stats(state: tauri::State<'_, NativeAudioState>) -> PunchLabLatencyStats {
    make_latency_stats(&state)
}

#[tauri::command]
fn set_output_device(
    state: tauri::State<'_, NativeAudioState>,
    payload: Option<SetOutputDevicePayload>,
) -> OutputDeviceResult {
    let device_id = payload.and_then(|value| value.device_id).unwrap_or_default();
    state.set_output_device_id(device_id);
    OutputDeviceResult {
        active: false,
        device_id: state.output_device_id(),
        native_audio_engine_ready: false,
        supported: false,
        unsupported: true,
        source: "tauri-shell",
    }
}

#[tauri::command]
fn set_buffer_size(
    state: tauri::State<'_, NativeAudioState>,
    payload: Option<SetBufferSizePayload>,
) -> PunchLabLatencyStats {
    let requested = payload
        .and_then(|value| value.buffer_size.or(value.size))
        .unwrap_or(DEFAULT_BUFFER_SIZE);
    let buffer_size = if SUPPORTED_BUFFER_SIZES.contains(&requested) {
        requested
    } else {
        DEFAULT_BUFFER_SIZE
    };
    state.set_buffer_size(buffer_size);
    make_latency_stats(&state)
}

#[tauri::command]
async fn open_project_file(
    app: tauri::AppHandle,
    payload: Option<OpenProjectFilePayload>,
) -> Result<ProjectFileResult, String> {
    let Some(file_path) = app
        .dialog()
        .file()
        .add_filter("PunchLab Project", &["punchlab.json", "json"])
        .blocking_pick_file()
    else {
        return Ok(canceled_project_file_result("application/json"));
    };
    let path = file_path.into_path().map_err(|error| error.to_string())?;
    let bytes = fs::read(&path).map_err(|error| error.to_string())?;
    let file_type = payload
        .and_then(|value| value.file_type)
        .unwrap_or_else(|| "application/json".to_string());
    let data_url = encode_data_url(&file_type, &bytes);

    Ok(ProjectFileResult {
        canceled: false,
        bytes: bytes.len(),
        data_url: Some(data_url),
        file_name: path.file_name().map(|name| name.to_string_lossy().to_string()),
        path: Some(path.to_string_lossy().to_string()),
        file_type,
    })
}

#[tauri::command]
async fn save_project_file(
    app: tauri::AppHandle,
    payload: SaveProjectFilePayload,
) -> Result<ProjectFileResult, String> {
    let suggested_name = payload
        .suggested_name
        .as_deref()
        .filter(|value| !value.trim().is_empty())
        .unwrap_or("project.punchlab.json");
    let file_type = payload
        .file_type
        .unwrap_or_else(|| "application/json".to_string());
    let Some(file_path) = app
        .dialog()
        .file()
        .add_filter("PunchLab Project", &["punchlab.json", "json"])
        .set_file_name(suggested_name)
        .blocking_save_file()
    else {
        return Ok(canceled_project_file_result(&file_type));
    };
    let path = file_path.into_path().map_err(|error| error.to_string())?;
    let bytes = decode_data_payload(&payload.data)?;
    fs::write(&path, &bytes).map_err(|error| error.to_string())?;

    Ok(ProjectFileResult {
        canceled: false,
        bytes: bytes.len(),
        data_url: None,
        file_name: path.file_name().map(|name| name.to_string_lossy().to_string()),
        path: Some(path.to_string_lossy().to_string()),
        file_type,
    })
}

fn canceled_project_file_result(file_type: &str) -> ProjectFileResult {
    ProjectFileResult {
        canceled: true,
        bytes: 0,
        data_url: None,
        file_name: None,
        path: None,
        file_type: file_type.to_string(),
    }
}

fn decode_data_payload(data: &str) -> Result<Vec<u8>, String> {
    let source = data.trim();
    if let Some((meta, body)) = source.split_once(',') {
        if meta.starts_with("data:") && meta.contains(";base64") {
            return general_purpose::STANDARD
                .decode(body)
                .map_err(|error| error.to_string());
        }
    }
    Ok(source.as_bytes().to_vec())
}

fn encode_data_url(file_type: &str, bytes: &[u8]) -> String {
    format!(
        "data:{};base64,{}",
        file_type,
        general_purpose::STANDARD.encode(bytes)
    )
}

fn make_latency_stats(state: &NativeAudioState) -> PunchLabLatencyStats {
    PunchLabLatencyStats {
        input_latency_ms: None,
        output_latency_ms: None,
        round_trip_latency_ms: None,
        buffer_size: state.buffer_size(),
        sample_rate: state.sample_rate(),
        native_audio_engine_ready: false,
        source: "tauri-shell",
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(NativeAudioState::default())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            get_punchlab_bridge_status,
            get_capabilities,
            get_devices,
            get_latency_stats,
            set_output_device,
            set_buffer_size,
            open_project_file,
            save_project_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running PunchLab Tauri shell");
}
