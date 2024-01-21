import { Hono } from "hono";
import signup from "./signup";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});
app.route("/signup", signup);

export default app;
