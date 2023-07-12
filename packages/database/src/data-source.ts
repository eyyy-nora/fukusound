import { env, isDev } from "@fukumong/util";
import { DataSource } from "typeorm";
import * as entities from "src/entities";
import * as migrations from "src/migrations";

export const db = new DataSource({
  type: "postgres",
  host: env("postgres_host", "localhost"),
  port: env("postgres_port", 5432),
  database: env("postgres_db", "vreiheit-discord"),
  username: env("postgres_user", "vreiheit"),
  password: env("postgres_password", "vreiheit"),
  logger: "debug",
  logging: isDev(),
  entities: Object.values(entities),
  migrations: Object.values(migrations),
  subscribers: [],
});
