import { isDev } from "@fukumong/util";
import c from "chalk";

export function log(message: string, level = "info", write = false) {
  const m = `[${c.cyan`${level}`}] ${message}`;
  if (write) process.stdout.write(m);
  else console.log(m);
}

export async function step(name: string, fn: (resolve: () => void) => any) {
  log(`${name}... `, "info", true);
  try {
    await new Promise<void>(resolve => fn(resolve)?.then?.(resolve));
    console.log(c.greenBright`done`);
  } catch (e) {
    console.log(c.redBright`fail\n`);
    throw e;
  }
}

step.dev = async function devStep(name: string, fn: () => Promise<any>) {
  if (!isDev()) return;
  return step(name, fn);
};

step.prod = async function prodStep(name: string, fn: () => Promise<any>) {
  if (isDev()) return;
  return step(name, fn);
};
