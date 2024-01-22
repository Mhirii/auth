import { Hono } from "hono";

const app = new Hono();

app.post("/", async (c) => {
  const body = await c.req.json();

  return c.json(body);
});

export default app;
