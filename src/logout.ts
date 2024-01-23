import { Context } from "hono";

import { getXata } from "./utils";

export const logout = async (c: Context) => {
  const header = c.req.header("Authentication");
  if (!header) {
    return c.json("Not authorized");
  }
  const [bearer, accessToken] = header.split(" ");
  if (bearer != "bearer" || !header) {
    return c.json("Invalid Request");
  }
  // TODO: Verify the token

  const apiKey = await c.env.XATA_API_KEY;
  const branch = await c.env.XATA_BRANCH;

  try {
    const xata = getXata(apiKey, branch);
    const sessions = await xata.db.sessions
      .filter({ access_token: accessToken })
      .getMany();
    if (sessions[0]) {
      await xata.db.sessions.delete(sessions[0].id);
      return c.json("Logged out Successfully");
    }
  } catch (error) {
    return c.json(error);
  }
};
