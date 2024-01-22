import { Context } from "hono";
import { XataClient } from "./xata";
import { sign } from "hono/jwt";
import { AccessTokenPayload, RefreshTokenPayload } from "./types/types";

// TODO: Give seperate variables instead of the whole context
export const getXata = (c: Context) => {
  const xata = new XataClient({
    apiKey: c.env.XATA_API_KEY,
    branch: c.env.XATA_BRANCH,
  });
  return xata;
};

export const hour = 3600000;
export const year = hour * 24 * 31 * 12;
export const accessTokenExpiry = Date.now() + hour;
export const refreshTokenExpiry = Date.now() + year;

export const createAccessToken = async (
  secret: string,
  accessTokenPayload: AccessTokenPayload,
) => {
  const accessToken = await sign(
    { ...accessTokenPayload, expiry: accessTokenExpiry },
    secret,
  );
  return { accessToken, accessTokenExpiry };
};

export const createRefreshToken = async (
  secret: string,
  refreshTokenPayload: RefreshTokenPayload,
) => {
  const refreshToken = await sign(
    { ...refreshTokenPayload, expiry: refreshTokenExpiry },
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
