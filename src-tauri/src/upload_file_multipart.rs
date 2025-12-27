use std::{
    io::{Cursor, Error},
    path::Path,
    pin::Pin,
    sync::{
        atomic::{AtomicU64, Ordering},
        Arc,
    },
    task::{Context, Poll},
    time::Duration,
};

use aws_config::{BehaviorVersion, Region};
use aws_sdk_s3::{
    config::Credentials,
    error::DisplayErrorContext,
    primitives::ByteStream,
    types::{CompletedMultipartUpload, CompletedPart},
    Client,
};
use aws_smithy_types::body::SdkBody;
use reqwest::Body;
use tauri::{Emitter, Window};
use tokio::{
    fs::File,
    io::{AsyncRead, AsyncReadExt, ReadBuf},
    task::JoinSet,
    time::Instant,
};
use tokio_util::io::ReaderStream;

const CHUNK_SIZE: u64 = 10 * 1024 * 1024;
const MAX_CONCURRENT_UPLOADS: usize = 3;

struct ProgressReader<R> {
    inner: R,
    total_file_size: u64,
    upload_id: String,
    global_uploaded: Arc<AtomicU64>,
    window: Window,
    last_emit_time: Instant,
}

#[derive(Clone, serde::Serialize)]
enum EventType {
    Start,
    End,
    Stop,
    Continue,
    Update,
    Failed,
}

#[derive(Clone, serde::Serialize)]
struct Payload {
    event_type: EventType,
    upload_id: String,
    file_path: Option<String>,
    transferred_size: u64,
    total_size: u64,
    error: Option<String>,
}

#[derive(Clone, serde::Serialize, serde::Deserialize)]
pub struct AwsCredentials {
    access_key_id: String,
    secret_access_key: String,
    session_token: String,
    identity_id: String,
}

impl<R: AsyncRead + Unpin> AsyncRead for ProgressReader<R> {
    fn poll_read(
        mut self: Pin<&mut Self>,
        cx: &mut Context<'_>,
        buf: &mut ReadBuf<'_>,
    ) -> Poll<Result<(), Error>> {
        let prev_len = buf.filled().len() as u64;
        let poll = Pin::new(&mut self.inner).poll_read(cx, buf);

        if let Poll::Ready(Ok(())) = poll {
            let bytes_read = buf.filled().len() as u64 - prev_len;

            if bytes_read > 0 {
                let current_total = self.global_uploaded.fetch_add(bytes_read, Ordering::SeqCst)
                    + bytes_read as u64;

                if self.last_emit_time.elapsed() > Duration::from_millis(1000) {
                    let _ = self.window.emit(
                        "upload-progress",
                        Payload {
                            event_type: EventType::Update,
                            upload_id: self.upload_id.clone(),
                            transferred_size: current_total,
                            total_size: self.total_file_size,
                            file_path: None,
                            error: None,
                        },
                    );
                    self.last_emit_time = Instant::now();
                }
            }
        }

        poll
    }
}

#[tauri::command]
pub async fn upload_file_multipart(
    window: Window,
    file_path: String,
    region: String,
    bucket: String,
    creds: AwsCredentials,
    mut key: String,
) -> Result<String, String> {
    let config = aws_config::defaults(BehaviorVersion::latest())
        .region(Region::new(region))
        .credentials_provider(Credentials::new(
            creds.access_key_id,
            creds.secret_access_key,
            Some(creds.session_token),
            None,
            "manual",
        ))
        .load()
        .await;
    let client = Client::new(&config);

    let mut file = File::open(&file_path).await.map_err(|e| e.to_string())?;
    let file_name = Path::new(&file_path)
        .file_name()
        .and_then(|s| s.to_str())
        .ok_or("invalid file name")?;
    key = format!("{key}{file_name}");
    let metadata = file.metadata().await.map_err(|e| e.to_string())?;
    let total_size = metadata.len();
    let global_uploaded = Arc::new(AtomicU64::new(0));

    let create_resp = client
        .create_multipart_upload()
        .bucket(&bucket)
        .key(&key)
        .send()
        .await
        .map_err(|e| DisplayErrorContext(&e).to_string())?;
    let s3_upload_id = create_resp
        .upload_id()
        .ok_or("Failed to get UploadId")?
        .to_string();

    let _ = window.emit(
        "upload-progress",
        Payload {
            file_path: Some(file_path),
            event_type: EventType::Start,
            upload_id: s3_upload_id.clone(),
            transferred_size: 0,
            total_size: total_size,
            error: None,
        },
    );

    let mut completed_parts = Vec::new();
    let mut part_number = 1;
    let mut buffer = vec![0u8; CHUNK_SIZE as usize];
    let mut set = JoinSet::new();

    loop {
        while set.len() >= MAX_CONCURRENT_UPLOADS {
            // TODO: handle failed and retry
            if let Some(Ok(Ok(part))) = set.join_next().await {
                completed_parts.push(part);
            }
        }

        let mut offset = 0;
        while offset < buffer.len() {
            let bytes_read = file
                .read(&mut buffer[offset..])
                .await
                .map_err(|e| e.to_string())?;
            if bytes_read == 0 {
                break;
            }
            offset += bytes_read;
        }
        if offset == 0 {
            break;
        }

        let data_chunk = buffer[0..offset].to_vec();

        let progress_reader = ProgressReader {
            inner: Cursor::new(data_chunk),
            total_file_size: total_size,
            upload_id: s3_upload_id.clone(),
            global_uploaded: global_uploaded.clone(),
            window: window.clone(),
            last_emit_time: Instant::now(),
        };

        let stream = ReaderStream::new(progress_reader);
        let body = Body::wrap_stream(stream);
        let byte_stream = ByteStream::new(SdkBody::from_body_1_x(body));

        set.spawn({
            let client = client.clone();
            let bucket = bucket.clone();
            let key = key.clone();
            let s3_upload_id = s3_upload_id.clone();
            async move {
                let upload_part_res = client
                    .upload_part()
                    .bucket(&bucket)
                    .key(&key)
                    .upload_id(&s3_upload_id)
                    .part_number(part_number)
                    .body(byte_stream)
                    .content_length(offset as i64)
                    .send()
                    .await
                    .map_err(|e| DisplayErrorContext(&e).to_string());

                match upload_part_res {
                    Ok(res) => Ok(CompletedPart::builder()
                        .e_tag(res.e_tag.unwrap_or_default())
                        .part_number(part_number)
                        .build()),
                    Err(err) => Err(err),
                }
            }
        });

        part_number += 1
    }

    while let Some(Ok(Ok(part))) = set.join_next().await {
        completed_parts.push(part);
    }
    completed_parts.sort_by_key(|part| part.part_number);

    let completed_multipart_upload = CompletedMultipartUpload::builder()
        .set_parts(Some(completed_parts))
        .build();

    client
        .complete_multipart_upload()
        .bucket(&bucket)
        .key(&key)
        .upload_id(&s3_upload_id)
        .multipart_upload(completed_multipart_upload)
        .send()
        .await
        .map_err(|e| DisplayErrorContext(&e).to_string())?;

    let _ = window.emit(
        "upload-progress",
        Payload {
            event_type: EventType::End,
            upload_id: s3_upload_id.clone(),
            transferred_size: total_size,
            total_size,
            error: None,
            file_path: None,
        },
    );

    Ok(s3_upload_id)
}
