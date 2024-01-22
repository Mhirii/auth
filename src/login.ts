import { Context } from "hono";
import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const login = async (c: Context) => {
  const body = await c.req.json();
  return c.json(body);
};
