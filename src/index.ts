import { Hono } from "hono";

import signup from "./signup";
import login from "./login";
import refresh from "./refresh";
import logout from "./logout";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});
app.route("/signup", signup);
app.route("/login", login);
app.route("/logout", logout);
app.route("/refresh", refresh);

export default app;
