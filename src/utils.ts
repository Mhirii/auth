import { Context } from "hono";
import { XataClient } from "./xata";

export const getXata = (c: Context) => {
  const xata = new XataClient({
    apiKey: c.env.XATA_API_KEY,
    branch: c.env.XATA_BRANCH,
  });
  return xata;
};
