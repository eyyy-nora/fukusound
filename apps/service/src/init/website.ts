import { db, Session } from "@fukumong/database";
import { env, isDev } from "@fukumong/util";
import { createExpressErrorHandler } from "@propero/easy-api";
import { TypeormStore } from "connect-typeorm";
import express, { Express } from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import { apiRouter } from "src/mount";

export async function initWebsite(app: Express) {
  app.use(
    cookieParser(),
    express.json(),
    express.urlencoded({ extended: true }),
    session({
      secret: env("api_session_secret"),
      resave: true,
      saveUninitialized: true,
      cookie: {},
      store: new TypeormStore({
        cleanupLimit: 2,
        limitSubquery: false,
        ttl: env("website_session_ttl", 86400),
      }).connect(db.getRepository(Session)),
    }),
  );
  app.use(apiRouter);
  app.use(
    createExpressErrorHandler((req, err) => {
      console.error(err);
      return isDev();
    }),
  );
}
