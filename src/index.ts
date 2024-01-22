import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { signup, SignupSchema } from "./signup";
import { login, LoginSchema } from "./login";
import refresh from "./refresh";
import logout from "./logout";

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
app.route("/logout", logout);
app.route("/refresh", refresh);

export default app;
