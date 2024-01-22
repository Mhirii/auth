import { Context } from "hono";
import { z } from "zod";
import { getXata } from "./utils";
import { sign } from "hono/jwt";

export const SignupSchema = z.object({
  username: z.string().min(4).max(20),
  email: z.string().email(),
  password: z.string().min(8),
});

export const signup = async (c: Context) => {
  const { username, email, password } = await c.req.json();
  const xata = getXata(c);
  try {
    const user = await xata.db.auths.create({
      username: username,
      email: email,
      password_hash: password, // TODO: hash the password
    });

    const id = user.id;
    const payload = {
      username: username,
      email: email,
      id: id,
    };
    const secret = "mySecretKey";
    const token = await sign(payload, secret);

    return c.json({ user, token });
  } catch (error) {
    console.log(error);
    return c.json(error);
  }
};
