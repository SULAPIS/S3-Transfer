import { AwsCredentials } from "@/features/authSlice";
import { CognitoSetting } from "@/features/settingSlice";
import {
  CognitoIdentityProviderClient,
  GetTokensFromRefreshTokenCommand,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";

type LoginArg = {
  cognitoSetting: CognitoSetting;
  username: string;
  password: string;
};
type RefreshArg = {
  cognitoSetting: CognitoSetting;
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
      queryFn: async (arg: LoginArg) => {
        const {
          cognitoSetting: { region, clientId, identityPoolId, userPoolId },
          username,
          password,
        } = arg;
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
          console.log(error);

          return {
            error: "Failed to login.",
          };
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
      queryFn: async (arg: RefreshArg) => {
        const {
          cognitoSetting: { region, clientId, identityPoolId, userPoolId },
          refreshToken,
        } = arg;
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
    }),
  }),
});

export const { useLoginMutation, useRefreshMutation } = cognitoApi;
