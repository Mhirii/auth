import { Context } from "hono";

import { createAccessToken, createRefreshToken, getXata, hash } from "./utils";

export const signup = async (c: Context) => {
  const { username, email, password } = await c.req.json();

  try {
    const xata = getXata(c);
    const passwordHash = await hash(password);
    const secret = await c.env.JWT_SECRET;

    const user = await xata.db.auths.create({
      username: username,
      email: email,
      password_hash: passwordHash,
    });

    const { accessToken, accessTokenExpiry } = await createAccessToken(secret, {
      username,
      email,
      id: user.id,
    });
    const { refreshToken } = await createRefreshToken(secret, {
      id: user.id,
    });

    // DB takes date in Date format
    const access_token_expires = new Date(accessTokenExpiry);

    const session = await xata.db.sessions.create({
      auth: user.id,
      refresh_token: refreshToken,
      access_token: accessToken,
      access_token_expires,
      platform: "",
    });

    const response = {
      id: user.id,
      username,
      email,
      verified: user.verified,
      session: {
        id: session.id,
        access_token: accessToken,
        refresh_token: refreshToken,
        access_token_expiry: accessTokenExpiry.toString(),
      },
    };

    return c.json(response);
  } catch (error) {
    console.log(error);
    return c.json(error);
  }
};
