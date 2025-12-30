#[tauri::command]
pub fn get_download_dir() -> Option<String> {
    dirs::download_dir().and_then(|path| path.to_str().map(|s| s.to_string()))
}
