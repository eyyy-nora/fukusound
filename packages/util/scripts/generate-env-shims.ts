import fs from "node:fs/promises";
import { resolve } from "node:path";

const shimContent = (vars: string[]) => `declare namespace NodeJS {
  export interface ProcessEnv {
${vars.map(it => `    ${it}: string;`).join("\n")}
  }
}
`;

export async function generateEnvShims() {
  const project = resolve(__dirname, "..");
  const root = resolve(project, "../..");
  const envFile = resolve(root, ".env");
  const content = await fs.readFile(envFile, "utf-8");
  const vars = content
    .split(/\n/g)
    .map(it => it.split("=")[0].trim())
    .filter(it => /^[A-Za-z_][A-Za-z0-9_]+$/.test(it));
  await fs.writeFile(resolve(project, "src/env-shims.d.ts"), shimContent(vars));
}

generateEnvShims().then();
