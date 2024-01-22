import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const schema = z.object({
  username: z.string().min(4).max(20),
  email: z.string().email(),
  password: z.string().min(8),
});

const app = new Hono();

app.post("/", zValidator("json", schema), async (c) => {
  const body = await c.req.json();
  return c.json(body);
});

export default app;
