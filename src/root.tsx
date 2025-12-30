import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  redirect,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { Provider } from "react-redux";

import type { Route } from "./+types/root";
import "./app.css";
import LoadingScreen from "./components/LoadingScreen";
import { appStore, initTauriStore, store } from "./store";
import { Toaster } from "sonner";
import { Setting, settingActions } from "./features/settingSlice";
import { cognitoApi } from "./api/cognitoApi";
import { authActions } from "./features/authSlice";
import { invoke } from "@tauri-apps/api/core";

let appInit: boolean = false;

export async function clientLoader() {
  if (!appInit) {
    appInit = true;
    await initTauriStore();
    const setting = await appStore.get<Setting>("setting");

    if (setting === undefined) {
      return redirect("/setting");
    }
    let { cognitoSetting, downloadPath } = setting;

    const token = await appStore.get<string>("token");

    if (downloadPath === undefined) {
      downloadPath = await invoke<string | undefined>("get_download_dir");
    }
    if (downloadPath !== undefined) {
      store.dispatch(settingActions.setDownloadPath(downloadPath));
    }

    if (cognitoSetting === undefined || token === undefined) {
      return redirect("/setting");
    } else {
      store.dispatch(settingActions.setCognitoSetting(cognitoSetting));
    }
    try {
      const response = await store
        .dispatch(
          cognitoApi.endpoints.refresh.initiate({
            cognitoSetting,
            refreshToken: token,
          })
        )
        .unwrap();
      store.dispatch(authActions.setAwsCredentials(response.credentials));
      store.dispatch(authActions.setToken(response.refreshToken));
    } catch (error) {
      console.error(error);
      return redirect("/setting");
    }
  }
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="w-full h-screen bg-background">
        {children}
        <ScrollRestoration />
        <Scripts />
        <Toaster position="top-right" />
      </body>
    </html>
  );
}

export function HydrateFallback() {
  return <LoadingScreen />;
}

export default function App() {
  return (
    <Provider store={store}>
      <Outlet />
    </Provider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
