import { z } from "zod";

export const CLIENT_ID = "4ffsb0vm36pkf8cvb74nbrvo7m";

export type RefreshTokenRequest = {
  AuthFlow: "REFRESH_TOKEN";
  ClientId: string;
  AuthParameters: {
    REFRESH_TOKEN: string;
    SECRET_HASH: string;
  };
};

export const RefreshTokenResponseSchema = z.object({
  AuthenticationResult: z.object({
    AccessToken: z.string(),
    ExpiresIn: z.number(),
    IdToken: z.string(),
    TokenType: z.string(),
  }),
});

export type LoginRequest = {
  AuthFlow: "USER_PASSWORD_AUTH";
  ClientId: string;
  AuthParameters: {
    USERNAME: string;
    PASSWORD: string;
  };
};

export const LoginResponseSchema = z.object({
  AuthenticationResult: z.object({
    AccessToken: z.string(),
    ExpiresIn: z.number(),
    IdToken: z.string(),
    RefreshToken: z.string(),
    TokenType: z.string(),
  }),
});

export type RefreshTokenResponse = z.infer<typeof RefreshTokenResponseSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
