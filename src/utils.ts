import { Context } from "hono";
import { sign } from "hono/jwt";
import { XataClient } from "./xata";
import bcrypt from "bcrypt";

const saltRounds = 10;

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

export const hashPassword = async (password: string) => {
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const password_hash = await bcrypt.hash(password, salt);
    return password_hash;
  } catch (error) {
    console.log(error);
  }
};

export const comparePassword = async (
  password: string,
  password_hash: string,
) => {
  try {
    const res = await bcrypt.compare(password, password_hash);
    return res;
  } catch (err) {
    console.error(err);
  }
};
