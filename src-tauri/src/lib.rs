mod upload_file;
mod upload_file_multipart;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            upload_file_multipart::upload_file_multipart
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
