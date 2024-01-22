import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { signup, SignupSchema } from "./signup";
import { login, LoginSchema } from "./login";
import refresh from "./refresh";
import logout from "./logout";
import { compare, hash } from "./utils";

type Bindings = {
  XATA_BRANCH: string;
  XATA_API_KEY: string;
  JWT_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});
app.post(
  "/signup",
  zValidator("json", SignupSchema),
  async (c) => await signup(c),
);
app.post(
  "/login",
  zValidator("json", LoginSchema),
  async (c) => await login(c),
);
app.post("/hash", async (c) => {
  const body = await c.req.json();
  const password = body.password as string;
  const passwordHash = await hash(password);
  return c.json(passwordHash);
});

app.post("/compare", async (c) => {
  const body = await c.req.json();
  const passwordHash = body.passwordHash as string;
  const password = body.password as string;
  const result = await compare(password, passwordHash);
  return c.json(result);
});
app.route("/logout", logout);
app.route("/refresh", refresh);

export default app;
