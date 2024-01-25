import { Context } from "hono";

import {
  getTokenFromHeader,
  getXata,
  validateAccessToken,
  verifyAccessToken,
} from "./utils";

export const logout = async (c: Context) => {
  try {
    const accessToken = await getTokenFromHeader(
      c.req.header("Authentication"),
    );

    const secret = await c.env.JWT_SECRET;
    await validateAccessToken(accessToken, secret);

    const apiKey = await c.env.XATA_API_KEY;
    const branch = await c.env.XATA_BRANCH;
    const xata = getXata(apiKey, branch);

    const session = await verifyAccessToken(xata, accessToken);
    await xata.db.sessions.delete(session.id);

    return c.json("Logged out Successfully");
  } catch (error) {
    return c.json(error);
  }
};
