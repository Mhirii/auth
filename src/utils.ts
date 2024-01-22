import { Context } from "hono";
import { XataClient } from "./xata";
import { sign } from "hono/jwt";

export const getXata = (c: Context) => {
  const xata = new XataClient({
    apiKey: c.env.XATA_API_KEY,
    branch: c.env.XATA_BRANCH,
  });
  return xata;
};

type Payload = {
  username: string;
  email: string;
  id: string;
  expiry: string;
  refresh_expiry: string;
};
export const encodeJWT = async (c: Context, payload: Payload) => {
  const secret = c.env.JWT_SECRET;
  const access_payload = {
    id: payload.id,
    username: payload.username,
    email: payload.email,
    expiry: payload.expiry,
  };
  const access_token = await sign(access_payload, secret);
  const refresh_payload = { id: payload.id, expiry: payload.refresh_expiry };

  const refresh_token = await sign(refresh_payload, secret);
  return { access_token, refresh_token };
};

export const hash = async (password: string) => {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", passwordBuffer);
  const hashedPassword = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashedPassword;
};

export const compare = async (password: string, hashedPassword: string) => {
  try {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", passwordBuffer);
    const hash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    console.log(hash);
    console.log(hashedPassword);

    if (hash === hashedPassword) {
      return true;
    }
    return false;
  } catch (error) {
    console.log(error);
    return error;
  }
};
