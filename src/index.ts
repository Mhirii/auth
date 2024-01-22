import { Hono } from "hono";

import { signup, SignupSchema } from "./signup";
import { login, LoginSchema } from "./login";
import refresh from "./refresh";
import logout from "./logout";
import { zValidator } from "@hono/zod-validator";
import { XataClient } from "./xata";

type Bindings = {
  XATA_BRANCH: string;
  XATA_API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});
app.post("/signup", zValidator("json", SignupSchema), async (c) => signup(c));
app.post("/login", zValidator("json", LoginSchema), async (c) => login(c));
app.route("/logout", logout);
app.route("/refresh", refresh);

export default app;
