// import { AppSetting, appStore } from "@/store";
// import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

// export interface AwsCredentials {
//   accessKeyId: string;
//   secretAccessKey: string;
//   sessionToken: string;
//   identityId: string;
// }
// export interface AppState {
//   setting?: AppSetting;
//   refreshToken?: string;
//   awsCredentials?: AwsCredentials;
// }

// export const appSlice = createSlice({
//   name: "app",
//   initialState: {} as AppState,
//   reducers: {
//     setAppState: (_, action: PayloadAction<AppState>) => {
//       return action.payload;
//     },
//     logout: (state) => {
//       state.refreshToken = undefined;
//       state.awsCredentials = undefined;
//     },
//   },
// });

// export const appActions = appSlice.actions;
