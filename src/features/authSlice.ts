import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AwsCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
  identityId: string;
}
export interface AuthState {
  refreshToken?: string;
  awsCredentials?: AwsCredentials;
}

export const authSlice = createSlice({
  name: "auth",
  initialState: {} as AuthState,
  reducers: {
    setToken: (_, action: PayloadAction<string>) => {
      return { refreshToken: action.payload };
    },
    setAwsCredentials: (state, action: PayloadAction<AwsCredentials>) => {
      state.awsCredentials = action.payload;
    },
    clearAuthState: (state) => {
      state.refreshToken = undefined;
      state.awsCredentials = undefined;
    },
  },
});

export const authActions = authSlice.actions;
