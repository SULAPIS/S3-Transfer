use std::{
    io::Error,
    pin::Pin,
    task::{Context, Poll},
    time::Duration,
};

use aws_config::{BehaviorVersion, Region};
use aws_sdk_s3::{config::Credentials, error::DisplayErrorContext, primitives::ByteStream, Client};
use aws_smithy_types::body::SdkBody;
use reqwest::Body;
use tauri::{Emitter, Window};
use tokio::{
    fs::File,
    io::{AsyncRead, ReadBuf},
    time::Instant,
};
use tokio_util::io::ReaderStream;
use uuid::Uuid;

struct ProgressReader {
    inner: File,
    total: u64,
    upload_id: String,
    uploaded: u64,
    window: Window,
    last_emit_time: Instant,
}

impl AsyncRead for ProgressReader {
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
                self.uploaded += bytes_read;
                if self.uploaded == self.total
                    || self.last_emit_time.elapsed() > Duration::from_millis(100)
                {
                    let _ = self.window.emit(
                        "upload-progress",
                        Payload {
                            upload_id: self.upload_id.clone(),
                            uploaded: self.uploaded,
                            total: self.total,
                        },
                    );
                    self.last_emit_time = Instant::now();
                }
            } else {
                println!("done")
            }
        }

        poll
    }
}

#[derive(Clone, serde::Serialize)]
struct Payload {
    upload_id: String,
    uploaded: u64,
    total: u64,
}

#[derive(Clone, serde::Serialize, serde::Deserialize)]
pub struct AwsCredentials {
    access_key_id: String,
    secret_access_key: String,
    session_token: String,
    identity_id: String,
}

#[tauri::command]
pub async fn upload_file(
    window: Window,
    file_path: String,
    region: String,
    bucket: String,
    creds: AwsCredentials,
    key: String,
) -> Result<String, String> {
    let file = File::open(&file_path).await.map_err(|e| e.to_string())?;
    let metadata = file.metadata().await.map_err(|e| e.to_string())?;
    let total_size = metadata.len();
    let upload_id = Uuid::new_v4().to_string();

    let progress_reader = ProgressReader {
        inner: file,
        total: total_size,
        upload_id: upload_id.clone(),
        uploaded: 0,
        window,
        last_emit_time: Instant::now(),
    };

    let stream = ReaderStream::new(progress_reader);
    let body = Body::wrap_stream(stream);
    let byte_stream = ByteStream::new(SdkBody::from_body_1_x(body));

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

    client
        .put_object()
        .bucket(bucket)
        .key(key)
        .content_length(total_size as i64)
        .body(byte_stream)
        .send()
        .await
        .map_err(|e| DisplayErrorContext(&e).to_string())?;
    Ok(upload_id)
}
