import { Context } from "hono";
import { z } from "zod";

import { encodeJWT, getXata } from "./utils";

export const SignupSchema = z.object({
  username: z.string().min(4).max(20),
  email: z.string().email(),
  password: z.string().min(8),
});

export const signup = async (c: Context) => {
  const { username, email, password } = await c.req.json();

  const xata = getXata(c);
  try {
    console.log("creating user");
    const user = await xata.db.auths.create({
      username: username,
      email: email,
      password_hash: password, // TODO: hash the password
    });

    const hour = 3600000;
    const year = hour * 24 * 31 * 12;
    const expiry = Date.now() + hour;
    const refresh_expiry = (Date.now() + year).toString();

    const { access_token, refresh_token } = await encodeJWT(c, {
      username: username,
      email: email,
      id: user.id,
      expiry: expiry.toString(),
      refresh_expiry,
    });

    console.log("creating session");
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
