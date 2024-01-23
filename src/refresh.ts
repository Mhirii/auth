import { Context } from "hono";
import { verify } from "hono/jwt";
import { createAccessToken, getXata } from "./utils";
import { AccessTokenPayload } from "./types/tokens";

export const refresh = async (c: Context) => {
  const body = await c.req.json();
  if (!body) {
    return c.json("Invalid refresh token", 400);
  }
  const secret = await c.env.JWT_SECRET;

  const refreshToken = body.refresh_token;

  const apiKey = await c.env.XATA_API_KEY;
  const branch = await c.env.XATA_BRANCH;
  const xata = getXata(apiKey, branch);
  const sessions = await xata.db.sessions
    .filter({ refresh_token: refreshToken })
    .getMany();
  if (!sessions[0]) {
    return c.json("Invalid refresh token", 400);
  }

  const decoded = await verify(refreshToken, secret);
  const id = decoded.id;
  const user = await xata.db.auths.read(id);
  if (!user || !user?.username || !user.email) {
    return c.json("User not Found", 404);
  }

  const payload: AccessTokenPayload = {
    id: user.id,
    username: user.username,
    email: user.email,
  };
  const newAccessToken = await createAccessToken(secret, payload);

  return c.json({
    access_token: newAccessToken.accessToken,
    exp: newAccessToken.accessTokenExpiry,
  });
};
