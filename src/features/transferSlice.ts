import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type TransferType = "download" | "upload";
export type TransferStatus = "stopping" | "transferring" | "finished";
export interface Transfer {
  id: string;
  name: string;
  type: TransferType;
  status: TransferStatus;
  totalSize: number;
  transferredSize: number;
  finishDate?: String;
  increment?: number;
}
export interface TransferState {
  transfers: Transfer[];
}

export const transferSlice = createSlice({
  name: "transfer",
  initialState: {
    transfers: [],
  } as TransferState,
  reducers: {
    addTransfer(state, action: PayloadAction<Transfer>) {
      state.transfers.push(action.payload);
    },
    updateTransferProgress(
      state,
      action: PayloadAction<{
        id: string;
        transferredSize?: number;
        status?: TransferStatus;
      }>
    ) {
      let transfer = state.transfers.find((v) => v.id === action.payload.id);
      if (transfer !== undefined) {
        if (action.payload.transferredSize !== undefined) {
          transfer.increment =
            action.payload.transferredSize - transfer.transferredSize;
          transfer.transferredSize = action.payload.transferredSize;
        }

        if (action.payload.status !== undefined) {
          transfer.status = action.payload.status;
        }
      }
    },
  },
});

export const transferActions = transferSlice.actions;
