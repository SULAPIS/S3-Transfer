import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CognitoSetting {
  region: string;
  bucket: string;
  clientId: string;
  userPoolId: string;
  identityPoolId: string;
}
export interface Setting {
  cognitoSetting?: CognitoSetting;
  downloadPath?: string;
}

export const settingSlice = createSlice({
  name: "setting",
  initialState: {} as Setting,
  reducers: {
    setCognitoSetting: (state, action: PayloadAction<CognitoSetting>) => {
      state.cognitoSetting = action.payload;
    },
    setDownloadPath: (state, action: PayloadAction<string>) => {
      state.downloadPath = action.payload;
    },
  },
});

export const settingActions = settingSlice.actions;
