import { db } from "@fukumong/database";
import { env } from "@fukumong/util";
import chalk from "chalk";
import express from "express";
import { initDiscord } from "src/init/discord";
import { log, step } from "src/init/util";
import { initWebsite } from "src/init/website";
import "src/controllers";

export async function main() {
  const app = express();
  app.use("*", (req, res, next) => {
    const requestColors: Record<string, any> = {
      POST: chalk.greenBright,
      DELETE: chalk.redBright,
      PUT: chalk.yellowBright,
      GET: chalk.cyanBright,
    };
    log(
      [
        (requestColors[req.method] ?? chalk.cyanBright)(req.method),
        chalk.white(req.originalUrl),
      ].join(" "),
    );
    next();
  });
  await step("db: init", () => db.initialize());
  await step.prod("db: migrations", () => db.runMigrations());
  await step.dev("db: sync", () => db.synchronize());
  await step("discord: init", initDiscord);
  await step("express: init", () => initWebsite(app));
  await step("express: start", r => app.listen(env("api_port", 3001), r));
  log("done! :3");
  log(env("api_url"));
}

if (!module.parent) main().then();
