import { Context } from "hono";
import { XataClient } from "./xata";
import { sign, verify } from "hono/jwt";
import {
  AccessTokenPayload,
  RefreshTokenPayload,
  decodedAccessToken,
  decodedRefreshToken,
} from "./types/types";

export const getXata = (apiKey: string, branch: string) => {
  const xata = new XataClient({
    apiKey: apiKey,
    branch: branch,
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

/** validates an access token based on content and exp date
 ** throws error!
 */
export const validateAccessToken = async (
  accessToken: string,
  secret: string,
): Promise<decodedAccessToken> => {
  const decodedToken = await verify(accessToken, secret);
  if (
    !decodedToken ||
    !decodedToken.exp ||
    !decodedToken.username ||
    !decodedToken.id ||
    !decodedToken.email
  ) {
    throw new Error("Invalid token");
  }

  const expDate = new Date(decodedToken.exp);

  if (expDate < new Date()) {
    throw new Error("Token expired");
  }

  return decodedToken;
};

/** validates a refresh token based on content and exp date
 ** throws error!
 */
export const validateRefreshToken = async (
  refreshToken: string,
  secret: string,
): Promise<decodedRefreshToken> => {
  const decodedToken = await verify(refreshToken, secret);
  if (!decodedToken || !decodedToken.exp || !decodedToken.id) {
    throw new Error("Invalid token");
  }

  const expDate = new Date(decodedToken.exp);

  if (expDate < new Date()) {
    throw new Error("Token expired");
  }

  return decodedToken;
};

export const verifyAccessToken = async (
  xata: XataClient,
  accessToken: string,
) => {
  const sessions = await xata.db.sessions
    .filter({ access_token: accessToken })
    .getMany();
  if (!sessions[0]) {
    throw new Error("Invalid access token");
  }
  return sessions[0];
};

export const verifyRefreshToken = async (
  xata: XataClient,
  refreshToken: string,
) => {
  const sessions = await xata.db.sessions
    .filter({ refresh_token: refreshToken })
    .getMany();
  if (!sessions[0]) {
    throw new Error("Invalid refresh token");
  }
  return sessions[0];
};

export const getTokenFromHeader = async (header: string | undefined) => {
  if (!header || header === "") {
    throw new Error("Header is missing");
  }

  const [bearer, token] = header.split(" ");

  if (!header || bearer !== "bearer") {
    throw new Error("Bad Request");
  }
  if (!token) {
    throw new Error("Token is missing");
  }
  return token;
};
