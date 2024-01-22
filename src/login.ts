import { Context } from "hono";

export const login = async (c: Context) => {
  const body = await c.req.json();
  // TODO: get user from DB
  // TODO: check password hash
  // TODO: Generate new Session
  return c.json(body);
};
