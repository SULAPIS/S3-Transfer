import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface S3State {
  folder: string;
}

export const s3Slice = createSlice({
  name: "s3Slice",
  initialState: {
    folder: "/",
  } as S3State,
  reducers: {
    setFolder(state, action: PayloadAction<string>) {
      state.folder = action.payload;
    },
  },
});

export const S3Action = s3Slice.actions;
