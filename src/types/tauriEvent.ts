export type UploadProgressEventType =
  | "Start"
  | "End"
  | "Stop"
  | "Continue"
  | "Update"
  | "Failed";

export interface UploadProgressPayload {
  event_type: UploadProgressEventType;
  upload_id: string;
  transferred_size: number;
  total_size: number;
  file_path?: string;
  error?: string;
}
