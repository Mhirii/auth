// Generated by Xata Codegen 0.28.3. Please do not edit.
import { buildClient } from "@xata.io/client";
import type {
  BaseClientOptions,
  SchemaInference,
  XataRecord,
} from "@xata.io/client";

const tables = [
  {
    name: "project",
    columns: [{ name: "name", type: "string", unique: true }],
  },
  {
    name: "auths",
    columns: [
      { name: "username", type: "string" },
      { name: "email", type: "email", unique: true },
      { name: "password_hash", type: "string" },
      { name: "verified", type: "bool", notNull: true, defaultValue: "false" },
    ],
    revLinks: [{ column: "auth", table: "sessions" }],
  },
  {
    name: "sessions",
    columns: [
      { name: "access_token", type: "string", unique: true },
      { name: "refresh_token", type: "string", unique: true },
      { name: "platform", type: "string" },
      {
        name: "last_login",
        type: "datetime",
        notNull: true,
        defaultValue: "now",
      },
      { name: "access_token_expires", type: "datetime" },
      { name: "auth", type: "link", link: { table: "auths" } },
    ],
  },
] as const;

export type SchemaTables = typeof tables;
export type InferredTypes = SchemaInference<SchemaTables>;

export type Project = InferredTypes["project"];
export type ProjectRecord = Project & XataRecord;

export type Auths = InferredTypes["auths"];
export type AuthsRecord = Auths & XataRecord;

export type Sessions = InferredTypes["sessions"];
export type SessionsRecord = Sessions & XataRecord;

export type DatabaseSchema = {
  project: ProjectRecord;
  auths: AuthsRecord;
  sessions: SessionsRecord;
};

const DatabaseClient = buildClient();

const defaultOptions = {
  databaseURL:
    "https://Ahmed-Mhiri-s-workspace-58c5he.eu-central-1.xata.sh/db/auth",
};

export class XataClient extends DatabaseClient<DatabaseSchema> {
  constructor(options?: BaseClientOptions) {
    super({ ...defaultOptions, ...options }, tables);
  }
}

let instance: XataClient | undefined = undefined;

export const getXataClient = () => {
  if (instance) return instance;

  instance = new XataClient();
  return instance;
};