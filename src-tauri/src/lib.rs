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

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct PunchLabBridgeStatus {
    driver_id: &'static str,
    detail: &'static str,
    implemented_methods: Vec<&'static str>,
    native_bridge_ready: bool,
    planned_methods: Vec<&'static str>,
}

#[tauri::command]
fn get_punchlab_bridge_status() -> PunchLabBridgeStatus {
    PunchLabBridgeStatus {
        driver_id: "tauri-shell",
        detail: "Tauri shell is available; native audio engine commands are not active yet.",
        implemented_methods: Vec::new(),
        native_bridge_ready: false,
        planned_methods: PLANNED_NATIVE_METHODS.to_vec(),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![get_punchlab_bridge_status])
        .run(tauri::generate_context!())
        .expect("error while running PunchLab Tauri shell");
}
