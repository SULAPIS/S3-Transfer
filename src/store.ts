import { load, type Store } from "@tauri-apps/plugin-store";

import { configureStore } from "@reduxjs/toolkit";
import { appSlice } from "./features/appSlice";
import { s3Slice } from "./features/s3Slice";
import { cognitoApi } from "./api/cognitoApi";
import { s3Api } from "./api/s3Api";
import { transferSlice } from "./features/transferSlice";

export const store = configureStore({
  reducer: {
    app: appSlice.reducer,
    s3: s3Slice.reducer,
    transfer: transferSlice.reducer,
    [cognitoApi.reducerPath]: cognitoApi.reducer,
    [s3Api.reducerPath]: s3Api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(cognitoApi.middleware)
      .concat(s3Api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export var tauriStore: Store;

export interface AppSetting {
  region: string;
  clientId: string;
  userPoolId: string;
  identityPoolId: string;
}

export async function initTauriStore() {
  tauriStore = await load("store.json");
}

export async function getSetting() {
  return tauriStore.get<AppSetting>("setting");
}

export async function setSetting(setting: AppSetting) {
  await tauriStore.set("setting", setting);
  await tauriStore.save();
}

export async function getToken() {
  return tauriStore.get<string>("token");
}

export async function setToken(token: string) {
  await tauriStore.set("token", token);
  await tauriStore.save();
}
