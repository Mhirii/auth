import { Hono } from "hono";

const signup = new Hono();

signup.get("/", (c) => c.json("list books"));
signup.post("/", (c) => c.json("create a book", 201));
signup.get("/:id", (c) => c.json(`get ${c.req.param("id")}`));

export default signup;
