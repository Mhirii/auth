import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

import { LoginSchema, SignupSchema } from "./types/types";
import { login } from "./login";
import { signup } from "./signup";
import { logout } from "./logout";
import { refresh } from "./refresh";

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
app.post("/logout", logout);
// TODO: Validation
app.post("/refresh", refresh);

// ╭─────────────────────────────────────────────────────────╮
// │                                                         │
// │ import { compare, hash } from "./utils";                │
// │ app.post("/hash", async (c) => {                        │
// │ const body = await c.req.json();                        │
// │ const password = body.password as string;               │
// │ const passwordHash = await hash(password);              │
// │ return c.json(passwordHash);                            │
// │ });                                                     │
// │ app.post("/compare", async (c) => {                     │
// │ const body = await c.req.json();                        │
// │ const passwordHash = body.passwordHash as string;       │
// │ const password = body.password as string;               │
// │ const result = await compare(password, passwordHash);   │
// │ return c.json(result);                                  │
// │ });                                                     │
// │                                                         │
// ╰─────────────────────────────────────────────────────────╯

export default app;
