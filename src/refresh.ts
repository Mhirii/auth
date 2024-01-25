import { Context } from "hono";
import { verify } from "hono/jwt";
import {
  createAccessToken,
  getTokenFromHeader,
  getXata,
  validateRefreshToken,
  verifyRefreshToken,
} from "./utils";
import { AccessTokenPayload } from "./types/tokens";

export const refresh = async (c: Context) => {
  try {
    const refreshToken = await getTokenFromHeader(
      c.req.header("Authentication"),
    );

    const secret = await c.env.JWT_SECRET;
    const decodedToken = await validateRefreshToken(refreshToken, secret);

    const apiKey = await c.env.XATA_API_KEY;
    const branch = await c.env.XATA_BRANCH;
    const xata = getXata(apiKey, branch);

    await verifyRefreshToken(xata, refreshToken);

    const id = decodedToken.id;
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
  } catch (error) {
    return c.json(error, 500);
  }
};
