use base64::{engine::general_purpose, Engine as _};
use serde::{Deserialize, Serialize};
use std::fs;
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

const IMPLEMENTED_NATIVE_METHODS: [&str; 4] = [
    "getCapabilities",
    "getDevices",
    "openProjectFile",
    "saveProjectFile",
];

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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            get_punchlab_bridge_status,
            get_capabilities,
            get_devices,
            open_project_file,
            save_project_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running PunchLab Tauri shell");
}
