import { Context } from "hono";
import {
  compare,
  createAccessToken,
  createRefreshToken,
  getXata,
} from "./utils";

export const login = async (c: Context) => {
  const body = await c.req.json();

  const { email, password } = await c.req.json();

  const apiKey = await c.env.XATA_API_KEY;
  const branch = await c.env.XATA_BRANCH;

  try {
    const xata = getXata(apiKey, branch);
    const secret = await c.env.JWT_SECRET;

    // get user by email
    const users = await xata.db.auths.filter({ email: email }).getMany();
    if (!users[0]) {
      return c.json({ error: "User not found" });
    }
    const { id, password_hash, username } = users[0];
    if (!password_hash || !id || !username) {
      return c.json({ error: "User not found" });
    }

    // compare the pw
    const match = await compare(password, password_hash);
    if (!match) {
      return c.json({ error: "Invalid password" });
    }

    // create token
    const { accessToken, accessTokenExpiry } = await createAccessToken(secret, {
      username: username,
      email: email,
      id: id,
    });

    // if the access token already exists then delete the session
    const sessions = await xata.db.sessions
      .filter({ access_token: accessToken })
      .getMany();
    if (sessions[0]) {
      await xata.db.sessions.delete(sessions[0].id);
    }

    const { refreshToken } = await createRefreshToken(secret, { id: id });

    const access_token_expires = new Date(accessTokenExpiry);

    const session = await xata.db.sessions.create({
      auth: id,
      refresh_token: refreshToken,
      access_token: accessToken,
      access_token_expires,
      platform: "",
    });

    const response = {
      id: id,
      username,
      email,
      verified: users[0].verified,
      session: {
        id: session.id,
        access_token: accessToken,
        refresh_token: refreshToken,
        access_token_expiry: accessTokenExpiry.toString(),
      },
    };

    return c.json(response);
  } catch (error) {
    return c.json(error);
  }
};
