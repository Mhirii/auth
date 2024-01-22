import { Context } from "hono";
import { z } from "zod";

import { encodeJWT, getXata, hash } from "./utils";

export const SignupSchema = z.object({
  username: z.string().min(4).max(20),
  email: z.string().email(),
  password: z.string().min(8),
});

export const signup = async (c: Context) => {
  const { username, email, password } = await c.req.json();

  const xata = getXata(c);
  try {
    const passwordHash = await hash(password);
    const user = await xata.db.auths.create({
      username: username,
      email: email,
      password_hash: passwordHash,
    });

    // TODO:This should be handled in encodeJWT
    const hour = 3600000;
    const year = hour * 24 * 31 * 12;
    const expiry = Date.now() + hour;
    const refreshExpiry = (Date.now() + year).toString();

    // TODO: Split this into two functions
    const { access_token, refresh_token } = await encodeJWT(c, {
      username: username,
      email: email,
      id: user.id,
      expiry: expiry.toString(),
      refresh_expiry: refreshExpiry,
    });

    const session = await xata.db.sessions.create({
      auth: user.id,
      refresh_token,
      access_token,
      access_token_expires: new Date(expiry),
      platform: "",
    });

    const response = {
      id: user.id,
      username,
      email,
      verified: user.verified,
      session: {
        id: session.id,
        access_token,
        refresh_token,
        access_token_expiry: expiry,
      },
    };

    return c.json(response);
  } catch (error) {
    console.log(error);
    return c.json(error);
  }
};
