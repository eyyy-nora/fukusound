import { env, isDev } from "@fukumong/util";
import { DataSource } from "typeorm";
import * as entities from "src/entities";
import * as migrations from "src/migrations";

export const db = new DataSource({
  type: "postgres",
  host: env("postgres_host", "localhost"),
  port: env("postgres_port", 5432),
  database: env("postgres_db", "fukusound"),
  username: env("postgres_user", "fukusound"),
  password: env("postgres_password", "fukusound"),
  logger: "debug",
  logging: isDev(),
  entities: Object.values(entities),
  migrations: Object.values(migrations),
  subscribers: [],
});
