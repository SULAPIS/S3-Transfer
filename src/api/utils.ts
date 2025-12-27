import { store } from "@/store";
import { _NEVER, BaseQueryApi } from "@reduxjs/toolkit/query";
import { Mutex } from "async-mutex";
import { cognitoApi } from "./cognitoApi";
import { toast } from "sonner";

const mutex = new Mutex();

type QueryFn<Result, QueryArg> = (
  arg: QueryArg,
  api: BaseQueryApi,
  extraOptions: {},
  baseQuery: any
) => Promise<{ data: Result } | { error: any }>;

export const withReauth = <Result, QueryArg>(
  queryFn: QueryFn<Result, QueryArg>
): QueryFn<Result, QueryArg> => {
  return async (arg, api, extraOptions, baseQuery) => {
    let result = await queryFn(arg, api, extraOptions, baseQuery);

    if ("error" in result && (result.error as any)?.name === "ExpiredToken") {
      if (!mutex.isLocked()) {
        const release = await mutex.acquire();

        try {
          const state = store.getState().auth;
          const setting = store.getState().setting;
          if (
            !state.refreshToken ||
            !state.awsCredentials ||
            !setting.cognitoSetting
          ) {
            toast.warning("Please log in again.");
            return { error: "not-authenticated" };
          }
          await store.dispatch(
            cognitoApi.endpoints.refresh.initiate({
              cognitoSetting: setting.cognitoSetting,
              refreshToken: state.refreshToken!,
            })
          );
        } catch (error) {
          return result;
        } finally {
          release();
        }
      } else {
        await mutex.waitForUnlock();
      }
      result = await queryFn(arg, api, extraOptions, baseQuery);
    }

    return result;
  };
};
