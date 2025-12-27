import { appActions, AwsCredentials } from "@/features/appSlice";
import { AppSetting, setSetting, setToken } from "@/store";
import {
  CognitoIdentityProviderClient,
  GetTokensFromRefreshTokenCommand,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";

type LoginArg = {
  setting: AppSetting;
  username: string;
  password: string;
};
type RefreshArg = {
  setting: AppSetting;
  refreshToken: string;
};

export const cognitoApi = createApi({
  reducerPath: "cognitoApi",
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    login: builder.mutation<
      {
        refreshToken: string;
        credentials: AwsCredentials;
      },
      LoginArg
    >({
      queryFn: async ({
        setting: { region, clientId, identityPoolId, userPoolId },
        username,
        password,
      }: LoginArg) => {
        const cognitoClient = new CognitoIdentityProviderClient({
          region: region,
        });
        const command = new InitiateAuthCommand({
          AuthFlow: "USER_PASSWORD_AUTH",
          ClientId: clientId,
          AuthParameters: {
            USERNAME: username,
            PASSWORD: password,
          },
        });
        try {
          const response = await cognitoClient.send(command);
          if (!response.AuthenticationResult) {
            return { error: "failed-login" };
          }
          const credentials = await fromCognitoIdentityPool({
            clientConfig: { region },
            identityPoolId: identityPoolId,
            logins: {
              [`cognito-idp.${region}.amazonaws.com/${userPoolId}`]:
                response.AuthenticationResult?.IdToken ?? "",
            },
          })();

          return {
            data: {
              refreshToken: response.AuthenticationResult
                .RefreshToken as string,
              credentials: {
                secretAccessKey: credentials.secretAccessKey,
                sessionToken: credentials.sessionToken,
                identityId: credentials.identityId,
                accessKeyId: credentials.accessKeyId,
              } as AwsCredentials,
            },
          };
        } catch (error) {
          return {
            error,
          };
        }
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          dispatch(
            appActions.setAppState({
              setting: arg.setting,
              refreshToken: data.refreshToken,
              awsCredentials: data.credentials,
            })
          );

          await setToken(data.refreshToken);
          await setSetting(arg.setting);
        } catch (error) {
          dispatch(appActions.logout());
        }
      },
    }),
    refresh: builder.mutation<
      {
        refreshToken: string;
        credentials: AwsCredentials;
      },
      RefreshArg
    >({
      queryFn: async ({
        setting: { region, clientId, identityPoolId, userPoolId },
        refreshToken,
      }: RefreshArg) => {
        const cognitoClient = new CognitoIdentityProviderClient({
          region: region,
        });
        const command = {
          RefreshToken: refreshToken,
          ClientId: clientId,
        };
        try {
          const response = await cognitoClient.send(
            new GetTokensFromRefreshTokenCommand(command)
          );
          if (!response.AuthenticationResult) {
            return { error: "failed-refresh-token" };
          }
          const credentials = await fromCognitoIdentityPool({
            clientConfig: { region },
            identityPoolId: identityPoolId,
            logins: {
              [`cognito-idp.${region}.amazonaws.com/${userPoolId}`]:
                response.AuthenticationResult?.IdToken ?? "",
            },
          })();
          return {
            data: {
              refreshToken: response.AuthenticationResult
                .RefreshToken as string,
              credentials: {
                secretAccessKey: credentials.secretAccessKey,
                sessionToken: credentials.sessionToken,
                identityId: credentials.identityId,
                accessKeyId: credentials.accessKeyId,
              } as AwsCredentials,
            },
          };
        } catch (error) {
          return {
            error,
          };
        }
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          dispatch(
            appActions.setAppState({
              setting: arg.setting,
              refreshToken: data.refreshToken,
              awsCredentials: data.credentials,
            })
          );

          await setToken(data.refreshToken);
          await setSetting(arg.setting);
        } catch (error) {
          dispatch(appActions.logout());
        }
      },
    }),
  }),
});

export const { useLoginMutation, useRefreshMutation } = cognitoApi;
