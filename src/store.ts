import { load, type Store } from "@tauri-apps/plugin-store";

import { configureStore, createListenerMiddleware } from "@reduxjs/toolkit";
import { s3Slice } from "./features/s3Slice";
import { cognitoApi } from "./api/cognitoApi";
import { s3Api } from "./api/s3Api";
import { transferSlice } from "./features/transferSlice";
import { settingActions, settingSlice } from "./features/settingSlice";
import { authSlice } from "./features/authSlice";

const listenerMiddleware = createListenerMiddleware();
listenerMiddleware.startListening({
  actionCreator: settingActions.setSetting,
  effect: async (action) => {
    await appStore.set("setting", action.payload);
    await appStore.save();
  },
});
listenerMiddleware.startListening({
  actionCreator: authSlice.actions.setToken,
  effect: async (action) => {
    await appStore.set("token", action.payload);
    await appStore.save();
  },
});

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    setting: settingSlice.reducer,
    s3: s3Slice.reducer,
    transfer: transferSlice.reducer,
    [cognitoApi.reducerPath]: cognitoApi.reducer,
    [s3Api.reducerPath]: s3Api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .prepend(listenerMiddleware.middleware)
      .concat(cognitoApi.middleware)
      .concat(s3Api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export var appStore: Store;

export async function initTauriStore() {
  appStore = await load("store.json");
}
