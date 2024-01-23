import { Context } from "hono";
import { XataClient } from "./xata";
import { sign } from "hono/jwt";
import { AccessTokenPayload, RefreshTokenPayload } from "./types/types";

export const getXata = (apiKey: string, branch: string) => {
  const xata = new XataClient({
    apiKey: apiKey,
    branch: branch,
  });
  return xata;
};

export const hour = 3600000;
export const year = hour * 24 * 31 * 12;
export const accessTokenExpiry = Date.now() - hour * 24;
export const refreshTokenExpiry = Date.now() + year;

export const createAccessToken = async (
  secret: string,
  accessTokenPayload: AccessTokenPayload,
) => {
  const accessToken = await sign(
    { ...accessTokenPayload, exp: accessTokenExpiry },
    secret,
  );
  return { accessToken, accessTokenExpiry };
};

export const createRefreshToken = async (
  secret: string,
  refreshTokenPayload: RefreshTokenPayload,
) => {
  const refreshToken = await sign(
    { ...refreshTokenPayload, exp: refreshTokenExpiry },
    secret,
  );
  return { refreshToken, refreshTokenExpiry };
};

export const hash = async (password: string) => {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", passwordBuffer);
  const hashedPassword = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashedPassword;
};

export const compare = async (password: string, hashedPassword: string) => {
  try {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", passwordBuffer);
    const hash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (hash === hashedPassword) {
      return true;
    }
    return false;
  } catch (error) {
    console.log(error);
    return error;
  }
};
