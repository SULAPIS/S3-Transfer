import { transferActions } from "@/features/transferSlice";
import { getNameFromPath } from "@/lib/utils";
import { AppDispatch } from "@/store";
import { UploadProgressPayload } from "@/types/tauriEvent";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { useEffect, useRef } from "react";

export function useTauriEvent<T>(
  eventName: string,
  dispatch: AppDispatch,
  handler: (payload: T, dispatch: AppDispatch) => void,
  deps: any[] = []
) {
  const unlistenRef = useRef<UnlistenFn | null>(null);

  useEffect(() => {
    if (unlistenRef.current) {
      unlistenRef.current();
      unlistenRef.current = null;
    }

    let cancelled = false;
    async function listenEvent() {
      const unlisten = await listen<T>(eventName, (event) => {
        handler(event.payload, dispatch);
      });

      if (cancelled) {
        unlisten();
      } else {
        unlistenRef.current = unlisten;
      }
    }

    listenEvent();

    return () => {
      cancelled = true;
    };
  }, deps);
}

export function uploadProgressHandler(
  payload: UploadProgressPayload,
  dispatch: AppDispatch
) {
  switch (payload.event_type) {
    case "Start":
      dispatch(
        transferActions.addTransfer({
          id: payload.upload_id,
          name: getNameFromPath(payload.file_path!),
          type: "upload",
          status: "transferring",
          totalSize: payload.total_size,
          transferredSize: payload.transferred_size,
        })
      );
      break;
    case "Update":
      dispatch(
        transferActions.updateTransferProgress({
          id: payload.upload_id,
          status: "transferring",
          transferredSize: payload.transferred_size,
        })
      );
      break;
    case "End":
      dispatch(
        transferActions.updateTransferProgress({
          id: payload.upload_id,
          status: "finished",
          transferredSize: payload.transferred_size,
        })
      );
      break;

    default:
      break;
  }
}
